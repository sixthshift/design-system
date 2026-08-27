import type { Meta, StoryObj } from "@storybook/react";
import { Bold, Calendar, Italic, LayoutGrid, List, Underline } from "lucide-react";
import { useState } from "react";
import { ToggleGroup } from "./ToggleGroup";

const meta: Meta<typeof ToggleGroup> = {
  title: "Components/Inputs/ToggleGroup",
  component: ToggleGroup,
  parameters: {
    layout: "centered",
    docs: { subtitle: "A single- or multi-select group of toggle buttons" },
  },
  argTypes: {
    type: {
      control: "select",
      options: ["single", "multiple"],
    },
    variant: {
      control: "select",
      options: ["solid", "outline", "ghost"],
    },
    intent: {
      control: "select",
      options: ["neutral", "danger", "success", "warning"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "default", "lg", "icon"],
    },
    appearance: {
      control: "select",
      options: ["segmented", "separate"],
    },
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ToggleGroup>;

const viewOptions = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "day", label: "Day" },
];

const formatOptions = [
  { value: "bold", label: <Bold />, ariaLabel: "Bold" },
  { value: "italic", label: <Italic />, ariaLabel: "Italic" },
  { value: "underline", label: <Underline />, ariaLabel: "Underline" },
];

// ── Single-select ────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    type: "single",
    defaultValue: "week",
    options: viewOptions,
  },
};

export const ControlledSingle: Story = {
  render: function ControlledSingleToggleGroup() {
    const [value, setValue] = useState("month");
    return (
      <div className="flex flex-col items-center gap-4">
        <ToggleGroup type="single" value={value} onValueChange={setValue} options={viewOptions} aria-label="Calendar view" />
        <p className="text-fg-subtle text-sm">Selected: {value}</p>
      </div>
    );
  },
};

// ── Multiple-select ──────────────────────────────────────────────────

export const Multiple: Story = {
  args: {
    type: "multiple",
    defaultValue: ["bold"],
    options: formatOptions,
    size: "icon",
  },
};

export const ControlledMultiple: Story = {
  render: function ControlledMultipleToggleGroup() {
    const [value, setValue] = useState<string[]>(["bold", "italic"]);
    return (
      <div className="flex flex-col items-center gap-4">
        <ToggleGroup type="multiple" value={value} onValueChange={setValue} options={formatOptions} size="icon" aria-label="Text formatting" />
        <p className="text-fg-subtle text-sm">Selected: {value.join(", ") || "none"}</p>
      </div>
    );
  },
};

// ── Icons ────────────────────────────────────────────────────────────

export const WithIcons: Story = {
  args: {
    type: "single",
    defaultValue: "grid",
    options: [
      { value: "grid", label: <LayoutGrid />, ariaLabel: "Grid view" },
      { value: "list", label: <List />, ariaLabel: "List view" },
    ],
    size: "icon",
  },
};

// ── Variants ─────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <ToggleGroup type="single" defaultValue="week" options={viewOptions} variant="outline" aria-label="Outline" />
      <ToggleGroup type="single" defaultValue="week" options={viewOptions} variant="ghost" aria-label="Ghost" />
    </div>
  ),
};

// ── Separate appearance ──────────────────────────────────────────────

export const Separate: Story = {
  args: {
    type: "single",
    defaultValue: "week",
    options: viewOptions,
    appearance: "separate",
  },
};

export const SeparateVariants: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <ToggleGroup type="single" defaultValue="week" options={viewOptions} appearance="separate" variant="outline" aria-label="Outline" />
      <ToggleGroup type="single" defaultValue="week" options={viewOptions} appearance="separate" variant="ghost" aria-label="Ghost" />
    </div>
  ),
};

// ── Orientation ──────────────────────────────────────────────────────

export const Vertical: Story = {
  args: {
    type: "single",
    defaultValue: "week",
    options: viewOptions,
    orientation: "vertical",
  },
};

// ── Sizes ────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <ToggleGroup type="single" defaultValue="week" options={viewOptions} size="xs" aria-label="Extra small" />
      <ToggleGroup type="single" defaultValue="week" options={viewOptions} size="sm" aria-label="Small" />
      <ToggleGroup type="single" defaultValue="week" options={viewOptions} size="default" aria-label="Default" />
      <ToggleGroup type="single" defaultValue="week" options={viewOptions} size="lg" aria-label="Large" />
      <ToggleGroup type="single" defaultValue="week" options={formatOptions} size="icon" aria-label="Icon" />
    </div>
  ),
};

// ── Disabled ─────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: {
    type: "single",
    defaultValue: "week",
    options: viewOptions,
    disabled: true,
  },
};

export const DisabledOption: Story = {
  args: {
    type: "single",
    defaultValue: "week",
    options: [
      { value: "month", label: "Month" },
      { value: "week", label: "Week" },
      { value: "day", label: "Day", disabled: true },
    ],
  },
};

// ── Intents ──────────────────────────────────────────────────────────

export const Intents: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <ToggleGroup type="single" defaultValue="week" options={viewOptions} intent="neutral" aria-label="Neutral" />
      <ToggleGroup type="single" defaultValue="week" options={viewOptions} intent="danger" aria-label="Danger" />
      <ToggleGroup type="single" defaultValue="week" options={viewOptions} intent="success" aria-label="Success" />
      <ToggleGroup type="single" defaultValue="week" options={viewOptions} intent="warning" aria-label="Warning" />
    </div>
  ),
};

export const OutlineIntents: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <ToggleGroup type="single" defaultValue="week" options={viewOptions} variant="outline" intent="neutral" aria-label="Neutral" />
      <ToggleGroup type="single" defaultValue="week" options={viewOptions} variant="outline" intent="danger" aria-label="Danger" />
      <ToggleGroup type="single" defaultValue="week" options={viewOptions} variant="outline" intent="success" aria-label="Success" />
      <ToggleGroup type="single" defaultValue="week" options={viewOptions} variant="outline" intent="warning" aria-label="Warning" />
    </div>
  ),
};

export const GhostIntents: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <ToggleGroup type="single" defaultValue="week" options={viewOptions} variant="ghost" intent="neutral" aria-label="Neutral" />
      <ToggleGroup type="single" defaultValue="week" options={viewOptions} variant="ghost" intent="danger" aria-label="Danger" />
      <ToggleGroup type="single" defaultValue="week" options={viewOptions} variant="ghost" intent="success" aria-label="Success" />
      <ToggleGroup type="single" defaultValue="week" options={viewOptions} variant="ghost" intent="warning" aria-label="Warning" />
    </div>
  ),
};

// ── Realistic example ────────────────────────────────────────────────

export const CalendarViewSwitcher: Story = {
  render: function CalendarViewSwitcherExample() {
    const [view, setView] = useState("week");
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-4 rounded-lg border border-border-normal p-4">
          <Calendar className="size-5 text-fg-subtle" />
          <span className="font-medium text-fg-normal text-sm">February 2026</span>
          <ToggleGroup type="single" value={view} onValueChange={setView} options={viewOptions} size="sm" aria-label="Calendar view" />
        </div>
        <p className="text-fg-subtle text-sm">View: {view}</p>
      </div>
    );
  },
};
