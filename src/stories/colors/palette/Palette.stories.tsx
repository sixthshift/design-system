import type { Meta, StoryObj } from "@storybook/react";
import { readPalette } from "../theme/read-tokens";
import { ColorSwatch } from "./components";

const meta: Meta = {
  title: "Design System/Palette",
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj;

function ColorScale({ name, scale }: { name: string; scale: string }) {
  const steps = readPalette()[scale] ?? {};
  return (
    <div className="mb-8">
      <h3 className="mb-3 font-semibold text-lg">{name}</h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(steps).map(([step, hex]) => (
          <ColorSwatch key={step} hex={hex} label={step} />
        ))}
      </div>
    </div>
  );
}

export const AllScales: Story = {
  render: () => (
    <div className="space-y-8">
      <ColorScale name="Slate" scale="slate" />
      <ColorScale name="Ocean" scale="ocean" />
      <ColorScale name="Sky" scale="sky" />
      <ColorScale name="Earth" scale="earth" />
      <ColorScale name="Emerald" scale="emerald" />
      <ColorScale name="Topaz" scale="topaz" />
      <ColorScale name="Ruby" scale="ruby" />
    </div>
  ),
};

export const Slate: Story = {
  render: () => <ColorScale name="Slate" scale="slate" />,
};

export const Ocean: Story = {
  render: () => <ColorScale name="Ocean" scale="ocean" />,
};

export const Sky: Story = {
  render: () => <ColorScale name="Sky" scale="sky" />,
};

export const Earth: Story = {
  render: () => <ColorScale name="Earth" scale="earth" />,
};

export const Emerald: Story = {
  render: () => <ColorScale name="Emerald" scale="emerald" />,
};

export const Topaz: Story = {
  render: () => <ColorScale name="Topaz" scale="topaz" />,
};

export const Ruby: Story = {
  render: () => <ColorScale name="Ruby" scale="ruby" />,
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
