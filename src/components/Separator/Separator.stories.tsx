import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "./Separator";

const meta: Meta<typeof Separator> = {
  title: "Components/Layout/Separator",
  component: Separator,
  parameters: {
    layout: "centered",
    docs: { subtitle: "A horizontal or vertical dividing line" },
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-64">
      <div className="space-y-1">
        <h4 className="font-medium text-sm leading-none">Design System</h4>
        <p className="text-fg-subtle text-sm">Tokens, themes, and components.</p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Overview</div>
        <Separator orientation="vertical" />
        <div>Components</div>
        <Separator orientation="vertical" />
        <div>Settings</div>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-5 items-center space-x-4 text-sm">
      <div>Home</div>
      <Separator orientation="vertical" />
      <div>About</div>
      <Separator orientation="vertical" />
      <div>Contact</div>
    </div>
  ),
};

export const InList: Story = {
  render: () => (
    <div className="w-64">
      <div className="py-2">
        <span className="text-sm">Item 1</span>
      </div>
      <Separator />
      <div className="py-2">
        <span className="text-sm">Item 2</span>
      </div>
      <Separator />
      <div className="py-2">
        <span className="text-sm">Item 3</span>
      </div>
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-64">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-bg-normal px-2 text-fg-subtle">Or continue with</span>
        </div>
      </div>
    </div>
  ),
};
