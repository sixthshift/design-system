import { Button } from "@sixthshift/design-system/button";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { componentTokensStory } from "../../stories/component-tokens/componentTokensStory";
import { Steps } from "./Steps";

const CHECKOUT = [{ label: "Cart" }, { label: "Delivery" }, { label: "Details" }, { label: "Payment" }];

const ONBOARDING = [
  { label: "Account", description: "Email and password" },
  { label: "Profile", description: "Name and photo" },
  { label: "Preferences", description: "Notifications" },
];

const meta: Meta<typeof Steps> = {
  title: "Components/Steps",
  component: Steps,
  parameters: {
    layout: "padded",
    docs: { subtitle: "Progress through a fixed sequence of steps" },
  },
  tags: ["autodocs"],
  args: { steps: CHECKOUT, current: 1, "aria-label": "Checkout progress" },
};

export default meta;
type Story = StoryObj<typeof Steps>;

/** Completed steps go back; current and upcoming ones are not buttons at all. */
export const BackPlay: Story = {
  render: function BackPlayStory() {
    const [current, setCurrent] = useState(2);
    return <Steps aria-label="Checkout progress" steps={CHECKOUT} current={current} onStepClick={setCurrent} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("button")).toHaveLength(2);
    await userEvent.click(canvas.getByRole("button", { name: /Cart/ }));
    await expect(canvas.getAllByRole("listitem")[0]).toHaveAttribute("aria-current", "step");
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

export const Default: Story = {};

/** Every state on one surface: first, middle, last and finished. */
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {[0, 1, 3, 4].map((current) => (
        <Steps key={current} aria-label={`Progress at step ${current}`} steps={CHECKOUT} current={current} />
      ))}
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex gap-16">
      <Steps aria-label="Onboarding" orientation="vertical" steps={ONBOARDING} current={1} />
      <Steps aria-label="Onboarding, finished" orientation="vertical" steps={ONBOARDING} current={3} />
    </div>
  ),
};

export const WithDescriptions: Story = {
  args: { steps: ONBOARDING, current: 1, "aria-label": "Onboarding" },
};

export const Wizard: Story = {
  render: function WizardStory() {
    const [current, setCurrent] = useState(0);
    return (
      <div className="flex flex-col gap-6">
        <Steps aria-label="Checkout progress" steps={CHECKOUT} current={current} onStepClick={setCurrent} />
        <div className="flex justify-between">
          <Button variant="outline" disabled={current === 0} onClick={() => setCurrent(current - 1)}>
            Back
          </Button>
          <Button intent="brand" disabled={current === CHECKOUT.length} onClick={() => setCurrent(current + 1)}>
            {current === CHECKOUT.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    );
  },
};

export const ComponentTokens = componentTokensStory("steps-item");
