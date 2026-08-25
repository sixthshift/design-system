import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBar } from "./ProgressBar";

const meta: Meta<typeof ProgressBar> = {
  title: "Components/Data/ProgressBar",
  component: ProgressBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: {
    completed: 3,
    total: 8,
  },
};

export const Empty: Story = {
  args: {
    completed: 0,
    total: 8,
  },
};

export const Complete: Story = {
  args: {
    completed: 8,
    total: 8,
  },
};

export const WithoutFraction: Story = {
  args: {
    completed: 5,
    total: 8,
    showFraction: false,
  },
};

export const ZeroTotal: Story = {
  args: {
    completed: 0,
    total: 0,
  },
};

export const Stages: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {[0, 1, 2, 4, 6, 8].map((completed) => (
        <ProgressBar key={completed} completed={completed} total={8} />
      ))}
    </div>
  ),
};

export const InListContext: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {[
        { label: "Morning routine", completed: 4, total: 5 },
        { label: "Weekly review", completed: 1, total: 7 },
        { label: "Reading goal", completed: 12, total: 12 },
      ].map(({ label, completed, total }) => (
        <div key={label} className="flex items-center gap-4">
          <span className="w-32 shrink-0 text-fg-normal text-sm">{label}</span>
          <ProgressBar completed={completed} total={total} />
        </div>
      ))}
    </div>
  ),
};
