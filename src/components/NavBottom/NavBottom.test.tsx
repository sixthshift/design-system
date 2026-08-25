/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { Bell, Calendar, Home, Search, Settings, User } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import type { NavSection, RenderLinkFn } from "../NavSide";
import { NavBottom } from "./NavBottom";

const mockSections: NavSection[] = [
  {
    id: "main",
    items: [
      { to: "/", label: "Home", icon: Home },
      { to: "/profile", label: "Profile", icon: User },
      { to: "/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    id: "secondary",
    items: [
      { to: "/search", label: "Search", icon: Search },
      { to: "/calendar", label: "Calendar", icon: Calendar },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

const defaultRenderLink: RenderLinkFn = ({ to, className, children }) => (
  <a href={to} className={className}>
    {children}
  </a>
);

const defaultIsActive = () => false;

describe("NavBottom", () => {
  describe("rendering", () => {
    it("renders navigation element with items", () => {
      render(<NavBottom sections={mockSections} isActive={defaultIsActive} renderLink={defaultRenderLink} />);

      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("flattens sections into single list", () => {
      render(<NavBottom sections={mockSections} isActive={defaultIsActive} renderLink={defaultRenderLink} />);

      // All items from both sections should be in a single list
      const list = screen.getByRole("list");
      expect(list).toBeInTheDocument();

      // Should show first 5 items (default maxItems)
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Profile")).toBeInTheDocument();
      expect(screen.getByText("Notifications")).toBeInTheDocument();
      expect(screen.getByText("Search")).toBeInTheDocument();
      expect(screen.getByText("Calendar")).toBeInTheDocument();
    });

    it("limits items to maxItems (default 5)", () => {
      render(<NavBottom sections={mockSections} isActive={defaultIsActive} renderLink={defaultRenderLink} />);

      // 6th item (Settings) should not be shown
      expect(screen.queryByText("Settings")).not.toBeInTheDocument();
    });

    it("respects custom maxItems value", () => {
      render(<NavBottom sections={mockSections} isActive={defaultIsActive} renderLink={defaultRenderLink} maxItems={3} />);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Profile")).toBeInTheDocument();
      expect(screen.getByText("Notifications")).toBeInTheDocument();
      expect(screen.queryByText("Search")).not.toBeInTheDocument();
    });
  });

  describe("active state", () => {
    it("applies active class to active items", () => {
      const isActive = (item: { to: string }) => item.to === "/profile";

      render(<NavBottom sections={mockSections} isActive={isActive} renderLink={defaultRenderLink} />);

      const profileLink = screen.getByRole("link", { name: "Profile" });
      expect(profileLink).toHaveClass("bg-bg-brand-pressed");
    });
  });

  describe("integration", () => {
    it("calls renderLink with correct props for each item", () => {
      const renderLink = vi.fn(defaultRenderLink);

      render(<NavBottom sections={mockSections} isActive={defaultIsActive} renderLink={renderLink} maxItems={3} />);

      expect(renderLink).toHaveBeenCalledTimes(3);
      expect(renderLink).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "/",
          className: expect.any(String),
        })
      );
    });

    it("merges custom className", () => {
      render(<NavBottom sections={mockSections} isActive={defaultIsActive} renderLink={defaultRenderLink} className="custom-nav" />);

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("custom-nav");
    });
  });
});
