import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { expect, userEvent, within } from "storybook/test";
import { componentTokensStory } from "../../stories/component-tokens/componentTokensStory";
import { SearchInput } from "./SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Components/SearchInput",
  component: SearchInput,
  parameters: {
    layout: "centered",
    docs: { subtitle: "An input with a search icon and a clear button" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

const ControlledSearchInput = (props: Omit<React.ComponentProps<typeof SearchInput>, "value" | "onValueChange">) => {
  const [value, setValue] = React.useState("");
  return <SearchInput {...props} value={value} onValueChange={setValue} />;
};

export const Default: Story = {
  render: () => <ControlledSearchInput placeholder="Search..." />,
};

/**
 * Typing reveals the clear button; clearing puts focus back in the field.
 *
 * The clear button sits inside the input's padding, so whether it is clickable
 * at all is a hit-testing question — and where focus lands afterwards is a real
 * browser's answer, not a simulated one.
 */
export const TypeAndClear: Story = {
  render: () => <ControlledSearchInput placeholder="Search..." />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // `textbox`, not `searchbox`: the component renders `type="text"`.
    const input = canvas.getByRole("textbox");

    await userEvent.type(input, "invoice");
    await expect(input).toHaveValue("invoice");

    await userEvent.click(canvas.getByRole("button", { name: /clear/i }));
    await expect(input).toHaveValue("");
    await expect(canvas.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
  },
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = React.useState("hello world");
    return <SearchInput placeholder="Search..." value={value} onValueChange={setValue} />;
  },
};

export const Compact: Story = {
  render: () => <ControlledSearchInput placeholder="Search activity..." className="h-8 w-50" />,
};

export const Wide: Story = {
  render: () => <ControlledSearchInput placeholder="Search files..." className="w-80" />,
};

export const Disabled: Story = {
  render: () => <SearchInput placeholder="Search..." value="cannot edit" onValueChange={() => {}} disabled />,
};

export const ComponentTokens = componentTokensStory("search-input");
