import { Input } from "@sixthshift/design-system/input";
import { Select } from "@sixthshift/design-system/select";
import { Textarea } from "@sixthshift/design-system/textarea";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { FormField } from "./FormField";

const meta: Meta<typeof FormField> = {
  title: "Components/FormField",
  component: FormField,
  parameters: {
    layout: "centered",
    docs: { subtitle: "A label, description and validation feedback wrapped around a form control" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FormField>;

/**
 * Clicking the label focuses the control it wraps, which is the whole point of
 * the association — and a browser behaviour, not a DOM attribute.
 */
export const LabelAssociationPlay: Story = {
  render: () => (
    <FormField label="Email" description="We will not share it.">
      <Input type="email" placeholder="you@example.com" />
    </FormField>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Email"));
    await expect(canvas.getByRole("textbox")).toHaveFocus();
  },
};

export const Default: Story = {
  args: {
    label: "Email",
  },
  render: (args) => (
    <FormField {...args}>
      <Input type="email" placeholder="you@example.com" />
    </FormField>
  ),
};

export const Required: Story = {
  args: {
    label: "Email",
    required: true,
  },
  render: (args) => (
    <FormField {...args}>
      <Input type="email" placeholder="you@example.com" />
    </FormField>
  ),
};

export const Optional: Story = {
  args: {
    label: "Phone",
  },
  render: (args) => (
    <FormField {...args}>
      <Input type="tel" placeholder="+1 (555) 123-4567" />
    </FormField>
  ),
};

export const WithDescription: Story = {
  args: {
    label: "Email",
    description: "We'll use this to contact you about your order.",
    required: true,
  },
  render: (args) => (
    <FormField {...args}>
      <Input type="email" placeholder="you@example.com" />
    </FormField>
  ),
};

export const WithErrorFeedback: Story = {
  args: {
    label: "Email",
    required: true,
    feedback: {
      message: "Please enter a valid email address.",
      intent: "danger",
    },
  },
  render: (args) => (
    <FormField {...args}>
      <Input type="email" placeholder="you@example.com" defaultValue="invalid" />
    </FormField>
  ),
};

export const WithSuccessFeedback: Story = {
  args: {
    label: "Username",
    required: true,
    feedback: {
      message: "Username is available!",
      intent: "success",
    },
  },
  render: (args) => (
    <FormField {...args}>
      <Input placeholder="Choose a username" defaultValue="johndoe" />
    </FormField>
  ),
};

export const WithWarningFeedback: Story = {
  args: {
    label: "Password",
    required: true,
    feedback: {
      message: "Consider using a stronger password.",
      intent: "warning",
    },
  },
  render: (args) => (
    <FormField {...args}>
      <Input type="password" defaultValue="password123" />
    </FormField>
  ),
};

export const WithTextarea: Story = {
  args: {
    label: "Bio",
    description: "Tell us a bit about yourself.",
  },
  render: (args) => (
    <FormField {...args}>
      <Textarea placeholder="I like long walks on the beach..." />
    </FormField>
  ),
};

export const WithSelect: Story = {
  args: {
    label: "Country",
    required: true,
  },
  render: (args) => (
    <FormField {...args}>
      <Select
        value="us"
        options={[
          { value: "us", label: "United States" },
          { value: "uk", label: "United Kingdom" },
          { value: "ca", label: "Canada" },
        ]}
        onValueChange={() => {}}
        placeholder="Select a country"
      />
    </FormField>
  ),
};

export const FullExample: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      <FormField label="Full Name" required>
        <Input placeholder="John Doe" />
      </FormField>

      <FormField label="Email" description="We'll never share your email." required>
        <Input type="email" placeholder="you@example.com" />
      </FormField>

      <FormField label="Username" feedback={{ message: "Username already taken.", intent: "danger" }} required>
        <Input defaultValue="johndoe" />
      </FormField>

      <FormField label="Bio">
        <Textarea placeholder="Tell us about yourself..." />
      </FormField>
    </div>
  ),
};
