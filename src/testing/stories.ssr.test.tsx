/**
 * Render every component story through `react-dom/server` in a DOM-less Node
 * process.
 *
 * This is the only suite that exercises the library the way a Next.js App Router
 * consumer's first request does. The `unit` project runs happy-dom, `visual` and
 * `storybook` run a real browser — all three hand the library a `document`, so
 * none of them can catch a module that reads one at import or render scope, and
 * `"use client"` is no protection either: a Client Component is still rendered
 * once on the server.
 *
 * Stories are the fixtures, exactly as they are for the visual suite: they cover
 * the prop combinations that matter and they are already maintained. A story
 * added for any other reason lands here for free.
 *
 * The companion check is scripts/check-use-client.ts, which is static. This one
 * is dynamic: it proves the modules actually execute on a server.
 */
/// <reference types="vite/client" />
// Scoped here rather than in tsconfig.test.json's `types`, which is deliberately
// narrow: `import.meta.glob` is Vite's, and this is the only file that needs it.

import { composeStories } from "@storybook/react";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, test } from "vitest";

/**
 * Story exports skipped across every component, with the reason.
 *
 * No component is exempt. The Monaco-backed `Code/Editor` and `Code/Workspace`
 * looked like the obvious candidates — @monaco-editor/react has no server
 * rendering — but it renders its loading placeholder on the server and hydrates
 * the editor in an effect, so they pass like everything else.
 *
 * `ComponentTokens` is documentation, not a fixture: componentTokensStory()
 * reads the live `document.styleSheets` so the token tables cannot drift from
 * src/theme/recipes/. It lives in src/stories, which is excluded from the
 * published package, so it is not part of the surface this suite guards.
 */
const SKIPPED_STORIES: Record<string, string> = {
  ComponentTokens: "documentation fixture — reads the live stylesheet, and src/stories is not published",
};

type StoryModule = Record<string, unknown>;

// Eager so the glob resolves at collection time and each story file gets its own
// `describe`. Scoped to src/components: src/stories holds documentation pages.
const modules = import.meta.glob<StoryModule>("../components/**/*.stories.tsx", { eager: true });

/** `../components/Code/Editor/Editor.stories.tsx` -> `Code/Editor`. */
function componentKey(path: string): string {
  return path.replace("../components/", "").replace(/\/[^/]+\.stories\.tsx$/, "");
}

const entries = Object.entries(modules)
  .map(([path, module]) => [componentKey(path), module] as const)
  .sort(([a], [b]) => a.localeCompare(b));

// A glob that silently resolved to nothing would turn this whole suite into a
// no-op that reports green.
test("the story glob resolves", () => {
  expect(entries.length).toBeGreaterThan(30);
});

// The skip list shrinks silently if a story is renamed or deleted, which would
// leave a stale exemption reading as coverage.
test.for(Object.keys(SKIPPED_STORIES))("skipped story %s still exists somewhere", (name) => {
  expect(entries.some(([, module]) => name in module)).toBe(true);
});

for (const [key, module] of entries) {
  describe(key, () => {
    const composed = composeStories(module as Parameters<typeof composeStories>[0]);
    const names = Object.keys(composed).filter((name) => SKIPPED_STORIES[name] === undefined);

    test("has at least one story", () => {
      expect(names.length).toBeGreaterThan(0);
    });

    test.for(names)("%s renders on the server", (name) => {
      // `createElement` rather than JSX: the story name is only known at runtime.
      const html = renderToString(createElement(composed[name as keyof typeof composed]));
      expect(typeof html).toBe("string");
    });
  });
}
