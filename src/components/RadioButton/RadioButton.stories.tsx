import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { componentTokensStory } from "../../stories/recipes/componentTokensStory";
import { RadioButton } from "./RadioButton";

const meta: Meta<typeof RadioButton> = {
  title: "Components/RadioButton",
  component: RadioButton,
  parameters: {
    layout: "centered",
    docs: { subtitle: "A single custom radio option, usually used inside RadioButtonGroup" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RadioButton>;

/**
 * The label is part of the hit area, and clicking it focuses the control.
 *
 * Deliberately does not assert what a second click does: this primitive
 * currently un-checks, which the radio pattern says should not happen, and
 * pinning that here would cement it.
 */
export const SelectionPlay: Story = {
  render: function SelectionPlayStory() {
    const [checked, setChecked] = useState(false);
    return <RadioButton checked={checked} onCheckedChange={setChecked} label="Radio button" />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radio = canvas.getByRole("radio");

    await userEvent.click(canvas.getByText("Radio button"));
    await expect(radio).toHaveAttribute("aria-checked", "true");
    await expect(radio).toHaveFocus();
  },
};

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
