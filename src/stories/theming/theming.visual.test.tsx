/**
 * The Theming page's tables are CSSOM reads, so the way they fail is by
 * going quietly blank — an empty table still renders, still passes axe, and
 * still looks deliberate. Nothing else in the suite would notice, because an
 * MDX docs page is not a story.
 *
 * These are the assertions that would. Browser project, because the stylesheet
 * is the thing under test.
 */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { FamilyAnatomy, PairingDemo, TokenBuilder } from "./components";

const rows = (container: HTMLElement) => Array.from(container.querySelectorAll("tbody tr"));

/** The row whose first cell is exactly this token — `--bg-danger`, not `--bg-danger-subtle`. */
const rowFor = (container: HTMLElement, token: string) => rows(container).find((row) => row.querySelector("td")?.textContent === token);

describe("FamilyAnatomy", () => {
  it("lists every context the family declares, with its utility and both modes", () => {
    const { container } = render(<FamilyAnatomy family="danger" />);
    const text = rows(container).map((row) => row.textContent ?? "");

    // bg / fg / fg-on / border, at three weights for the feedback families —
    // the whole point of showing `danger` is that it exercises every axis.
    // bg × 3 weights, fg, fg-on × 3 weights, border — every axis the grammar
    // allows, which is why `danger` is the family the page shows.
    expect(rows(container).length).toBeGreaterThanOrEqual(8);
    expect(text.some((row) => row.includes("--bg-danger-subtle"))).toBe(true);
    expect(text.some((row) => row.includes("--bg-danger-strong"))).toBe(true);
    expect(text.some((row) => row.includes("--bg-danger") && row.includes("bg-bg-danger"))).toBe(true);
    expect(text.some((row) => row.includes("--fg-on-danger") && row.includes("text-fg-on-danger"))).toBe(true);
    expect(text.some((row) => row.includes("--border-danger") && row.includes("border-border-danger"))).toBe(true);
  });

  it("resolves each token to a real colour in both modes", () => {
    const { container } = render(<FamilyAnatomy family="danger" />);
    const bg = rowFor(container, "--bg-danger");

    const swatches = Array.from(bg?.querySelectorAll("span[style*='background-color']") ?? []);
    expect(swatches.length).toBe(2); // light + dark
    expect(bg?.textContent).toMatch(/#|rgb/);

    // The palette coordinates these values; it is not a reference a consumer may
    // make, so no `var(--color-…)` should ever surface on this page.
    expect(bg?.textContent).not.toMatch(/--color-/);
  });

  it("names the states each token also declares", () => {
    const { container } = render(<FamilyAnatomy family="danger" />);
    const bg = rowFor(container, "--bg-danger");
    expect(bg?.textContent).toContain("-hovered");
    expect(bg?.textContent).toContain("-disabled");
  });
});

describe("PairingDemo", () => {
  it("paints the two correct pairings differently from each other", () => {
    const { container } = render(<PairingDemo />);
    const panels = Array.from(container.querySelectorAll("div[class*='rounded-lg']"));
    expect(panels.length).toBe(3);

    const [onNormal, onDanger, mixedUp] = panels.map((panel) => {
      const style = getComputedStyle(panel);
      return { bg: style.backgroundColor, fg: style.color };
    });

    // fg-danger sits on a normal surface; fg-on-danger sits on the danger one.
    expect(onNormal?.bg).not.toBe(onDanger?.bg);
    expect(onNormal?.fg).not.toBe(onDanger?.fg);

    // The third panel is the mix-up, and it only makes the point if the text and
    // its background really are the same hue — an accident that "fixed" it would
    // leave the page arguing for a distinction it no longer shows.
    expect(mixedUp?.bg).toBe(onDanger?.bg);
    expect(mixedUp?.fg).toBe(onNormal?.fg);
  });
});

describe("TokenBuilder", () => {
  const name = () => screen.getByText(/^--/).textContent;

  it("composes a declared token from its four slots", () => {
    render(<TokenBuilder />);
    expect(name()).toBe("--bg-danger-strong-hovered");
    expect(screen.getByText(/^bg-bg-danger-strong-hovered$/)).toBeInTheDocument();
    expect(screen.queryByText(/Not declared/)).not.toBeInTheDocument();
  });

  it("drops a slot from the name when it is set to none", async () => {
    render(<TokenBuilder />);
    await userEvent.click(screen.getByRole("group", { name: /state/ }).querySelectorAll("input")[0] as HTMLElement);
    expect(name()).toBe("--bg-danger-strong");
  });

  it("says so when the combination the slots name does not exist", async () => {
    render(<TokenBuilder />);
    // The hierarchy trio takes no weight — `--bg-normal-strong` is the gap the
    // page claims is deliberate, so the widget has to actually report it.
    const intents = screen.getByRole("group", { name: /intent/ });
    await userEvent.click(within(intents).getByRole("radio", { name: /^normal/ }));
    expect(name()).toBe("--bg-normal-strong-hovered");
    expect(screen.getByText(/Not declared/)).toBeInTheDocument();
  });

  it("marks the options that would break the current name", () => {
    render(<TokenBuilder />);
    const weights = screen.getByRole("group", { name: /weight/ });
    const marks = Array.from(weights.querySelectorAll("[aria-label='not declared with the current selection']"));
    // `--bg-danger-hovered` and `--bg-danger-subtle-hovered` both exist, so with
    // danger selected nothing in this column is marked. The mark is a real
    // signal, not decoration — assert it stays absent when it should be.
    expect(marks.length).toBe(0);
  });
});
