/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  describe("rendering", () => {
    it("renders the fraction text by default", () => {
      render(<ProgressBar completed={3} total={8} />);
      expect(screen.getByText("3/8")).toBeInTheDocument();
    });

    it("hides the fraction text when showFraction is false", () => {
      render(<ProgressBar completed={5} total={8} showFraction={false} />);
      expect(screen.queryByText("5/8")).not.toBeInTheDocument();
    });
  });

  describe("fill percentage", () => {
    it("fills proportionally to completed/total", () => {
      const { container } = render(<ProgressBar completed={3} total={8} />);
      const fill = container.querySelector(".bg-fg-success") as HTMLElement;
      expect(fill.style.width).toBe("37.5%");
    });

    it("fills 0% when nothing is completed", () => {
      const { container } = render(<ProgressBar completed={0} total={8} />);
      const fill = container.querySelector(".bg-fg-success") as HTMLElement;
      expect(fill.style.width).toBe("0%");
    });

    it("fills 100% when completed equals total", () => {
      const { container } = render(<ProgressBar completed={8} total={8} />);
      const fill = container.querySelector(".bg-fg-success") as HTMLElement;
      expect(fill.style.width).toBe("100%");
    });

    it("renders 0% width when total is zero, regardless of completed", () => {
      const { container } = render(<ProgressBar completed={0} total={0} />);
      const fill = container.querySelector(".bg-fg-success") as HTMLElement;
      expect(fill.style.width).toBe("0%");
    });

    it("supports fractional percentages", () => {
      const { container } = render(<ProgressBar completed={1} total={3} />);
      const fill = container.querySelector(".bg-fg-success") as HTMLElement;
      expect(fill.style.width).toBe("33.33333333333333%");
    });

    it("still renders the raw fraction text when completed exceeds total", () => {
      render(<ProgressBar completed={10} total={8} />);
      expect(screen.getByText("10/8")).toBeInTheDocument();
    });
  });

  describe("className merging", () => {
    it("merges custom className with default classes on the root", () => {
      const { container } = render(<ProgressBar completed={1} total={2} className="custom-class" />);
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveClass("custom-class");
      expect(root).toHaveClass("flex");
    });
  });
});
