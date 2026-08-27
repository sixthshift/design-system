import { Button } from "@sixthshift/design-system/button";
import { Text } from "@sixthshift/design-system/text";
import { TextInline } from "@sixthshift/design-system/text-inline";
import type { Meta, StoryObj } from "@storybook/react";
import { componentTokensStory } from "../../stories/recipes/componentTokensStory";
import { Spinner } from "./Spinner";

const meta: Meta<typeof Spinner> = {
  title: "Components/Spinner",
  component: Spinner,
  parameters: {
    layout: "centered",
    docs: { subtitle: "An animated loading indicator, hidden from assistive tech" },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: {},
};

export const Small: Story = {
  args: {
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
  },
};

export const ExtraLarge: Story = {
  args: {
    size: "xl",
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <Spinner size="sm" />
        <span className="text-fg-subtle text-sm">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="md" />
        <span className="text-fg-subtle text-sm">Default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="lg" />
        <span className="text-fg-subtle text-sm">Large</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="xl" />
        <span className="text-fg-subtle text-sm">Extra Large</span>
      </div>
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <TextInline gap="md">
      <Spinner size="sm" />
      <Text className="text-fg-subtle text-sm">Loading...</Text>
    </TextInline>
  ),
};

export const Centered: Story = {
  render: () => (
    <div className="flex h-40 w-64 items-center justify-center rounded-lg border">
      <Spinner size="lg" />
    </div>
  ),
};

export const InButton: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button disabled>
        <Spinner size="sm" className="text-fg-on-strong" />
        Loading
      </Button>
      <Button variant="outline" disabled>
        <Spinner size="sm" />
        Processing
      </Button>
    </div>
  ),
};

export const PageLoading: Story = {
  render: () => (
    <div className="flex h-64 w-96 flex-col items-center justify-center gap-4 rounded-lg border">
      <Spinner size="xl" />
      <p className="text-fg-subtle">Loading your data...</p>
    </div>
  ),
};

export const CustomColor: Story = {
  render: () => (
    <div className="flex gap-8">
      <Spinner className="text-fg-strong" />
      <Spinner className="text-destructive" />
      <Spinner className="text-success" />
      <Spinner className="text-warning" />
    </div>
  ),
};

export const ComponentTokens = componentTokensStory("spinner");
