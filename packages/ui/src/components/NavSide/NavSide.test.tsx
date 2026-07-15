/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { Home, Settings, User } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { NavSide } from "./NavSide";
import type { NavSection, RenderLinkFn } from "./types";

const mockSections: NavSection[] = [
  {
    id: "main",
    items: [
      { to: "/", label: "Home", icon: Home },
      { to: "/profile", label: "Profile", icon: User },
    ],
  },
  {
    id: "settings",
    items: [{ to: "/settings", label: "Settings", icon: Settings }],
  },
];

const defaultRenderLink: RenderLinkFn = ({ to, className, title, children }) => (
  <a href={to} className={className} title={title}>
    {children}
  </a>
);

const defaultIsActive = () => false;

describe("NavSide", () => {
  describe("rendering", () => {
    it("renders navigation element with sections", () => {
      render(<NavSide sections={mockSections} isActive={defaultIsActive} renderLink={defaultRenderLink} />);

      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("renders all items from all sections", () => {
      render(<NavSide sections={mockSections} isActive={defaultIsActive} renderLink={defaultRenderLink} />);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Profile")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("renders separators between sections but not before first", () => {
      const { container } = render(<NavSide sections={mockSections} isActive={defaultIsActive} renderLink={defaultRenderLink} />);

      // Should have 1 separator (between 2 sections)
      const separators = container.querySelectorAll(".border-t");
      expect(separators).toHaveLength(1);
    });
  });

  describe("expanded/collapsed", () => {
    it("shows labels when expanded (default)", () => {
      render(<NavSide sections={mockSections} isActive={defaultIsActive} renderLink={defaultRenderLink} />);

      expect(screen.getByText("Home")).toBeVisible();
      expect(screen.getByText("Profile")).toBeVisible();
    });

    it("hides labels when collapsed", () => {
      render(<NavSide sections={mockSections} isActive={defaultIsActive} renderLink={defaultRenderLink} expanded={false} />);

      expect(screen.queryByText("Home")).not.toBeInTheDocument();
      expect(screen.queryByText("Profile")).not.toBeInTheDocument();
    });

    it("adds title attribute to items when collapsed for tooltip", () => {
      render(<NavSide sections={mockSections} isActive={defaultIsActive} renderLink={defaultRenderLink} expanded={false} />);

      // When collapsed, links should have title for tooltip
      expect(screen.getByTitle("Home")).toBeInTheDocument();
      expect(screen.getByTitle("Profile")).toBeInTheDocument();
      expect(screen.getByTitle("Settings")).toBeInTheDocument();
    });

    it("applies correct width when expanded", () => {
      const { container } = render(<NavSide sections={mockSections} isActive={defaultIsActive} renderLink={defaultRenderLink} expanded={true} />);

      const aside = container.querySelector("aside");
      expect(aside).toHaveClass("w-48");
    });

    it("applies correct width when collapsed", () => {
      const { container } = render(<NavSide sections={mockSections} isActive={defaultIsActive} renderLink={defaultRenderLink} expanded={false} />);

      const aside = container.querySelector("aside");
      expect(aside).toHaveClass("w-16");
    });
  });

  describe("active state", () => {
    it("applies active class to active items", () => {
      const isActive = (item: { to: string }) => item.to === "/profile";

      render(<NavSide sections={mockSections} isActive={isActive} renderLink={defaultRenderLink} />);

      const profileLink = screen.getByRole("link", { name: "Profile" });
      expect(profileLink).toHaveClass("bg-bg-brand-pressed");
    });
  });

  describe("integration", () => {
    it("calls renderLink with correct props for each item", () => {
      const renderLink = vi.fn(defaultRenderLink);

      render(<NavSide sections={mockSections} isActive={defaultIsActive} renderLink={renderLink} />);

      expect(renderLink).toHaveBeenCalledTimes(3);
      expect(renderLink).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "/",
          className: expect.any(String),
        })
      );
    });

    it("merges custom className", () => {
      const { container } = render(<NavSide sections={mockSections} isActive={defaultIsActive} renderLink={defaultRenderLink} className="custom-nav" />);

      const aside = container.querySelector("aside");
      expect(aside).toHaveClass("custom-nav");
    });
  });
});
