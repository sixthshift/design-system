import type { Meta, StoryObj } from "@storybook/react";
import palette from "../../theme/palette.json";
import { ColorSwatch } from "./components";

const meta: Meta = {
  title: "Design System/Palette",
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj;

function ColorScale({ name, colors }: { name: string; colors: Record<string, string> }) {
  return (
    <div className="mb-8">
      <h3 className="mb-3 font-semibold text-lg">{name}</h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(colors).map(([key, hex]) => (
          <ColorSwatch key={key} hex={hex} label={key} />
        ))}
      </div>
    </div>
  );
}

export const AllScales: Story = {
  render: () => (
    <div className="space-y-8">
      <ColorScale name="Slate" colors={palette.slate} />
      <ColorScale name="Ocean" colors={palette.ocean} />
      <ColorScale name="Sky" colors={palette.sky} />
      <ColorScale name="Earth" colors={palette.earth} />
      <ColorScale name="Emerald" colors={palette.emerald} />
      <ColorScale name="Topaz" colors={palette.topaz} />
      <ColorScale name="Ruby" colors={palette.ruby} />
    </div>
  ),
};

export const Slate: Story = {
  render: () => <ColorScale name="Slate" colors={palette.slate} />,
};

export const Ocean: Story = {
  render: () => <ColorScale name="Ocean" colors={palette.ocean} />,
};

export const Sky: Story = {
  render: () => <ColorScale name="Sky" colors={palette.sky} />,
};

export const Earth: Story = {
  render: () => <ColorScale name="Earth" colors={palette.earth} />,
};

export const Emerald: Story = {
  render: () => <ColorScale name="Emerald" colors={palette.emerald} />,
};

export const Topaz: Story = {
  render: () => <ColorScale name="Topaz" colors={palette.topaz} />,
};

export const Ruby: Story = {
  render: () => <ColorScale name="Ruby" colors={palette.ruby} />,
};

export const SourceColors: Story = {
  render: () => (
    <div className="flex gap-4">
      <ColorSwatch hex="#0a1128" label="ocean-950" />
      <ColorSwatch hex="#001f54" label="ocean-900" />
      <ColorSwatch hex="#034078" label="ocean-700" />
      <ColorSwatch hex="#1282a2" label="sky-500" />
      <ColorSwatch hex="#fefcfb" label="earth-50" />
    </div>
  ),
};
