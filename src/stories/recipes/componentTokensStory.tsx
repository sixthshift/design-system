import { Text } from "@sixthshift/design-system/text";
import type { StoryObj } from "@storybook/react";
import { RecipeTables } from "./components/RecipeTables";

/**
 * The tier-3 reference for one component, as a story it can own.
 *
 * A component's tokens belong beside the component: reading Button's docs and
 * having to leave for a global table to find out what `--button-bg` does is the
 * cross-referencing cost of centralising this. Every component story file
 * carries `tags: ["autodocs"]`, so adding this story puts the table in that
 * component's Docs tab as well as its sidebar entry.
 *
 * Hooks are named explicitly rather than inferred. Inference looked tempting —
 * derive the hook from the component name — but `Button` uses `.btn`, and
 * scanning source for the bare word matches the `switch` keyword, `input`
 * variables and `card` inside `StatsCard`. An explicit list is greppable, and
 * `bun run check:recipes` fails if a recipe has no component claiming it.
 *
 * The story shows up in the component's sidebar as well as its Docs tab. Hiding
 * it from the sidebar would need a static `tags: ["!dev"]` in the story file
 * itself — Storybook indexes CSF by static analysis, so a tag returned from this
 * helper is invisible to it.
 *
 * Story-only. `src/stories` is excluded from the published package.
 */
export function componentTokensStory(...hooks: string[]): StoryObj {
  return {
    name: "Component tokens",
    parameters: {
      layout: "padded",
      // The table documents the recipe, not this component's props.
      controls: { disable: true },
      docs: {
        description: {
          story:
            "Every colour this component paints comes from one of these tokens. Re-point any of them from your own stylesheet to restyle it — see Design System → Component Tokens → Overrides.",
        },
      },
    },
    render: () => (
      <div className="flex flex-col gap-6">
        <Text as="p" className="max-w-3xl text-fg-subtle">
          Read from the shipped stylesheet at render time, so this cannot drift from <code className="font-mono text-xs">src/theme/recipes/</code>. Each row is
          a recipe cell; each swatch is what the token actually computes to. A token shown as <em>unset</em> is deliberately undeclared so it inherits.
        </Text>
        {(["light", "dark"] as const).map((mode) => (
          <section key={mode} className="flex flex-col gap-2">
            <Text as="span" className="text-fg-subtle text-xs uppercase tracking-wide">
              {mode}
            </Text>
            <RecipeTables mode={mode} hooks={hooks} />
          </section>
        ))}
      </div>
    ),
  };
}
