import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { componentTokensStory } from "../../stories/recipes/componentTokensStory";
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

const ControlledSearchInput = (props: Omit<React.ComponentProps<typeof SearchInput>, "value" | "onChange">) => {
  const [value, setValue] = React.useState("");
  return <SearchInput {...props} value={value} onChange={setValue} />;
};

export const Default: Story = {
  render: () => <ControlledSearchInput placeholder="Search..." />,
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = React.useState("hello world");
    return <SearchInput placeholder="Search..." value={value} onChange={setValue} />;
  },
};

export const Compact: Story = {
  render: () => <ControlledSearchInput placeholder="Search activity..." className="h-8 w-50" />,
};

export const Wide: Story = {
  render: () => <ControlledSearchInput placeholder="Search files..." className="w-80" />,
};

export const Disabled: Story = {
  render: () => <SearchInput placeholder="Search..." value="cannot edit" onChange={() => {}} disabled />,
};

export const ComponentTokens = componentTokensStory("search-input");
