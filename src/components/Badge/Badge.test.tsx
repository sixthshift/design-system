/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Badge } from "./Badge";

describe("Badge", () => {
  describe("rendering", () => {
    it("renders with children", () => {
      render(<Badge>Status</Badge>);
      expect(screen.getByText("Status")).toBeInTheDocument();
    });

    it("renders as a span element", () => {
      render(<Badge>Badge</Badge>);
      expect(screen.getByText("Badge").tagName).toBe("SPAN");
    });

    it("spreads additional props to the span", () => {
      render(<Badge data-testid="custom-badge">Badge</Badge>);
      expect(screen.getByTestId("custom-badge")).toBeInTheDocument();
    });

    it("forwards ref", () => {
      const ref = vi.fn();
      render(<Badge ref={ref}>Badge</Badge>);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLSpanElement));
    });
  });

  describe("variants", () => {
    it.each(["solid", "soft", "outline"] as const)("renders %s variant", (variant) => {
      render(<Badge variant={variant}>Badge</Badge>);
      expect(screen.getByText("Badge")).toBeInTheDocument();
    });

    it("applies default variant (solid) when not specified", () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass("shadow");
    });

    it("applies solid variant classes", () => {
      render(<Badge variant="solid">Badge</Badge>);
      const badge = screen.getByText("Badge");
      // Colour (including border colour) is no longer a class literal — it is
      // read from the `--badge-*` component tokens the `data-variant` /
      // `data-intent` attributes select in badge.css. Structure stays a class.
      expect(badge).toHaveAttribute("data-variant", "solid");
      expect(badge).toHaveClass("shadow");
    });

    it("applies soft variant classes", () => {
      render(<Badge variant="soft">Badge</Badge>);
      const badge = screen.getByText("Badge");
      expect(badge).toHaveAttribute("data-variant", "soft");
      expect(badge).not.toHaveClass("shadow");
    });

    it("applies outline variant classes", () => {
      render(<Badge variant="outline">Badge</Badge>);
      const badge = screen.getByText("Badge");
      expect(badge).toHaveAttribute("data-variant", "outline");
      expect(badge).not.toHaveClass("shadow");
    });
  });

  describe("intents", () => {
    it.each(["neutral", "brand", "danger", "success", "warning", "muted"] as const)("renders %s intent", (intent) => {
      render(<Badge intent={intent}>Badge</Badge>);
      expect(screen.getByText("Badge")).toBeInTheDocument();
    });

    it("defaults to brand", () => {
      render(<Badge>Badge</Badge>);
      expect(screen.getByText("Badge")).toHaveAttribute("data-intent", "brand");
    });

    it("applies neutral intent with solid variant", () => {
      render(
        <Badge variant="solid" intent="neutral">
          Badge
        </Badge>
      );
      const badge = screen.getByText("Badge");
      expect(badge).toHaveAttribute("data-variant", "solid");
      expect(badge).toHaveAttribute("data-intent", "neutral");
    });

    it("applies danger intent with solid variant", () => {
      render(
        <Badge variant="solid" intent="danger">
          Badge
        </Badge>
      );
      const badge = screen.getByText("Badge");
      expect(badge).toHaveAttribute("data-variant", "solid");
      expect(badge).toHaveAttribute("data-intent", "danger");
    });

    it("applies success intent with solid variant", () => {
      render(
        <Badge variant="solid" intent="success">
          Badge
        </Badge>
      );
      const badge = screen.getByText("Badge");
      expect(badge).toHaveAttribute("data-variant", "solid");
      expect(badge).toHaveAttribute("data-intent", "success");
    });

    it("applies warning intent with solid variant", () => {
      render(
        <Badge variant="solid" intent="warning">
          Badge
        </Badge>
      );
      const badge = screen.getByText("Badge");
      expect(badge).toHaveAttribute("data-variant", "solid");
      expect(badge).toHaveAttribute("data-intent", "warning");
    });
  });

  describe("compound variants", () => {
    it("applies soft + danger combination", () => {
      render(
        <Badge variant="soft" intent="danger">
          Badge
        </Badge>
      );
      const badge = screen.getByText("Badge");
      expect(badge).toHaveAttribute("data-variant", "soft");
      expect(badge).toHaveAttribute("data-intent", "danger");
    });

    it("applies outline + success combination", () => {
      render(
        <Badge variant="outline" intent="success">
          Badge
        </Badge>
      );
      const badge = screen.getByText("Badge");
      expect(badge).toHaveAttribute("data-variant", "outline");
      expect(badge).toHaveAttribute("data-intent", "success");
    });
  });

  describe("className merging", () => {
    it("merges custom className with default classes", () => {
      render(<Badge className="custom-class">Badge</Badge>);
      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass("custom-class");
      expect(badge).toHaveClass("inline-flex");
    });

    it("allows custom className to override default styles", () => {
      render(<Badge className="px-4">Badge</Badge>);
      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass("px-4");
    });
  });

  describe("base styles", () => {
    it("has inline-flex display", () => {
      render(<Badge>Badge</Badge>);
      expect(screen.getByText("Badge")).toHaveClass("inline-flex");
    });

    it("has rounded-md border radius", () => {
      render(<Badge>Badge</Badge>);
      expect(screen.getByText("Badge")).toHaveClass("rounded-md");
    });

    it("has border", () => {
      render(<Badge>Badge</Badge>);
      expect(screen.getByText("Badge")).toHaveClass("border");
    });

    it("has text-xs font size", () => {
      render(<Badge>Badge</Badge>);
      expect(screen.getByText("Badge")).toHaveClass("text-xs");
    });

    it("has font-semibold", () => {
      render(<Badge>Badge</Badge>);
      expect(screen.getByText("Badge")).toHaveClass("font-semibold");
    });
  });
});
