import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { componentTokensStory } from "../../stories/recipes/componentTokensStory";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Inputs/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
    docs: { subtitle: "A boolean or indeterminate toggle" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: () => <Checkbox label="Checkbox" />,
};

export const Checked: Story = {
  render: () => <Checkbox checked label="Selected option" />,
};

export const Indeterminate: Story = {
  render: () => <Checkbox checked="indeterminate" label="Select all" />,
};

export const Disabled: Story = {
  render: () => <Checkbox disabled label="Disabled option" />,
};

export const DisabledChecked: Story = {
  render: () => <Checkbox checked disabled label="Disabled selected" />,
};

export const Controlled: Story = {
  render: function ControlledCheckbox() {
    const [checked, setChecked] = useState(false);
    return (
      <div className="flex flex-col gap-4">
        <Checkbox checked={checked} onCheckedChange={setChecked} label="Click to toggle" />
        <p className="text-fg-subtle text-sm">Selected: {checked ? "Yes" : "No"}</p>
      </div>
    );
  },
};

export const CheckboxGroup: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox label="Option 1" />
      <Checkbox label="Option 2" />
      <Checkbox label="Option 3" />
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Checkbox label="Unchecked" />
        <Checkbox checked label="Checked" />
        <Checkbox checked="indeterminate" label="Indeterminate" />
      </div>
      <div className="flex items-center gap-4">
        <Checkbox disabled label="Disabled" />
        <Checkbox checked disabled label="Disabled Checked" />
      </div>
    </div>
  ),
};

export const ComponentTokens = componentTokensStory("checkbox");
