import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { CheckboxGroup } from "./CheckboxGroup";

const meta: Meta<typeof CheckboxGroup> = {
  title: "Components/CheckboxGroup",
  component: CheckboxGroup,
  parameters: {
    layout: "centered",
    docs: { subtitle: "A set of checkboxes sharing one selection, as checkboxes or buttons" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CheckboxGroup>;

const defaultOptions = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "push", label: "Push" },
];

// Default variant (checkbox + label)
/**
 * Unlike a radio group, every option is independently selectable and separately
 * tabbable.
 */
export const SelectionPlay: Story = {
  render: function SelectionPlayStory() {
    const [value, setValue] = useState<string[]>([]);
    return <CheckboxGroup value={value} onValueChange={setValue} options={defaultOptions} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const boxes = canvas.getAllByRole("checkbox");

    await userEvent.click(boxes[0]!);
    await userEvent.click(boxes[2]!);
    await expect(boxes[0]!).toHaveAttribute("aria-checked", "true");
    await expect(boxes[1]!).toHaveAttribute("aria-checked", "false");
    await expect(boxes[2]!).toHaveAttribute("aria-checked", "true");
  },
};

export const Default: Story = {
  args: {
    value: [],
    options: defaultOptions,
    onValueChange: () => {},
  },
};

export const WithSelection: Story = {
  args: {
    value: ["email", "push"],
    options: defaultOptions,
    onValueChange: () => {},
  },
};

export const Horizontal: Story = {
  args: {
    value: ["email"],
    options: defaultOptions,
    onValueChange: () => {},
    orientation: "horizontal",
  },
};

export const WithDisabledOption: Story = {
  args: {
    value: ["email"],
    options: [
      { value: "email", label: "Email" },
      { value: "sms", label: "SMS", disabled: true },
      { value: "push", label: "Push" },
    ],
    onValueChange: () => {},
  },
};

export const AllDisabled: Story = {
  args: {
    value: ["email"],
    options: defaultOptions,
    onValueChange: () => {},
    disabled: true,
  },
};

// Button variant - Segmented
export const ButtonSegmented: Story = {
  args: {
    value: ["email"],
    options: defaultOptions,
    onValueChange: () => {},
    variant: "button",
    appearance: "segmented",
  },
};

export const ButtonSegmentedVertical: Story = {
  args: {
    value: ["email", "push"],
    options: defaultOptions,
    onValueChange: () => {},
    variant: "button",
    appearance: "segmented",
    orientation: "vertical",
  },
};

// Button variant - Separate
export const ButtonSeparate: Story = {
  args: {
    value: ["email", "sms"],
    options: defaultOptions,
    onValueChange: () => {},
    variant: "button",
    appearance: "separate",
  },
};

export const ButtonSeparateVertical: Story = {
  args: {
    value: ["push"],
    options: defaultOptions,
    onValueChange: () => {},
    variant: "button",
    appearance: "separate",
    orientation: "vertical",
  },
};

export const ButtonDisabled: Story = {
  args: {
    value: ["email"],
    options: defaultOptions,
    onValueChange: () => {},
    variant: "button",
    disabled: true,
  },
};

// Controlled examples
export const Controlled: Story = {
  render: function ControlledCheckboxGroup() {
    const [selected, setSelected] = useState<string[]>(["email"]);
    return (
      <div className="flex flex-col gap-4">
        <CheckboxGroup value={selected} onValueChange={setSelected} options={defaultOptions} aria-label="Notification preferences" />
        <p className="text-fg-subtle text-sm">Selected: {selected.length > 0 ? selected.join(", ") : "None"}</p>
      </div>
    );
  },
};

export const ControlledButton: Story = {
  render: function ControlledButtonCheckboxGroup() {
    const [selected, setSelected] = useState<string[]>(["email"]);
    return (
      <div className="flex flex-col gap-4">
        <CheckboxGroup value={selected} onValueChange={setSelected} options={defaultOptions} variant="button" aria-label="Notification preferences" />
        <p className="text-fg-subtle text-sm">Selected: {selected.length > 0 ? selected.join(", ") : "None"}</p>
      </div>
    );
  },
};

export const FormExample: Story = {
  render: function FormCheckboxGroup() {
    const [selected, setSelected] = useState<string[]>([]);
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      alert(`Submitted: ${formData.getAll("notifications").join(", ")}`);
    };
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <CheckboxGroup
          name="notifications"
          value={selected}
          onValueChange={setSelected}
          options={defaultOptions}
          variant="button"
          aria-label="Notification preferences"
        />
        <button type="submit" className="rounded-md bg-bg-brand px-4 py-2 text-fg-on-brand">
          Submit
        </button>
      </form>
    );
  },
};
