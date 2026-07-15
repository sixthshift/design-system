import type { Meta, StoryObj } from "@storybook/react";
import { ColorDot } from "./ColorDot";

const meta: Meta<typeof ColorDot> = {
  title: "Components/Display/ColorDot",
  component: ColorDot,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "text",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    pulse: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ColorDot>;

export const Default: Story = {
  args: {
    color: "brand",
  },
};

export const IntentColors: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {(["neutral", "brand", "success", "warning", "danger"] as const).map((color) => (
        <div key={color} className="flex flex-col items-center gap-2">
          <ColorDot color={color} />
          <span className="text-fg-subtle text-xs">{color}</span>
        </div>
      ))}
    </div>
  ),
};

export const ArbitraryColors: Story = {
  render: () => {
    const colors = [
      { value: "#6366f1", label: "Indigo" },
      { value: "#ec4899", label: "Pink" },
      { value: "#14b8a6", label: "Teal" },
      { value: "#f97316", label: "Orange" },
      { value: "#8b5cf6", label: "Violet" },
      { value: "#06b6d4", label: "Cyan" },
    ];

    return (
      <div className="flex items-center gap-6">
        {colors.map(({ value, label }) => (
          <div key={value} className="flex flex-col items-center gap-2">
            <ColorDot color={value} />
            <span className="text-fg-subtle text-xs">{label}</span>
          </div>
        ))}
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <ColorDot color="brand" size={size} />
          <span className="text-fg-subtle text-xs">{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const Pulse: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {(["neutral", "success", "warning", "danger"] as const).map((color) => (
        <div key={color} className="flex flex-col items-center gap-2">
          <ColorDot color={color} pulse />
          <span className="text-fg-subtle text-xs">{color}</span>
        </div>
      ))}
    </div>
  ),
};

export const StatusIndicator: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm">
        <ColorDot color="success" />
        <span>Connected</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <ColorDot color="warning" pulse />
        <span>Syncing</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <ColorDot color="danger" />
        <span>Error</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <ColorDot color="neutral" />
        <span>Paused</span>
      </div>
    </div>
  ),
};

export const CalendarExample: Story = {
  render: () => {
    const calendars = [
      { name: "Personal", color: "brand" },
      { name: "Work", color: "success" },
      { name: "Family", color: "#ec4899" },
      { name: "Holidays", color: "#f97316" },
    ];

    return (
      <div className="flex flex-col gap-2">
        {calendars.map((cal) => (
          <div key={cal.name} className="flex items-center gap-2 text-sm">
            <ColorDot color={cal.color} />
            <span>{cal.name}</span>
          </div>
        ))}
      </div>
    );
  },
};
