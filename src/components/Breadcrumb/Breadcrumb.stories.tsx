import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumb } from "./Breadcrumb";

const meta: Meta<typeof Breadcrumb> = {
  title: "Components/Navigation/Breadcrumb",
  component: Breadcrumb,
  parameters: {
    layout: "centered",
    docs: { subtitle: "A navigation trail with router-aware links" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  args: {
    items: [{ label: "Home", href: "/" }, { label: "Settings", href: "/settings" }, { label: "Profile" }],
  },
};

export const TwoLevels: Story = {
  args: {
    items: [{ label: "Home", href: "/" }, { label: "Settings" }],
  },
};

export const SingleLevel: Story = {
  args: {
    items: [{ label: "Dashboard" }],
  },
};

export const LongPath: Story = {
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Documents", href: "/documents" },
      { label: "Projects", href: "/documents/projects" },
      { label: "2024", href: "/documents/projects/2024" },
      { label: "Q4 Report" },
    ],
  },
};
