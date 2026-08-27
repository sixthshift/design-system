import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { RadioButtonGroup } from "./RadioButtonGroup";

const meta: Meta<typeof RadioButtonGroup> = {
  title: "Components/RadioButtonGroup",
  component: RadioButtonGroup,
  parameters: {
    layout: "centered",
    docs: { subtitle: "A set of mutually exclusive radio options, as radios or buttons" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RadioButtonGroup>;

const planOptions = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];

// Default variant (radio button + label)
export const Default: Story = {
  args: {
    value: "free",
    options: planOptions,
    onValueChange: () => {},
  },
};

export const Horizontal: Story = {
  args: {
    value: "pro",
    options: planOptions,
    onValueChange: () => {},
    orientation: "horizontal",
  },
};

export const WithDisabledOption: Story = {
  args: {
    value: "free",
    options: [
      { value: "free", label: "Free" },
      { value: "pro", label: "Pro", disabled: true },
      { value: "enterprise", label: "Enterprise" },
    ],
    onValueChange: () => {},
  },
};

export const AllDisabled: Story = {
  args: {
    value: "pro",
    options: planOptions,
    onValueChange: () => {},
    disabled: true,
  },
};

// Button variant - Segmented
export const ButtonSegmented: Story = {
  args: {
    value: "pro",
    options: planOptions,
    onValueChange: () => {},
    variant: "button",
    appearance: "segmented",
  },
};

export const ButtonSegmentedVertical: Story = {
  args: {
    value: "pro",
    options: planOptions,
    onValueChange: () => {},
    variant: "button",
    appearance: "segmented",
    orientation: "vertical",
  },
};

// Button variant - Separate
export const ButtonSeparate: Story = {
  args: {
    value: "enterprise",
    options: planOptions,
    onValueChange: () => {},
    variant: "button",
    appearance: "separate",
  },
};

export const ButtonSeparateVertical: Story = {
  args: {
    value: "free",
    options: planOptions,
    onValueChange: () => {},
    variant: "button",
    appearance: "separate",
    orientation: "vertical",
  },
};

export const ButtonDisabled: Story = {
  args: {
    value: "pro",
    options: planOptions,
    onValueChange: () => {},
    variant: "button",
    disabled: true,
  },
};

// Controlled examples
export const Controlled: Story = {
  render: function ControlledRadioButtonGroup() {
    const [selected, setSelected] = useState("free");
    return (
      <div className="flex flex-col gap-4">
        <RadioButtonGroup value={selected} onValueChange={setSelected} options={planOptions} aria-label="Select a plan" />
        <p className="text-fg-subtle text-sm">Selected: {selected}</p>
      </div>
    );
  },
};

export const ControlledButton: Story = {
  render: function ControlledButtonRadioButtonGroup() {
    const [selected, setSelected] = useState("pro");
    return (
      <div className="flex flex-col gap-4">
        <RadioButtonGroup value={selected} onValueChange={setSelected} options={planOptions} variant="button" aria-label="Select a plan" />
        <p className="text-fg-subtle text-sm">Selected: {selected}</p>
      </div>
    );
  },
};

export const FormExample: Story = {
  render: function FormRadioButtonGroup() {
    const [selected, setSelected] = useState("free");
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      alert(`Submitted: ${formData.get("plan")}`);
    };
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <RadioButtonGroup name="plan" value={selected} onValueChange={setSelected} options={planOptions} variant="button" aria-label="Select a plan" />
        <button type="submit" className="rounded-md bg-bg-brand px-4 py-2 text-fg-on-brand">
          Submit
        </button>
      </form>
    );
  },
};

export const FrequencySelection: Story = {
  render: function FrequencyRadioButtonGroup() {
    const [frequency, setFrequency] = useState("daily");
    const frequencyOptions = [
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
    ];
    return (
      <div className="flex flex-col gap-4">
        <RadioButtonGroup value={frequency} onValueChange={setFrequency} options={frequencyOptions} variant="button" aria-label="Select frequency" />
        <p className="text-fg-subtle text-sm">You will receive updates {frequency}.</p>
      </div>
    );
  },
};
