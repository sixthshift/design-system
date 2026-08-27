import { Badge } from "@sixthshift/design-system/badge";
import { Text } from "@sixthshift/design-system/text";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { TextInline } from "./TextInline";

const meta: Meta<typeof TextInline> = {
  title: "Components/TextInline",
  component: TextInline,
  parameters: {
    layout: "centered",
    docs: { subtitle: "Inline flex row for spacing a group of text fragments" },
  },
  tags: ["autodocs"],
  argTypes: {
    gap: {
      control: "select",
      options: ["none", "xs", "sm", "md", "lg", "xl"],
    },
    align: {
      control: "select",
      options: ["start", "center", "end", "baseline"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextInline>;

/**
 * The children sit on one line with a real gap between them, which is a
 * flex-layout fact rather than a class name.
 */
export const LayoutPlay: Story = {
  render: () => (
    <TextInline>
      <Text>Created by</Text>
      <Text className="font-semibold">John Doe</Text>
    </TextInline>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByText("Created by").getBoundingClientRect();
    const second = canvas.getByText("John Doe").getBoundingClientRect();

    // Same line (overlapping line boxes, not identical tops) and not touching.
    await expect(second.top).toBeLessThan(first.bottom);
    await expect(second.bottom).toBeGreaterThan(first.top);
    await expect(second.left).toBeGreaterThan(first.right);
  },
};

export const Default: Story = {
  render: () => (
    <TextInline>
      <Text>Created by</Text>
      <Text className="font-semibold">John Doe</Text>
    </TextInline>
  ),
};

export const GapSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <Text className="text-fg-subtle text-sm">gap="none"</Text>
        <TextInline gap="none">
          <Text>Status:</Text>
          <Text className="font-semibold">Active</Text>
        </TextInline>
      </div>
      <div>
        <Text className="text-fg-subtle text-sm">gap="xs"</Text>
        <TextInline gap="xs">
          <Text>Status:</Text>
          <Text className="font-semibold">Active</Text>
        </TextInline>
      </div>
      <div>
        <Text className="text-fg-subtle text-sm">gap="sm" (default)</Text>
        <TextInline gap="sm">
          <Text>Status:</Text>
          <Text className="font-semibold">Active</Text>
        </TextInline>
      </div>
      <div>
        <Text className="text-fg-subtle text-sm">gap="md"</Text>
        <TextInline gap="md">
          <Text>Status:</Text>
          <Text className="font-semibold">Active</Text>
        </TextInline>
      </div>
      <div>
        <Text className="text-fg-subtle text-sm">gap="lg"</Text>
        <TextInline gap="lg">
          <Text>Status:</Text>
          <Text className="font-semibold">Active</Text>
        </TextInline>
      </div>
      <div>
        <Text className="text-fg-subtle text-sm">gap="xl"</Text>
        <TextInline gap="xl">
          <Text>Status:</Text>
          <Text className="font-semibold">Active</Text>
        </TextInline>
      </div>
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <TextInline gap="sm">
      <Text className="text-fg-subtle">Status:</Text>
      <Text className="font-medium">Connected</Text>
    </TextInline>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <TextInline gap="sm">
      <Text>Current status</Text>
      <Badge intent="success">Active</Badge>
    </TextInline>
  ),
};

export const MultipleElements: Story = {
  render: () => (
    <TextInline gap="sm">
      <Text className="text-fg-subtle">Last updated</Text>
      <Text className="font-medium">5 minutes ago</Text>
      <Text className="text-fg-subtle">by</Text>
      <Text className="font-medium">System</Text>
    </TextInline>
  ),
};

export const AlignmentOptions: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <Text className="text-fg-subtle text-sm">align="baseline" (default)</Text>
        <TextInline align="baseline" gap="sm">
          <Text className="font-bold text-2xl">42</Text>
          <Text className="text-fg-subtle">tasks completed</Text>
        </TextInline>
      </div>
      <div>
        <Text className="text-fg-subtle text-sm">align="center"</Text>
        <TextInline align="center" gap="sm">
          <Text className="font-bold text-2xl">42</Text>
          <Text className="text-fg-subtle">tasks completed</Text>
        </TextInline>
      </div>
      <div>
        <Text className="text-fg-subtle text-sm">align="end"</Text>
        <TextInline align="end" gap="sm">
          <Text className="font-bold text-2xl">42</Text>
          <Text className="text-fg-subtle">tasks completed</Text>
        </TextInline>
      </div>
    </div>
  ),
};

export const InParagraph: Story = {
  render: () => (
    <p>
      The integration is currently{" "}
      <TextInline gap="xs">
        <Text className="font-semibold text-fg-success">connected</Text>
        <Text className="text-fg-subtle">and syncing</Text>
      </TextInline>{" "}
      with your account.
    </p>
  ),
};
