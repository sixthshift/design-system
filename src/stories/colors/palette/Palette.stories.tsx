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

export const Sand: Story = {
  render: () => <PaletteScales scale="sand" />,
};

export const Blue: Story = {
  render: () => <PaletteScales scale="blue" />,
};

export const Green: Story = {
  render: () => <PaletteScales scale="green" />,
};

export const Amber: Story = {
  render: () => <PaletteScales scale="amber" />,
};

export const Red: Story = {
  render: () => <PaletteScales scale="red" />,
};
