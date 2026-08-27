import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Sparkline } from "./Sparkline";

const meta: Meta<typeof Sparkline> = {
  title: "Components/Charts/Sparkline",
  component: Sparkline,
  parameters: {
    layout: "centered",
    docs: { subtitle: "Minimal inline SVG trend line for a table cell or card" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Sparkline>;

/**
 * The trend is a drawn path with a real length, behind a static accessible name.
 */
export const GeometryPlay: Story = {
  render: () => <Sparkline data={[5, 8, 3, 12, 7, 2, 9]} />,
  play: async ({ canvasElement }) => {
    const chart = within(canvasElement).getByRole("img", { name: "Trend line" });
    const line = chart.querySelector<SVGPathElement | SVGPolylineElement>("path[d], polyline[points]")!;

    await expect(line).toBeTruthy();
    if ("getTotalLength" in line) {
      await expect(line.getTotalLength()).toBeGreaterThan(0);
    }
  },
};

export const Default: Story = {
  args: {
    data: [5, 8, 3, 12, 7, 2, 9],
  },
};

export const WithArea: Story = {
  args: {
    data: [5, 8, 3, 12, 7, 2, 9],
    fillArea: true,
  },
};

export const Linear: Story = {
  args: {
    data: [5, 8, 3, 12, 7, 2, 9],
    interpolation: "linear",
  },
};

export const StepAfter: Story = {
  args: {
    data: [5, 8, 3, 12, 7, 2, 9],
    interpolation: "stepAfter",
  },
};

export const StepBefore: Story = {
  args: {
    data: [5, 8, 3, 12, 7, 2, 9],
    interpolation: "stepBefore",
  },
};

export const LargerSize: Story = {
  args: {
    data: [5, 8, 3, 12, 7, 2, 9, 11, 6, 4],
    width: 120,
    height: 32,
    strokeWidth: 2,
  },
};

export const SuccessColor: Story = {
  args: {
    data: [2, 4, 3, 5, 4, 6, 7],
    color: "var(--fg-success)",
    fillArea: true,
  },
};

export const DangerColor: Story = {
  args: {
    data: [8, 6, 7, 4, 5, 3, 2],
    color: "var(--fg-danger)",
    fillArea: true,
  },
};

export const InlineWithText: Story = {
  render: () => (
    <div className="flex items-center gap-6 text-sm">
      <span className="flex items-center gap-2 text-fg-normal">
        Tasks completed
        <Sparkline data={[3, 5, 4, 8, 6, 7, 9]} color="var(--fg-success)" fillArea />
        <span className="font-semibold text-fg-success">72%</span>
      </span>
      <span className="flex items-center gap-2 text-fg-normal">
        Response time
        <Sparkline data={[120, 95, 110, 85, 90, 75, 80]} color="var(--fg-brand)" fillArea />
        <span className="font-semibold text-fg-brand">80ms</span>
      </span>
      <span className="flex items-center gap-2 text-fg-normal">
        Errors
        <Sparkline data={[2, 5, 3, 8, 12, 9, 15]} color="var(--fg-danger)" fillArea />
        <span className="font-semibold text-fg-danger">15</span>
      </span>
    </div>
  ),
};

export const FlatLine: Story = {
  args: {
    data: [5, 5, 5, 5, 5],
  },
};
