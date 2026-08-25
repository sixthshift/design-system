/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TextInline } from "./TextInline";

describe("TextInline", () => {
  describe("rendering", () => {
    it("renders children", () => {
      render(
        <TextInline>
          <span>Created by</span>
          <span>John Doe</span>
        </TextInline>
      );
      expect(screen.getByText("Created by")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("renders as a span element", () => {
      render(<TextInline data-testid="inline">Content</TextInline>);
      expect(screen.getByTestId("inline").tagName).toBe("SPAN");
    });

    it("renders with no children", () => {
      render(<TextInline data-testid="inline" />);
      expect(screen.getByTestId("inline")).toBeEmptyDOMElement();
    });

    it("forwards ref", () => {
      const ref = vi.fn();
      render(<TextInline ref={ref}>Content</TextInline>);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLSpanElement));
    });

    it("spreads additional props to the span", () => {
      render(
        <TextInline data-testid="inline" aria-label="metadata">
          Content
        </TextInline>
      );
      expect(screen.getByTestId("inline")).toHaveAttribute("aria-label", "metadata");
    });
  });

  describe("gap", () => {
    it.each([
      ["none", "gap-0"],
      ["xs", "gap-0.5"],
      ["sm", "gap-1"],
      ["md", "gap-2"],
      ["lg", "gap-3"],
      ["xl", "gap-4"],
    ] as const)("applies %s gap class", (gap, expectedClass) => {
      render(
        <TextInline gap={gap} data-testid="inline">
          Content
        </TextInline>
      );
      expect(screen.getByTestId("inline")).toHaveClass(expectedClass);
    });

    it("defaults to sm gap when not specified", () => {
      render(<TextInline data-testid="inline">Content</TextInline>);
      expect(screen.getByTestId("inline")).toHaveClass("gap-1");
    });
  });

  describe("align", () => {
    it.each([
      ["start", "items-start"],
      ["center", "items-center"],
      ["end", "items-end"],
      ["baseline", "items-baseline"],
    ] as const)("applies %s align class", (align, expectedClass) => {
      render(
        <TextInline align={align} data-testid="inline">
          Content
        </TextInline>
      );
      expect(screen.getByTestId("inline")).toHaveClass(expectedClass);
    });

    it("defaults to baseline align when not specified", () => {
      render(<TextInline data-testid="inline">Content</TextInline>);
      expect(screen.getByTestId("inline")).toHaveClass("items-baseline");
    });
  });

  describe("base styles", () => {
    it("has inline-flex display", () => {
      render(<TextInline data-testid="inline">Content</TextInline>);
      expect(screen.getByTestId("inline")).toHaveClass("inline-flex");
    });
  });

  describe("className merging", () => {
    it("merges custom className with default classes", () => {
      render(
        <TextInline className="custom-class" data-testid="inline">
          Content
        </TextInline>
      );
      const el = screen.getByTestId("inline");
      expect(el).toHaveClass("custom-class");
      expect(el).toHaveClass("inline-flex");
    });
  });
});
