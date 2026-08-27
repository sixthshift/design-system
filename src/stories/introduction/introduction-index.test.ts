/**
 * The by-task index on the Introduction page is hand-grouped — a human decides
 * that `Sheet` belongs under overlays — and hand-grouped catalogs are exactly
 * what rotted in docs/component-catalog.md.
 *
 * So the grouping stays hand-written and the *membership* is enforced: every
 * component with a story appears in the index at least once, every link points
 * at a story id that exists, and nothing links to a page that was renamed away.
 * A new component fails this test until someone decides where it goes, which is
 * the only part of the index that needs a human.
 */

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url));
const COMPONENTS = join(HERE, "..", "..", "components");

/**
 * Storybook's own id derivation, narrowed to the shape these titles use.
 * `Components/DateTimePicker` -> `components-datetimepicker`: `sanitize` lowers
 * the string and collapses punctuation, but does not split camelCase.
 */
const toId = (title: string) =>
  title
    .toLowerCase()
    .replace(/[ '’–—―′¿`~!@#$%^&*()_|+\-=?;:",.<>{}[\]\\/]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Every `title:` declared by a component story, as its docs-page id.
 *
 * Walks the tree rather than globbing one level deep: the Code editor's stories
 * sit two directories down (`components/Code/Editor/`), and a one-level scan
 * silently passed while they were missing from the index.
 */
function storyDocsIds(dir: string = COMPONENTS, ids = new Map<string, string>()): Map<string, string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      storyDocsIds(path, ids);
    } else if (entry.name.endsWith(".stories.tsx")) {
      const title = /title: "([^"]+)"/.exec(readFileSync(path, "utf8"))?.[1];
      if (title?.startsWith("Components/")) ids.set(`${toId(title)}--docs`, title);
    }
  }
  return ids;
}

/** Every `?path=/docs/…` target linked from the Introduction page. */
function linkedDocsIds(): Set<string> {
  const mdx = readFileSync(join(HERE, "Introduction.mdx"), "utf8");
  return new Set(Array.from(mdx.matchAll(/\?path=\/docs\/([a-z0-9-]+--docs)/g), (m) => m[1]));
}

describe("Introduction index", () => {
  it("links only to docs pages that exist", () => {
    const known = storyDocsIds();
    const broken = [...linkedDocsIds()].filter((id) => !known.has(id));
    expect(broken).toEqual([]);
  });

  it("lists every component that has a story", () => {
    const linked = linkedDocsIds();
    const unlisted = [...storyDocsIds()]
      .filter(([id]) => !linked.has(id))
      .map(([, title]) => title)
      .sort();
    expect(unlisted).toEqual([]);
  });
});
