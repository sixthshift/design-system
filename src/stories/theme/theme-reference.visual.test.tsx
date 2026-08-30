/**
 * The reference sheet parses tokens.css, so its failure mode is a section going
 * quietly empty — a heading with nothing under it still renders and reads as
 * deliberate. A grouping prefix that stops matching (a renamed variable, a new
 * namespace) drops rows from a page whose entire promise is that it lists
 * everything, and the page is a docs page, so no story test covers it.
 *
 * These assertions hold the rendered sheet against the file it claims to
 * document. Browser project, because the sheet renders in one.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeReference, ThemeTemplate } from "./components";
import { MODE_SELECTORS, modeDeclarations, paletteMap, parseBlocks, resolveValue, rootDeclarations, themeDeclarations } from "./read-theme-source";

/** The rows of the section whose heading starts with `title`. */
const section = (title: string) => {
  const heading = screen.getByRole("heading", { name: new RegExp(`^${title}`) });
  const table = heading.closest("section")?.querySelector("table") as HTMLElement;
  return Array.from(table.querySelectorAll("tbody tr"));
};

describe("the theme reference sheet", () => {
  it("lists every semantic token, in both modes", () => {
    render(<ThemeReference />);
    const declared = modeDeclarations("light");

    expect(section("Semantic colour tokens").length).toBe(declared.length);
    expect(declared.length).toBeGreaterThan(100);
  });

  it("accounts for every variable the file declares", () => {
    render(<ThemeReference />);

    // Sum the groups rather than assert each count: the point is that the
    // prefixes partition the file exhaustively, so a variable added under a
    // prefix nothing matches is caught here rather than silently omitted.
    const grouped = ["Palette", "Tailwind bridge", "Layering", "Motion", "Typography", "Identity"].reduce((total, title) => total + section(title).length, 0);
    expect(grouped).toBe(rootDeclarations().length + themeDeclarations().length);
  });

  it("lists variables Tailwind tree-shakes out of the build", () => {
    render(<ThemeReference />);
    // The whole reason this page parses the source: `--z-index-app-bar` is only
    // emitted into the CSSOM if something in the build writes `z-app-bar`. A
    // reference sheet has to list it either way.
    expect(section("Layering").length).toBe(themeDeclarations().filter((declaration) => declaration.name.startsWith("z-index-")).length);
    expect(screen.getByText("--z-index-app-bar")).toBeInTheDocument();
  });

  it("renders a swatch next to every colour value", () => {
    render(<ThemeReference />);
    const [first] = section("Semantic colour tokens");

    const swatches = first?.querySelectorAll("span[style*='background-color']");
    expect(swatches?.length).toBe(2); // light + dark
    expect(first?.textContent).toMatch(/#|rgb/);
  });

  it("names the utility a colour token compiles into", () => {
    render(<ThemeReference />);
    const row = section("Semantic colour tokens").find((candidate) => candidate.textContent?.startsWith("--bg-danger"));
    expect(row?.textContent).toContain("bg-bg-danger");
  });

  it("filters every section by name", async () => {
    render(<ThemeReference />);
    const before = section("Semantic colour tokens").length;

    await userEvent.type(screen.getByRole("searchbox", { name: /Filter by name/ }), "z-index");

    expect(section("Layering").length).toBeGreaterThan(0);
    expect(screen.queryByRole("heading", { name: /^Semantic colour tokens/ })).not.toBeInTheDocument();
    expect(before).toBeGreaterThan(0);
  });

  it("keeps component tokens out — they belong on each component's Docs tab", () => {
    const { container } = render(<ThemeReference />);
    expect(container.textContent).not.toContain("--button-bg");
  });
});

describe("the starter template", () => {
  /** Parse the emitted CSS back with the same parser the sheet uses. */
  const emitted = (container: HTMLElement) => parseBlocks(container.querySelector("pre")?.textContent ?? "");

  it("emits both mode blocks, with the same token names in each", () => {
    const { container } = render(<ThemeTemplate />);
    const [light, dark] = emitted(container);

    expect(light?.selector).toBe(MODE_SELECTORS.light);
    expect(dark?.selector).toBe(MODE_SELECTORS.dark);

    // The failure this guards is the one the template exists to prevent a
    // consumer making by hand: a token declared in one mode and not the other.
    expect(light?.declarations.map((d) => d.name)).toEqual(dark?.declarations.map((d) => d.name));
    expect(light?.declarations.length).toBeGreaterThan(0);
  });

  it("emits literal values, never a palette reference", () => {
    const { container } = render(<ThemeTemplate />);
    for (const block of emitted(container)) {
      for (const { name, value } of block.declarations) {
        expect(value, name).not.toMatch(/var\(/);
        // A few tokens are authored as keywords (`white`), so ask the browser
        // whether the value is a colour rather than pattern-matching hexes.
        expect(CSS.supports("color", value), `${name}: ${value}`).toBe(true);
      }
    }
  });

  it("narrows to the family being re-skinned", async () => {
    const { container } = render(<ThemeTemplate />);
    const before = emitted(container)[0]?.declarations.length ?? 0;

    await userEvent.selectOptions(screen.getByRole("combobox", { name: /re-skinning/ }), "all");
    const all = emitted(container)[0]?.declarations.length ?? 0;

    expect(all).toBeGreaterThan(before);
    expect(all).toBe(modeDeclarations("light").length);
    expect(emitted(container)[0]?.declarations.every((d) => d.name.includes("brand"))).toBe(false);
  });

  it("matches the shipped values, so the paste is a no-op until edited", () => {
    const { container } = render(<ThemeTemplate />);
    const palette = paletteMap();
    const shipped = new Map(modeDeclarations("light").map((d) => [d.name, resolveValue(d.value, palette)]));

    for (const { name, value } of emitted(container)[0]?.declarations ?? []) {
      expect(value, name).toBe(shipped.get(name));
    }
  });
});
