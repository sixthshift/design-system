import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Separator } from "./Separator";

const meta: Meta<typeof Separator> = {
  title: "Components/Separator",
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

/**
 * A separator is a hairline in one axis, which is a layout fact: only a real
 * browser resolves `h-px` and `w-full` to actual pixels.
 */
export const GeometryPlay: Story = {
  render: () => (
    <div className="w-64 space-y-4">
      {/* Not decorative, so each renders `role="separator"` to query by. */}
      <Separator decorative={false} />
      <div className="flex h-10">
        <Separator decorative={false} orientation="vertical" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [horizontal, vertical] = within(canvasElement).getAllByRole("separator");

    const h = horizontal!.getBoundingClientRect();
    await expect(h.height).toBeCloseTo(1, 0);
    await expect(h.width).toBeGreaterThan(100);

    const v = vertical!.getBoundingClientRect();
    await expect(v.width).toBeCloseTo(1, 0);
    await expect(v.height).toBeGreaterThan(10);
  },
};

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
