/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Separator } from "./Separator";

describe("Separator", () => {
  describe("rendering", () => {
    it("renders as a div element", () => {
      render(<Separator data-testid="separator" />);
      expect(screen.getByTestId("separator").tagName).toBe("DIV");
    });

    it("forwards ref", () => {
      const ref = vi.fn();
      render(<Separator ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });

    it("spreads additional props", () => {
      render(<Separator data-testid="separator" aria-label="divider" />);
      expect(screen.getByTestId("separator")).toHaveAttribute("aria-label", "divider");
    });
  });

  describe("orientation", () => {
    it("defaults to horizontal", () => {
      render(<Separator data-testid="separator" />);
      const separator = screen.getByTestId("separator");
      expect(separator).toHaveClass("h-px");
      expect(separator).toHaveClass("w-full");
    });

    it("renders horizontal orientation", () => {
      render(<Separator data-testid="separator" orientation="horizontal" />);
      const separator = screen.getByTestId("separator");
      expect(separator).toHaveClass("h-px");
      expect(separator).toHaveClass("w-full");
    });

    it("renders vertical orientation", () => {
      render(<Separator data-testid="separator" orientation="vertical" />);
      const separator = screen.getByTestId("separator");
      expect(separator).toHaveClass("h-full");
      expect(separator).toHaveClass("w-px");
    });
  });

  describe("decorative", () => {
    it("defaults to decorative (role='none')", () => {
      render(<Separator data-testid="separator" />);
      expect(screen.getByTestId("separator")).toHaveAttribute("role", "none");
    });

    it("has role='none' when decorative is true", () => {
      render(<Separator data-testid="separator" decorative={true} />);
      expect(screen.getByTestId("separator")).toHaveAttribute("role", "none");
    });

    it("has role='separator' when decorative is false", () => {
      render(<Separator decorative={false} />);
      expect(screen.getByRole("separator")).toBeInTheDocument();
    });

    it("has no aria-orientation when decorative", () => {
      render(<Separator data-testid="separator" decorative={true} />);
      expect(screen.getByTestId("separator")).not.toHaveAttribute("aria-orientation");
    });

    it("has aria-orientation when not decorative", () => {
      render(<Separator decorative={false} orientation="horizontal" />);
      expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "horizontal");
    });

    it("has vertical aria-orientation when not decorative", () => {
      render(<Separator decorative={false} orientation="vertical" />);
      expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
    });
  });

  describe("styling", () => {
    it("applies base classes", () => {
      render(<Separator data-testid="separator" />);
      const separator = screen.getByTestId("separator");
      expect(separator).toHaveClass("bg-border-normal");
      expect(separator).toHaveClass("shrink-0");
    });

    it("merges custom className", () => {
      render(<Separator data-testid="separator" className="my-4" />);
      const separator = screen.getByTestId("separator");
      expect(separator).toHaveClass("my-4");
      expect(separator).toHaveClass("bg-border-normal");
    });
  });
});
