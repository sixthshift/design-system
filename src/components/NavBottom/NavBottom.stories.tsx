import type { Meta, StoryObj } from "@storybook/react";
import { BarChart3, Clock, Compass, Library, Plug, Settings, Sun, Zap } from "lucide-react";
import { useState } from "react";
import type { NavSection, RenderLinkFn } from "../NavSide";
import { NavBottom } from "./NavBottom";

const meta: Meta<typeof NavBottom> = {
  title: "Components/Shell/NavBottom",
  component: NavBottom,
  parameters: {
    layout: "fullscreen",
    docs: { subtitle: "Mobile bottom tab bar, flattened from nav sections" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NavBottom>;

// Sample navigation data
const sampleSections: NavSection[] = [
  {
    id: "views",
    items: [
      { to: "/", label: "Now", icon: Sun },
      { to: "/timeline", label: "Timeline", icon: Clock },
      { to: "/explore", label: "Explore", icon: Compass },
      { to: "/review", label: "Review", icon: BarChart3 },
    ],
  },
  {
    id: "machinery",
    items: [
      { to: "/library", label: "Library", icon: Library },
      { to: "/integrations", label: "Integrations", icon: Plug },
      { to: "/automations", label: "Automations", icon: Zap },
    ],
  },
  {
    id: "settings",
    items: [{ to: "/settings", label: "Settings", icon: Settings }],
  },
];

// Simple link renderer (no router dependency)
const renderLink: RenderLinkFn = ({ to, className, title, children }) => (
  <a href={to} className={className} title={title}>
    {children}
  </a>
);

export const Default: Story = {
  render: () => (
    <div className="h-screen">
      <div className="p-4">
        <p className="text-fg-subtle">Content area - scroll down to see bottom nav</p>
      </div>
      <NavBottom sections={sampleSections} isActive={(item) => item.to === "/"} renderLink={renderLink} />
    </div>
  ),
};

export const LimitedItems: Story = {
  render: () => (
    <div className="h-screen">
      <div className="p-4">
        <p className="text-fg-subtle">Bottom nav limited to 3 items</p>
      </div>
      <NavBottom sections={sampleSections} maxItems={3} isActive={(item) => item.to === "/"} renderLink={renderLink} />
    </div>
  ),
};

export const ActiveState: Story = {
  render: () => {
    const [activePath, setActivePath] = useState("/");

    const handleRenderLink: RenderLinkFn = ({ to, className, title, children }) => (
      // biome-ignore lint/a11y/useValidAnchor: Story demo code showing renderLink callback usage
      <a
        href="#"
        className={className}
        title={title}
        onClick={(e) => {
          e.preventDefault();
          setActivePath(to);
        }}
      >
        {children}
      </a>
    );

    return (
      <div className="h-screen">
        <div className="p-4">
          <p className="text-fg-subtle">Click items to change active state</p>
          <p className="mt-2 text-sm">Current: {activePath}</p>
        </div>
        <NavBottom sections={sampleSections} isActive={(item) => item.to === activePath} renderLink={handleRenderLink} />
      </div>
    );
  },
};
