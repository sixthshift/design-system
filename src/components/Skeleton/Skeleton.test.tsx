/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  describe("rendering", () => {
    it("renders as a div element", () => {
      render(<Skeleton data-testid="skeleton" />);
      expect(screen.getByTestId("skeleton").tagName).toBe("DIV");
    });

    it("spreads additional props", () => {
      render(<Skeleton data-testid="skeleton" aria-label="Loading" />);
      expect(screen.getByTestId("skeleton")).toHaveAttribute("aria-label", "Loading");
    });

    it("forwards ref", () => {
      const ref = vi.fn();
      render(<Skeleton ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });
  });

  describe("styling", () => {
    it("applies animation class", () => {
      render(<Skeleton data-testid="skeleton" />);
      expect(screen.getByTestId("skeleton")).toHaveClass("animate-pulse");
    });

    it("applies rounded class", () => {
      render(<Skeleton data-testid="skeleton" />);
      expect(screen.getByTestId("skeleton")).toHaveClass("rounded-md");
    });

    it("applies background class", () => {
      render(<Skeleton data-testid="skeleton" />);
      expect(screen.getByTestId("skeleton")).toHaveClass("bg-bg-strong/10");
    });

    it("merges custom className", () => {
      render(<Skeleton data-testid="skeleton" className="h-4 w-full" />);
      const skeleton = screen.getByTestId("skeleton");
      expect(skeleton).toHaveClass("h-4");
      expect(skeleton).toHaveClass("w-full");
      expect(skeleton).toHaveClass("animate-pulse");
    });
  });

  describe("common patterns", () => {
    it("can be used for text placeholder", () => {
      render(<Skeleton data-testid="skeleton" className="h-4 w-[200px]" />);
      const skeleton = screen.getByTestId("skeleton");
      expect(skeleton).toHaveClass("h-4");
      expect(skeleton).toHaveClass("w-[200px]");
    });

    it("can be used for avatar placeholder", () => {
      render(<Skeleton data-testid="skeleton" className="h-12 w-12 rounded-full" />);
      const skeleton = screen.getByTestId("skeleton");
      expect(skeleton).toHaveClass("h-12");
      expect(skeleton).toHaveClass("w-12");
      expect(skeleton).toHaveClass("rounded-full");
    });

    it("can be used for card placeholder", () => {
      render(<Skeleton data-testid="skeleton" className="h-[200px] w-full rounded-xl" />);
      const skeleton = screen.getByTestId("skeleton");
      expect(skeleton).toHaveClass("h-[200px]");
      expect(skeleton).toHaveClass("w-full");
      expect(skeleton).toHaveClass("rounded-xl");
    });
  });
});
