import type { Meta, StoryObj } from "@storybook/react";
import { componentTokensStory } from "../../stories/recipes/componentTokensStory";
import { Field } from "./Field";

const meta: Meta<typeof Field> = {
  title: "Components/Display/Field",
  component: Field,
  parameters: {
    layout: "centered",
    docs: { subtitle: "A read-only label/value pair for displaying an identifier" },
  },
  tags: ["autodocs"],
  argTypes: {
    layout: { control: "select", options: ["stacked", "row"] },
    mono: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Field>;

export const Default: Story = {
  args: {
    label: "WhatsApp",
    children: "61400000001@s.whatsapp.net",
  },
};

export const RowLayout: Story = {
  args: {
    label: "Phone",
    children: "+61 400 000 001",
    layout: "row",
    mono: false,
  },
};

export const IdentifiersCard: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3 rounded-lg border border-border-subtle bg-bg-normal p-4">
      <h3 className="font-medium text-fg-normal">Identifiers</h3>
      <div className="flex flex-col gap-3">
        <Field label="Phone" layout="row" mono={false}>
          +61 400 000 001
        </Field>
        <Field label="Email" layout="row" mono={false}>
          mom@example.com
        </Field>
        <Field label="WhatsApp">61400000001@s.whatsapp.net</Field>
        <Field label="Google Contact">people/c1234567890</Field>
      </div>
    </div>
  ),
};

export const LongIdentifierWraps: Story = {
  args: {
    label: "OAuth Subject",
    children: "abcdef1234567890-very-long-identifier-that-must-wrap-not-overflow.apps.googleusercontent.com",
  },
};

export const ProportionalValue: Story = {
  args: {
    label: "Display name",
    children: "Mom",
    mono: false,
  },
};

export const ComponentTokens = componentTokensStory("field");
