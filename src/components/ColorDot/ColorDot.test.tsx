/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ColorDot } from "./ColorDot";

describe("ColorDot", () => {
  describe("rendering", () => {
    it("renders as a span element", () => {
      render(<ColorDot color="brand" data-testid="dot" />);
      expect(screen.getByTestId("dot").tagName).toBe("SPAN");
    });

    it("spreads additional props to the span", () => {
      render(<ColorDot color="brand" data-testid="dot" aria-label="status" />);
      expect(screen.getByTestId("dot")).toHaveAttribute("aria-label", "status");
    });

    it("forwards ref", () => {
      const ref = vi.fn();
      render(<ColorDot color="brand" ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLSpanElement));
    });
  });

  describe("intent colors", () => {
    it.each([
      "neutral",
      "brand",
      "primary",
      "success",
      "warning",
      "danger",
    ] as const)("applies background class for %s intent and no inline background color", (color) => {
      render(<ColorDot color={color} data-testid="dot" />);
      const dot = screen.getByTestId("dot");
      expect(dot.className).toMatch(/bg-/);
      expect(dot.getAttribute("style") ?? "").not.toContain("background-color");
    });

    it("maps brand and primary to the same background class", () => {
      render(<ColorDot color="brand" data-testid="brand-dot" />);
      render(<ColorDot color="primary" data-testid="primary-dot" />);
      expect(screen.getByTestId("brand-dot").className).toBe(screen.getByTestId("primary-dot").className);
    });
  });

  describe("arbitrary colors", () => {
    it("applies an inline backgroundColor for a hex color", () => {
      render(<ColorDot color="#6366f1" data-testid="dot" />);
      const dot = screen.getByTestId("dot");
      expect(dot.getAttribute("style")).toContain("background-color: #6366f1");
    });

    it("applies an inline backgroundColor for a named CSS color not in the intent map", () => {
      render(<ColorDot color="teal" data-testid="dot" />);
      const dot = screen.getByTestId("dot");
      expect(dot.getAttribute("style")).toContain("background-color: teal");
    });

    it("does not add an intent background class for arbitrary colors", () => {
      render(<ColorDot color="#ec4899" data-testid="dot" />);
      const dot = screen.getByTestId("dot");
      expect(dot.className).not.toMatch(/bg-/);
    });

    it("merges an arbitrary color's inline style with a caller-provided style", () => {
      render(<ColorDot color="#14b8a6" data-testid="dot" style={{ opacity: 0.5 }} />);
      const dot = screen.getByTestId("dot");
      expect(dot.getAttribute("style")).toContain("background-color: #14b8a6");
      expect(dot.style.opacity).toBe("0.5");
    });
  });

  describe("size", () => {
    it.each([
      ["sm", "h-1.5"],
      ["md", "h-2"],
      ["lg", "h-2.5"],
    ] as const)("applies %s size class", (size, expectedClass) => {
      render(<ColorDot color="brand" size={size} data-testid="dot" />);
      expect(screen.getByTestId("dot")).toHaveClass(expectedClass);
    });

    it("defaults to md size when not specified", () => {
      render(<ColorDot color="brand" data-testid="dot" />);
      expect(screen.getByTestId("dot")).toHaveClass("h-2");
    });
  });

  describe("pulse", () => {
    it("applies animate-pulse when pulse is true", () => {
      render(<ColorDot color="brand" pulse data-testid="dot" />);
      expect(screen.getByTestId("dot")).toHaveClass("animate-pulse");
    });

    it("does not apply animate-pulse by default", () => {
      render(<ColorDot color="brand" data-testid="dot" />);
      expect(screen.getByTestId("dot")).not.toHaveClass("animate-pulse");
    });
  });

  describe("base styles", () => {
    it("has inline-block display, shrink-0 and rounded-full", () => {
      render(<ColorDot color="brand" data-testid="dot" />);
      const dot = screen.getByTestId("dot");
      expect(dot).toHaveClass("inline-block");
      expect(dot).toHaveClass("shrink-0");
      expect(dot).toHaveClass("rounded-full");
    });
  });

  describe("className merging", () => {
    it("merges custom className with default classes", () => {
      render(<ColorDot color="brand" className="custom-class" data-testid="dot" />);
      const dot = screen.getByTestId("dot");
      expect(dot).toHaveClass("custom-class");
      expect(dot).toHaveClass("rounded-full");
    });
  });
});
