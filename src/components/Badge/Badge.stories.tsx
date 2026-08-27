import { Text } from "@sixthshift/design-system/text";
import { TextInline } from "@sixthshift/design-system/text-inline";
import type { Meta, StoryObj } from "@storybook/react";
import { componentTokensStory } from "../../stories/recipes/componentTokensStory";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Display/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
    docs: { subtitle: "A small status, category, or count label" },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "soft", "outline"],
    },
    intent: {
      control: "select",
      options: ["neutral", "danger", "success", "warning"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: "Badge",
  },
};

export const VariantIntentMatrix: Story = {
  render: () => (
    <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr] items-center gap-3">
      {/* Header row */}
      <div />
      <div className="text-center text-fg-subtle text-sm">neutral</div>
      <div className="text-center text-fg-subtle text-sm">danger</div>
      <div className="text-center text-fg-subtle text-sm">success</div>
      <div className="text-center text-fg-subtle text-sm">warning</div>

      {/* Solid row */}
      <div className="text-fg-subtle text-sm">solid</div>
      <Badge variant="solid" intent="neutral">
        Badge
      </Badge>
      <Badge variant="solid" intent="danger">
        Badge
      </Badge>
      <Badge variant="solid" intent="success">
        Badge
      </Badge>
      <Badge variant="solid" intent="warning">
        Badge
      </Badge>

      {/* Soft row */}
      <div className="text-fg-subtle text-sm">soft</div>
      <Badge variant="soft" intent="neutral">
        Badge
      </Badge>
      <Badge variant="soft" intent="danger">
        Badge
      </Badge>
      <Badge variant="soft" intent="success">
        Badge
      </Badge>
      <Badge variant="soft" intent="warning">
        Badge
      </Badge>

      {/* Outline row */}
      <div className="text-fg-subtle text-sm">outline</div>
      <Badge variant="outline" intent="neutral">
        Badge
      </Badge>
      <Badge variant="outline" intent="danger">
        Badge
      </Badge>
      <Badge variant="outline" intent="success">
        Badge
      </Badge>
      <Badge variant="outline" intent="warning">
        Badge
      </Badge>
    </div>
  ),
};

export const StatusExamples: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TextInline gap="md">
        <Text className="text-sm">Payment Status:</Text>
        <Badge intent="success">Paid</Badge>
      </TextInline>
      <TextInline gap="md">
        <Text className="text-sm">Payment Status:</Text>
        <Badge intent="warning">Pending</Badge>
      </TextInline>
      <TextInline gap="md">
        <Text className="text-sm">Payment Status:</Text>
        <Badge intent="danger">Overdue</Badge>
      </TextInline>
    </div>
  ),
};

export const WithCount: Story = {
  render: () => (
    <div className="flex gap-4">
      <TextInline gap="xs">
        <Text>Notifications</Text>
        <Badge>3</Badge>
      </TextInline>
      <TextInline gap="xs">
        <Text>Messages</Text>
        <Badge variant="soft">12</Badge>
      </TextInline>
    </div>
  ),
};

export const ComponentTokens = componentTokensStory("badge");
