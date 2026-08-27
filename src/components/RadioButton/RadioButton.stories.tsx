import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { componentTokensStory } from "../../stories/recipes/componentTokensStory";
import { RadioButton } from "./RadioButton";

const meta: Meta<typeof RadioButton> = {
  title: "Components/Inputs/RadioButton",
  component: RadioButton,
  parameters: {
    layout: "centered",
    docs: { subtitle: "A single custom radio option, usually used inside RadioButtonGroup" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RadioButton>;

export const Default: Story = {
  render: () => <RadioButton label="Radio button" />,
};

export const Checked: Story = {
  render: () => <RadioButton checked label="Selected option" />,
};

export const Disabled: Story = {
  render: () => <RadioButton disabled label="Disabled option" />,
};

export const DisabledChecked: Story = {
  render: () => <RadioButton checked disabled label="Disabled selected" />,
};

export const Controlled: Story = {
  render: function ControlledRadioButton() {
    const [checked, setChecked] = useState(false);
    return (
      <div className="flex flex-col gap-4">
        <RadioButton checked={checked} onCheckedChange={setChecked} label="Click to toggle" />
        <p className="text-fg-subtle text-sm">Selected: {checked ? "Yes" : "No"}</p>
      </div>
    );
  },
};

export const RadioButtonGroup: Story = {
  render: function RadioButtonGroupExample() {
    const [selected, setSelected] = useState("option1");
    return (
      <div className="flex flex-col gap-3">
        {["option1", "option2", "option3"].map((option) => (
          <RadioButton
            key={option}
            name="example-group"
            value={option}
            checked={selected === option}
            onCheckedChange={() => setSelected(option)}
            label={option.charAt(0).toUpperCase() + option.slice(1)}
          />
        ))}
        <p className="mt-2 text-fg-subtle text-sm">Selected: {selected}</p>
      </div>
    );
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <RadioButton label="Unchecked" />
        <RadioButton checked label="Checked" />
      </div>
      <div className="flex items-center gap-4">
        <RadioButton disabled label="Disabled" />
        <RadioButton checked disabled label="Disabled Checked" />
      </div>
    </div>
  ),
};

export const ComponentTokens = componentTokensStory("radio-button");
