/**
 * The Overview page makes three kinds of claim that rot silently, and this file
 * is what makes each of them fail loudly instead.
 *
 * It used to guard a hand-grouped by-task index of every component. That index
 * is gone — finding a component by name is the sidebar's job, and a second
 * catalog on the landing page was the same duplication that rotted in
 * docs/component-catalog.md. What is left is smaller and sharper:
 *
 *   1. Every in-Storybook link resolves. The "Where to go next" cards point at
 *      story ids by hand; a renamed story would 404 from the first page a new
 *      consumer opens.
 *   2. The component count is right. The page once carried four different counts
 *      (75, 53, 52, 44) while its closing line said the guidance was safe to
 *      take literally. One count survives, in the Components card; this pins it.
 *   3. The list of entry points that break the kebab-case rule is exact. The
 *      page tells you to memorise three exceptions; a fourth appearing without
 *      being named there is worse than not having listed any.
 *   4. The `variant` and `intent` tables match the recipes. Both read as
 *      exhaustive, and both are derivable: tier 3 selects on `data-variant` and
 *      `data-intent`, so a value added to a recipe without being added here
 *      turns the page into a shorter list than the library actually ships.
 *   5. The Markdown tables still compile to tables. This is the quietest failure
 *      of the four: MDX 3 has no table syntax of its own, so without remark-gfm
 *      wired into addon-docs a `| a | b |` block becomes a <p> of literal pipe
 *      characters. Nothing errors, no build fails, and the same tables render
 *      correctly in README.md on GitHub — so the only signal is someone looking
 *      at the page.
 */

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "..", "..");
const MDX = readFileSync(join(HERE, "Overview.mdx"), "utf8");

/** Storybook's `sanitize`: lowercase, collapse punctuation to single dashes. */
const sanitize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[ '’–—―′¿`~!@#$%^&*()_|+\-=?;:",.<>{}[\]\\/]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Storybook's `storyNameFromExport`: `AllTokens` -> `All Tokens` -> `all-tokens`.
 * The second replace keeps acronym boundaries (`RewireACell` -> `Rewire A Cell`).
 */
const exportToId = (name: string) => sanitize(name.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2").replace(/([a-z0-9])([A-Z])/g, "$1 $2"));

type Story = { title: string; file: string; exports: string[] };

/** Every story file under `src/`, with its declared title and story exports. */
function stories(dir: string = SRC, found: Story[] = []): Story[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      stories(path, found);
    } else if (entry.name.endsWith(".stories.tsx")) {
      const source = readFileSync(path, "utf8");
      const title = /title: "([^"]+)"/.exec(source)?.[1];
      if (title) {
        found.push({ title, file: path, exports: Array.from(source.matchAll(/^export const (\w+)/gm), (m) => m[1]) });
      }
    }
  }
  return found;
}

/** Every `?path=/docs/…` and `?path=/story/…` target linked from the page. */
const linkedIds = (kind: "docs" | "story") => new Set(Array.from(MDX.matchAll(new RegExp(`\\?path=/${kind}/([a-z0-9-]+)`, "g")), (m) => m[1]));

describe("Overview page", () => {
  it("links only to docs pages that exist", () => {
    const known = new Set(stories().map((s) => `${sanitize(s.title)}--docs`));
    expect([...linkedIds("docs")].filter((id) => !known.has(id))).toEqual([]);
  });

  it("links only to stories that exist", () => {
    const known = new Set(stories().flatMap((s) => s.exports.map((name) => `${sanitize(s.title)}--${exportToId(name)}`)));
    expect([...linkedIds("story")].filter((id) => !known.has(id))).toEqual([]);
  });

  it("states the number of components it actually documents", () => {
    const documented = stories().filter((s) => s.title.startsWith("Components/")).length;
    const claimed = Array.from(MDX.matchAll(/\ball (\d+), alphabetical\b/g), (m) => Number(m[1]));

    // Assert the claim still exists before comparing it: a silently deleted
    // count leaves an empty array, which every equality check below passes.
    expect(claimed).toHaveLength(1);
    expect(claimed).toEqual([documented]);
  });

  it("names every entry point that breaks the kebab-case rule", () => {
    const { exports } = JSON.parse(readFileSync(join(SRC, "..", "package.json"), "utf8"));
    const kebab = (segment: string) => segment.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

    const breaks = Object.entries(exports as Record<string, { types?: string }>)
      .filter(([, value]) => value.types?.includes("/components/"))
      .filter(([subpath, value]) => {
        const dirs = /components\/(.+)\/index/.exec(value.types as string)?.[1] ?? "";
        return subpath !== `./${dirs.split("/").map(kebab).join("-")}`;
      })
      .map(([subpath]) => subpath.slice(2))
      .sort();

    // Exactly these are called out by name on the page. A new one must be too.
    expect(breaks).toEqual(["code-editor-workspace", "datetime-picker", "datetime-range-picker"]);
    for (const subpath of breaks) expect(MDX).toContain(`\`${subpath}\``);
  });

  /** `| `solid` | Filled… | Button, Toggle |` -> ["solid", "Filled…", "Button, Toggle"]. */
  function tableRows(header: string): string[][] {
    const start = MDX.indexOf(header);
    expect(start, `no table headed ${header}`).toBeGreaterThan(-1);
    const body = MDX.slice(start).split("\n\n")[0].split("\n").slice(2); // drop header + delimiter
    return body.map((line) =>
      line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim())
    );
  }

  /** Every `data-variant` / `data-intent` value tier 3 selects on, by recipe. */
  function declared(attribute: "variant" | "intent"): Map<string, Set<string>> {
    const dir = join(SRC, "theme", "recipes");
    const byValue = new Map<string, Set<string>>();
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".css") && f !== "index.css")) {
      const component = file
        .replace(/\.css$/, "")
        .split("-")
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join("");
      for (const [, value] of readFileSync(join(dir, file), "utf8").matchAll(new RegExp(`data-${attribute}="([a-z]+)"`, "g"))) {
        byValue.set(value, (byValue.get(value) ?? new Set()).add(component));
      }
    }
    return byValue;
  }

  it("lists exactly the variants the recipes define, and where each ships", () => {
    const rows = tableRows("| `variant` | Treatment | Ships on |");
    const real = declared("variant");

    expect(rows.map((r) => r[0].replaceAll("`", "")).sort()).toEqual([...real.keys()].sort());

    for (const [value, , shipsOn] of rows) {
      const claimed = shipsOn.split(",").map((name) => name.trim());
      expect(claimed.sort(), `"Ships on" for ${value}`).toEqual([...(real.get(value.replaceAll("`", "")) ?? [])].sort());
    }
  });

  it("lists exactly the intents the recipes define", () => {
    const rows = tableRows("| `intent` | Meaning |");
    expect(rows.map((r) => r[0].replaceAll("`", "")).sort()).toEqual([...declared("intent").keys()].sort());
  });

  it("has remark-gfm wired up as long as it renders tables", () => {
    // A delimiter row (`| --- | --- |`) is the thing GFM adds and MDX lacks.
    const usesTables = /^\|[\s:|-]+\|$/m.test(MDX);
    if (!usesTables) return;

    const main = readFileSync(join(SRC, "..", ".storybook", "main.ts"), "utf8");
    expect(main).toMatch(/import remarkGfm from "remark-gfm"/);
    expect(main).toMatch(/remarkPlugins:\s*\[remarkGfm\]/);
  });
});
