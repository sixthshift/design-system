import type { Meta, StoryObj } from "@storybook/react";
import { PaletteScales, SpineChart } from "./components";

/**
 * The stories the Palette docs page embeds. Each is a view of the assembled theme read
 * back at render time — nothing here restates a value.
 */
const meta: Meta = {
  title: "Design System/Colors/Palette",
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj;

export const AllScales: Story = {
  render: () => <PaletteScales />,
};

export const Spine: Story = {
  render: () => <SpineChart />,
};

export const Ocean: Story = {
  render: () => <PaletteScales scale="ocean" />,
};

export const Emerald: Story = {
  render: () => <PaletteScales scale="emerald" />,
};

export const Topaz: Story = {
  render: () => <PaletteScales scale="topaz" />,
};

export const Ruby: Story = {
  render: () => <PaletteScales scale="ruby" />,
};

export const Slate: Story = {
  render: () => <PaletteScales scale="slate" />,
};

export const Sky: Story = {
  render: () => <PaletteScales scale="sky" />,
};

export const Earth: Story = {
  render: () => <PaletteScales scale="earth" />,
};
