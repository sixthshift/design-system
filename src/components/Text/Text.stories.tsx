import { Heading } from "@sixthshift/design-system/heading";
import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "./Text";

const meta: Meta<typeof Text> = {
  title: "Components/Display/Text",
  component: Text,
  parameters: {
    layout: "centered",
    docs: { subtitle: "Polymorphic text primitive with no built-in styling" },
  },
  tags: ["autodocs"],
  argTypes: {
    as: {
      control: "select",
      options: ["span", "p", "div", "label", "h1", "h2", "h3", "h4", "h5", "h6"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: {
    children: "This is default text.",
  },
};

export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Text className="text-fg-normal">Default text color</Text>
      <Text className="text-fg-subtle">Subtle text for secondary info</Text>
      <Text className="text-fg-strong">Strong emphasis (dark)</Text>
      <Text className="text-fg-brand">Brand accent color</Text>
      <Text className="text-fg-danger">Danger/error color</Text>
      <Text className="text-fg-success">Success color</Text>
      <Text className="text-fg-warning">Warning color</Text>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Text className="text-xs">Extra small text (xs)</Text>
      <Text className="text-sm">Small text (sm)</Text>
      <Text className="text-base">Base text size</Text>
      <Text className="text-lg">Large text (lg)</Text>
      <Text className="text-xl">Extra large text (xl)</Text>
      <Text className="text-2xl">2XL text</Text>
    </div>
  ),
};

export const Weights: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Text className="font-normal">Normal weight</Text>
      <Text className="font-medium">Medium weight</Text>
      <Text className="font-semibold">Semibold weight</Text>
      <Text className="font-bold">Bold weight</Text>
    </div>
  ),
};

export const AsSpan: Story = {
  render: () => (
    <p>
      This is a paragraph with{" "}
      <Text as="span" className="font-semibold text-fg-brand">
        inline styled text
      </Text>{" "}
      in the middle.
    </p>
  ),
};

export const Headings: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Heading as="h1">Heading 1</Heading>
      <Heading as="h2">Heading 2</Heading>
      <Heading as="h3">Heading 3</Heading>
      <Heading as="h4">Heading 4</Heading>
      <Heading as="h5">Heading 5</Heading>
      <Heading as="h6">Heading 6</Heading>
    </div>
  ),
};

export const ArticleExample: Story = {
  render: () => (
    <article className="max-w-lg space-y-4">
      <Heading as="h1">Getting Started</Heading>
      <Text className="text-fg-subtle">Published December 15, 2025</Text>
      <Text>
        This design system ships tokens, a theme pipeline, and a React component library. Install it as a versioned dependency and configure it through the
        theme surface.
      </Text>
      <Heading as="h2">Installation</Heading>
      <Text>Getting started is easy. Install the package from npm, then import the components you need via their subpaths.</Text>
      <Heading as="h3">Using Docker</Heading>
      <Text className="text-fg-subtle text-sm">Docker is the recommended method for most users.</Text>
    </article>
  ),
};
