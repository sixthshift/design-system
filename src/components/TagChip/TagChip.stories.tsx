import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { componentTokensStory } from "../../stories/recipes/componentTokensStory";
import { TagChip } from "./TagChip";

const meta: Meta<typeof TagChip> = {
  title: "Components/Display/TagChip",
  component: TagChip,
  parameters: {
    layout: "centered",
    docs: { subtitle: "One rendered tag, navigable or removable" },
  },
  tags: ["autodocs"],
  argTypes: {
    tag: {
      control: "text",
    },
    size: {
      control: "select",
      options: ["sm", "default"],
    },
    onRemove: {
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof TagChip>;

export const Default: Story = {
  args: {
    tag: "urgent",
  },
};

export const Namespaced: Story = {
  args: {
    tag: "project:website",
  },
  parameters: {
    docs: {
      description: {
        story: "A `namespace:value` tag renders the namespace muted so the value is what the eye lands on.",
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <TagChip tag="project:website" size="sm" />
      <TagChip tag="project:website" size="default" />
    </div>
  ),
};

export const Removable: Story = {
  args: {
    tag: "urgent",
    onRemove: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: "Passing `onRemove` switches the chip into its removable mode. The × is a real button, labelled `Remove <tag>`.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Reachable and named — the × is the only interactive part of a chip, and it
    // is an icon-only control, so its accessible name is all a screen reader has.
    const remove = within(canvasElement).getByRole("button", { name: "Remove urgent" });
    await remove.focus();
    await expect(remove).toHaveFocus();
    await userEvent.keyboard("{Enter}");
  },
};

export const List: Story = {
  render: () => (
    <div className="flex max-w-sm flex-wrap gap-1.5">
      {["urgent", "project:website", "person:jane", "waiting", "context:deep-work"].map((tag) => (
        <TagChip key={tag} tag={tag} />
      ))}
    </div>
  ),
};

export const ComponentTokens = componentTokensStory("tag-chip");
