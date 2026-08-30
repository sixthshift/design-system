import { Label } from "@sixthshift/design-system/label";
import type { Meta, StoryObj } from "@storybook/react";
import { AtSign, Check, Eye, EyeOff, Lock, Mail, Search as SearchIcon } from "lucide-react";
import * as React from "react";
import { expect, userEvent, within } from "storybook/test";
import { componentTokensStory } from "../../stories/component-tokens/componentTokensStory";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
    docs: { subtitle: "A single line of free-form text, with optional icon slots" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Input>;

/**
 * Typing, and a click on the field's padding still lands in the input.
 *
 * Both are hit-testing questions: the icon slots are absolutely positioned over
 * the input, so whether they steal the click is a real-browser answer.
 */
export const TypingPlay: Story = {
  render: () => <Input placeholder="Enter text..." iconLeft={<Mail />} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    await userEvent.click(input);
    await expect(input).toHaveFocus();
    await userEvent.keyboard("hello@example.com");
    await expect(input).toHaveValue("hello@example.com");
  },
};

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: "Hello world",
    "aria-label": "Example text",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
  ),
};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Enter password",
  },
};

export const NumberInput: Story = {
  args: {
    type: "number",
    placeholder: "0",
  },
};

export const DateInput: Story = {
  args: {
    type: "date",
    "aria-label": "Date",
  },
};

export const Time: Story = {
  args: {
    type: "time",
    "aria-label": "Time",
  },
};

export const File: Story = {
  args: {
    type: "file",
    "aria-label": "File",
  },
};

export const Search: Story = {
  args: {
    type: "search",
    placeholder: "Search...",
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <Input type="text" placeholder="Text" />
      <Input type="email" placeholder="Email" />
      <Input type="password" placeholder="Password" />
      <Input type="number" placeholder="Number" />
      <Input type="search" placeholder="Search" />
      <Input type="date" aria-label="Date" />
      <Input type="time" aria-label="Time" />
      <Input type="file" aria-label="File" />
    </div>
  ),
};

export const WithIconLeft: Story = {
  args: {
    iconLeft: <SearchIcon />,
    placeholder: "Search...",
  },
};

export const WithIconRight: Story = {
  args: {
    iconRight: <Check />,
    placeholder: "Username",
  },
};

export const WithBothIcons: Story = {
  args: {
    iconLeft: <Mail />,
    iconRight: <Check />,
    placeholder: "Email",
  },
};

export const PasswordWithToggle: Story = {
  render: () => {
    const [show, setShow] = React.useState(false);
    return (
      <Input
        type={show ? "text" : "password"}
        iconLeft={<Lock />}
        iconRight={
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff /> : <Eye />}
          </button>
        }
        placeholder="Password"
      />
    );
  },
};

export const IconExamples: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <Input iconLeft={<SearchIcon />} placeholder="Search..." />
      <Input iconLeft={<Mail />} placeholder="Email" />
      <Input iconLeft={<AtSign />} placeholder="Username" />
      <Input iconLeft={<Lock />} type="password" placeholder="Password" />
      <Input iconLeft={<Mail />} iconRight={<Check />} placeholder="Validated" />
    </div>
  ),
};

export const ComponentTokens = componentTokensStory("input");
