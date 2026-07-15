import { Label } from "@sixthshift/ui/label";
import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./Textarea";

const meta: Meta<typeof Textarea> = {
  title: "Components/Inputs/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: "Type your message here...",
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: "This is some default text that spans multiple lines.\n\nIt can contain paragraphs too.",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled textarea",
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="message">Your message</Label>
      <Textarea id="message" placeholder="Type your message here..." />
    </div>
  ),
};

export const WithRows: Story = {
  args: {
    placeholder: "This textarea has 10 rows",
    rows: 10,
  },
};

export const MaxLength: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="bio">Bio (max 200 characters)</Label>
      <Textarea id="bio" placeholder="Tell us about yourself..." maxLength={200} />
      <p className="text-fg-subtle text-sm">Maximum 200 characters</p>
    </div>
  ),
};
