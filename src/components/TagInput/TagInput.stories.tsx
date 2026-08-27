import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { TagInput } from "./TagInput";

const meta: Meta<typeof TagInput> = {
  title: "Components/Inputs/TagInput",
  component: TagInput,
  parameters: {
    layout: "centered",
    docs: { subtitle: "A controlled token field for tags, rendered as removable TagChips" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TagInput>;

/**
 * `TagInput` is controlled, so every story owns the value. The `id` prop exists
 * so the field can be labelled the ordinary way — once tags are present the
 * placeholder is dropped, and a placeholder was the only accessible name the
 * field had.
 */
const TagInputDemo = ({ initial = [] as string[] }) => {
  const [tags, setTags] = useState(initial);
  return (
    <div className="w-80 space-y-2">
      <label htmlFor="tags" className="font-medium text-sm">
        Tags
      </label>
      <TagInput id="tags" value={tags} onChange={setTags} />
    </div>
  );
};

export const Default: Story = {
  render: () => <TagInputDemo />,
};

export const WithTags: Story = {
  render: () => <TagInputDemo initial={["urgent", "project:website"]} />,
};

export const CommitsOnEnter: Story = {
  render: () => <TagInputDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByLabelText("Tags");

    await userEvent.type(field, "urgent{Enter}");
    await expect(canvas.getByRole("button", { name: "Remove urgent" })).toBeInTheDocument();

    // Backspace on an empty field removes the last tag, so the whole keyboard
    // path — commit and undo — is exercised where axe can see the result.
    await userEvent.type(field, "{Backspace}");
    await expect(canvas.queryByRole("button", { name: "Remove urgent" })).not.toBeInTheDocument();
  },
};
