import { FormField } from "@sixthshift/design-system/form-field";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { componentTokensStory } from "../../stories/component-tokens/componentTokensStory";
import { NumberStepper } from "./NumberStepper";

const meta: Meta<typeof NumberStepper> = {
  title: "Components/NumberStepper",
  component: NumberStepper,
  parameters: {
    layout: "centered",
    docs: { subtitle: "A whole-number field with decrement and increment buttons" },
  },
  tags: ["autodocs"],
  args: { "aria-label": "Quantity" },
};

export default meta;
type Story = StoryObj<typeof NumberStepper>;

/**
 * Buttons, arrow keys and typing all land on the same clamped value, and the
 * decrement button disables at the floor.
 */
export const StepPlay: Story = {
  render: function StepPlayStory() {
    const [value, setValue] = useState(1);
    return <NumberStepper aria-label="Quantity" value={value} onValueChange={setValue} min={1} max={5} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton");
    const decrease = canvas.getByRole("button", { name: "Decrease" });

    await expect(decrease).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Increase" }));
    await expect(input).toHaveValue("2");
    await expect(decrease).toBeEnabled();

    await userEvent.click(input);
    await userEvent.keyboard("{End}");
    await expect(input).toHaveValue("5");

    await userEvent.clear(input);
    await userEvent.type(input, "0{Enter}");
    await expect(input).toHaveValue("1");
  },
};

export const Default: Story = {
  args: { defaultValue: 1, min: 1 },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <NumberStepper aria-label="Small" size="sm" defaultValue={1} />
      <NumberStepper aria-label="Medium" size="md" defaultValue={12} />
      <NumberStepper aria-label="Large" size="lg" defaultValue={120} />
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="grid grid-cols-[auto_auto] items-center gap-x-6 gap-y-3 text-fg-subtle text-sm">
      <span>Resting</span>
      <NumberStepper aria-label="Resting" defaultValue={3} max={10} />
      <span>At minimum</span>
      <NumberStepper aria-label="At minimum" defaultValue={0} max={10} />
      <span>At maximum</span>
      <NumberStepper aria-label="At maximum" defaultValue={10} max={10} />
      <span>Read-only</span>
      <NumberStepper aria-label="Read-only" defaultValue={3} readOnly />
      <span>Disabled</span>
      <NumberStepper aria-label="Disabled" defaultValue={3} disabled />
    </div>
  ),
};

/** `FormField` wires its label and description to the input, which is where the ref and unlisted props land. */
export const InFormField: Story = {
  render: () => (
    <div className="w-72">
      <FormField label="Serves" description="In steps of 4, up to 40">
        <NumberStepper defaultValue={8} min={4} max={40} step={4} />
      </FormField>
    </div>
  ),
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState(2);
    return (
      <div className="flex flex-col items-center gap-3">
        <NumberStepper aria-label="Quantity" value={value} onValueChange={setValue} min={1} max={9} />
        <p className="text-fg-subtle text-sm">Quantity: {value}</p>
      </div>
    );
  },
};

export const ComponentTokens = componentTokensStory("number-stepper");
