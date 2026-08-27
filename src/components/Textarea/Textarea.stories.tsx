import { Label } from "@sixthshift/design-system/label";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { componentTokensStory } from "../../stories/recipes/componentTokensStory";
import { Textarea } from "./Textarea";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
    docs: { subtitle: "A multi-line block of free-form text" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

/**
 * Newlines stay newlines: `Enter` inserts one rather than triggering anything.
 */
export const TypingPlay: Story = {
  render: () => <Textarea placeholder="Type your message here..." />,
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole("textbox");

    await userEvent.click(textarea);
    await userEvent.keyboard("first{Enter}second");
    await expect(textarea).toHaveValue("first\nsecond");
  },
};

export const Default: Story = {
  args: {
    placeholder: "Type your message here...",
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: "This is some default text that spans multiple lines.\n\nIt can contain paragraphs too.",
    "aria-label": "Example text",
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

export const ComponentTokens = componentTokensStory("textarea");
