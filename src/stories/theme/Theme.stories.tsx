import { Heading } from "@sixthshift/design-system/heading";
import { Text } from "@sixthshift/design-system/text";
import type { Meta, StoryObj } from "@storybook/react";
import theme from "../../theme/theme.json";
import { FocusDemo, FocusRingDemo, InteractiveButton, TokenGroup } from "./components";

const meta: Meta = {
  title: "Design System/Theme",
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj;

// Convert theme tokens to CSS custom properties for inline styles
const lightThemeVars = Object.fromEntries(Object.entries(theme.light).map(([key, value]) => [`--${key}`, value])) as React.CSSProperties;

const darkThemeVars = Object.fromEntries(Object.entries(theme.dark).map(([key, value]) => [`--${key}`, value])) as React.CSSProperties;

const baseTokens = {
  Background: [
    "bg-normal",
    "bg-subtle",
    "bg-strong",
    "bg-brand-subtle",
    "bg-brand",
    "bg-brand-strong",
    "bg-success-subtle",
    "bg-success",
    "bg-success-strong",
    "bg-warning-subtle",
    "bg-warning",
    "bg-warning-strong",
    "bg-danger-subtle",
    "bg-danger",
    "bg-danger-strong",
  ],
  Foreground: [
    "fg-normal",
    "fg-subtle",
    "fg-strong",
    "fg-on-strong",
    "fg-brand",
    "fg-on-brand-subtle",
    "fg-on-brand",
    "fg-on-brand-strong",
    "fg-success",
    "fg-on-success-subtle",
    "fg-on-success",
    "fg-warning",
    "fg-on-warning-subtle",
    "fg-on-warning",
    "fg-danger",
    "fg-on-danger-subtle",
    "fg-on-danger",
  ],
  Border: [
    "border-normal",
    "border-subtle",
    "border-strong",
    "border-brand-subtle",
    "border-brand",
    "border-brand-strong",
    "border-success",
    "border-warning",
    "border-danger",
  ],
};

export const AllTokens: Story = {
  parameters: {
    a11y: {
      // This story is a catalogue of every token pair, including the -disabled
      // pairs, which are intentionally low-contrast. WCAG 1.4.3 exempts inactive
      // components, and a swatch documenting the disabled palette is not a control.
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
  },
  render: () => (
    <div className="space-y-8">
      <div>
        <Heading as="h2">{theme.name} Theme</Heading>
        <Text className="text-fg-subtle">Version {theme.version}</Text>
      </div>
      <div
        className="space-y-6 rounded-lg p-6"
        style={{
          ...lightThemeVars,
          backgroundColor: "var(--bg-subtle)",
          color: "var(--fg-normal)",
        }}
      >
        <Text className="font-medium text-fg-subtle text-sm">Light</Text>
        <TokenGroup title="Background" tokens={baseTokens.Background} type="bg" mode="light" />
        <TokenGroup title="Foreground" tokens={baseTokens.Foreground} type="fg" mode="light" />
        <TokenGroup title="Border" tokens={baseTokens.Border} type="border" mode="light" />
        <FocusRingDemo mode="light" />
      </div>
      <div
        className="space-y-6 rounded-lg p-6"
        style={{
          ...darkThemeVars,
          backgroundColor: "var(--bg-subtle)",
          color: "var(--fg-normal)",
        }}
      >
        <Text className="font-medium text-fg-subtle text-sm">Dark</Text>
        <TokenGroup title="Background" tokens={baseTokens.Background} type="bg" mode="dark" />
        <TokenGroup title="Foreground" tokens={baseTokens.Foreground} type="fg" mode="dark" />
        <TokenGroup title="Border" tokens={baseTokens.Border} type="border" mode="dark" />
        <FocusRingDemo mode="dark" />
      </div>
    </div>
  ),
};

export const InteractiveStates: Story = {
  parameters: {
    a11y: {
      // This story is a catalogue of every token pair, including the -disabled
      // pairs, which are intentionally low-contrast. WCAG 1.4.3 exempts inactive
      // components, and a swatch documenting the disabled palette is not a control.
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
  },
  render: () => (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div
        className="space-y-6 rounded-xl p-6"
        style={{
          ...lightThemeVars,
          backgroundColor: "var(--bg-subtle)",
          color: "var(--fg-normal)",
        }}
      >
        <Heading as="h3">Light Mode</Heading>
        <InteractiveButton variant="brand-subtle" label="Brand Subtle" />
        <InteractiveButton variant="brand" label="Brand" />
        <InteractiveButton variant="brand-strong" label="Brand Strong" />
        <InteractiveButton variant="strong" label="Strong (neutral)" />
        <InteractiveButton variant="normal" label="Normal (neutral)" />
        <InteractiveButton variant="success-subtle" label="Success Subtle" />
        <InteractiveButton variant="success" label="Success" />
        <InteractiveButton variant="success-strong" label="Success Strong" />
        <InteractiveButton variant="warning-subtle" label="Warning Subtle" />
        <InteractiveButton variant="warning" label="Warning" />
        <InteractiveButton variant="warning-strong" label="Warning Strong" />
        <InteractiveButton variant="danger-subtle" label="Danger Subtle" />
        <InteractiveButton variant="danger" label="Danger" />
        <InteractiveButton variant="danger-strong" label="Danger Strong" />
        <FocusDemo />
      </div>
      <div
        className="space-y-6 rounded-xl p-6"
        style={{
          ...darkThemeVars,
          backgroundColor: "var(--bg-subtle)",
          color: "var(--fg-normal)",
        }}
      >
        <Heading as="h3">Dark Mode</Heading>
        <InteractiveButton variant="brand-subtle" label="Brand Subtle" />
        <InteractiveButton variant="brand" label="Brand" />
        <InteractiveButton variant="brand-strong" label="Brand Strong" />
        <InteractiveButton variant="strong" label="Strong (neutral)" />
        <InteractiveButton variant="normal" label="Normal (neutral)" />
        <InteractiveButton variant="success-subtle" label="Success Subtle" />
        <InteractiveButton variant="success" label="Success" />
        <InteractiveButton variant="success-strong" label="Success Strong" />
        <InteractiveButton variant="warning-subtle" label="Warning Subtle" />
        <InteractiveButton variant="warning" label="Warning" />
        <InteractiveButton variant="warning-strong" label="Warning Strong" />
        <InteractiveButton variant="danger-subtle" label="Danger Subtle" />
        <InteractiveButton variant="danger" label="Danger" />
        <InteractiveButton variant="danger-strong" label="Danger Strong" />
        <FocusDemo />
      </div>
    </div>
  ),
};
