import { Heading } from "@sixthshift/design-system/heading";
import { Text } from "@sixthshift/design-system/text";
import type { Meta, StoryObj } from "@storybook/react";
import { RecipeTables } from "./components/RecipeTables";

/**
 * The whole of tier 3 on one page — the system-wide index.
 *
 * Each component also carries its own tokens in its Docs tab (see
 * componentTokensStory.tsx), which is where you look when you are working on
 * that component. This page is for the other question: what does the layer look
 * like as a whole, and is it consistent across components.
 *
 * Read out of the shipped CSS at render time, so it cannot drift from the
 * recipes. Both modes sit on one page because `data-theme` is matched on
 * `:root`; a pinned subtree is the only way to show them together.
 */
const meta: Meta = {
  title: "Design System/Component Tokens",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Tier 3 of the token system. Components name no colours; each reads its own `--{component}-*` tokens, and a recipe in `src/theme/recipes/` decides their values per variant, intent and state. These names are public API — consumers re-point them to restyle a component without touching its source.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const MODES = [
  { mode: "light" as const, label: "Light" },
  { mode: "dark" as const, label: "Dark" },
];

/** Every recipe, both modes. The index; per-component tables live on each component. */
export const Reference: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      <div className="flex max-w-3xl flex-col gap-2">
        <Heading as="h2">Component tokens</Heading>
        <Text as="p" className="text-fg-subtle">
          Read from the shipped stylesheet at render time. Each row is a recipe cell — the floor plus one row per{" "}
          <code className="font-mono text-xs">data-*</code> combination — and each swatch is what the token actually computes to, resolved through the same
          cascade a browser uses. A token shown as <em>unset</em> is deliberately undeclared so it inherits.
        </Text>
        <Text as="p" className="text-fg-subtle">
          Working on one component? Its tokens are on its own Docs tab.
        </Text>
      </div>
      {MODES.map(({ mode, label }) => (
        <section key={mode} className="flex flex-col gap-3">
          <Heading as="h2">{label}</Heading>
          <RecipeTables mode={mode} />
        </section>
      ))}
    </div>
  ),
};
