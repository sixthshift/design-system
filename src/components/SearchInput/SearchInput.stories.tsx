import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { SearchInput } from "./SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Components/Inputs/SearchInput",
  component: SearchInput,
  parameters: {
    layout: "centered",
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
