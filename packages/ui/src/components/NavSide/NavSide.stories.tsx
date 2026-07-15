import type { Meta, StoryObj } from "@storybook/react";
import { BarChart3, Clock, Compass, Library, Plug, Settings, Sun, Zap } from "lucide-react";
import { useState } from "react";
import { NavSide } from "./NavSide";
import type { NavSection, RenderLinkFn } from "./types";

const meta: Meta<typeof NavSide> = {
  title: "Components/Shell/NavSide",
  component: NavSide,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NavSide>;

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
      <NavSide sections={sampleSections} isActive={(item) => item.to === "/"} renderLink={renderLink} />
    </div>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <div className="h-screen">
      <NavSide sections={sampleSections} expanded={false} isActive={(item) => item.to === "/"} renderLink={renderLink} />
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
        <NavSide sections={sampleSections} isActive={(item) => item.to === activePath} renderLink={handleRenderLink} />
      </div>
    );
  },
};

const viewsSection = sampleSections[0]!;

export const SingleSection: Story = {
  render: () => (
    <div className="h-screen">
      <NavSide sections={[viewsSection]} isActive={(item) => item.to === "/"} renderLink={renderLink} />
    </div>
  ),
};
