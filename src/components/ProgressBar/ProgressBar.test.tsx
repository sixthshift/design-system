/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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

    it("forwards ref", () => {
      const ref = vi.fn();
      render(<ProgressBar completed={1} total={2} ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
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

  describe("accessibility contract", () => {
    it("exposes the progressbar role", () => {
      render(<ProgressBar completed={3} total={10} />);
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("has an accessible name by default", () => {
      render(<ProgressBar completed={3} total={10} />);
      expect(screen.getByRole("progressbar")).toHaveAccessibleName("Progress");
    });

    it("accepts a custom accessible name", () => {
      render(<ProgressBar completed={3} total={10} label="Upload" />);
      expect(screen.getByRole("progressbar")).toHaveAccessibleName("Upload");
    });

    it("reports value, min and max", () => {
      render(<ProgressBar completed={3} total={10} />);
      const bar = screen.getByRole("progressbar");
      expect(bar).toHaveAttribute("aria-valuenow", "3");
      expect(bar).toHaveAttribute("aria-valuemin", "0");
      expect(bar).toHaveAttribute("aria-valuemax", "10");
      expect(bar).toHaveAttribute("aria-valuetext", "3 of 10");
    });

    it("is indeterminate (no aria-valuenow) when total is not positive", () => {
      render(<ProgressBar completed={3} total={0} />);
      const bar = screen.getByRole("progressbar");
      expect(bar).not.toHaveAttribute("aria-valuenow");
      expect(bar).not.toHaveAttribute("aria-valuemax");
    });
  });

  describe("clamping", () => {
    it("caps the fill at 100% when completed exceeds total", () => {
      render(<ProgressBar completed={10} total={8} />);
      const fill = screen.getByRole("progressbar").firstElementChild;
      expect(fill).toHaveStyle({ width: "100%" });
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "8");
    });

    it("never emits a negative width for a negative completed value", () => {
      render(<ProgressBar completed={-5} total={10} />);
      const fill = screen.getByRole("progressbar").firstElementChild;
      expect(fill).toHaveStyle({ width: "0%" });
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    });
  });
});
