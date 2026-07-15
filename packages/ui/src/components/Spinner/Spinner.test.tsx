/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Spinner } from "./Spinner";

describe("Spinner", () => {
  describe("rendering", () => {
    it("renders as an svg element", () => {
      render(<Spinner data-testid="spinner" />);
      expect(screen.getByTestId("spinner").tagName).toBe("svg");
    });

    it("forwards ref to the svg element", () => {
      const ref = vi.fn();
      render(<Spinner ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(SVGSVGElement));
    });

    it("spreads additional props", () => {
      render(<Spinner data-testid="spinner" aria-label="Loading" />);
      expect(screen.getByTestId("spinner")).toHaveAttribute("aria-label", "Loading");
    });
  });

  describe("sizes", () => {
    it("applies default size", () => {
      render(<Spinner data-testid="spinner" />);
      const spinner = screen.getByTestId("spinner");
      expect(spinner).toHaveClass("h-6");
      expect(spinner).toHaveClass("w-6");
    });

    it("applies sm size", () => {
      render(<Spinner data-testid="spinner" size="sm" />);
      const spinner = screen.getByTestId("spinner");
      expect(spinner).toHaveClass("h-4");
      expect(spinner).toHaveClass("w-4");
    });

    it("applies lg size", () => {
      render(<Spinner data-testid="spinner" size="lg" />);
      const spinner = screen.getByTestId("spinner");
      expect(spinner).toHaveClass("h-8");
      expect(spinner).toHaveClass("w-8");
    });

    it("applies xl size", () => {
      render(<Spinner data-testid="spinner" size="xl" />);
      const spinner = screen.getByTestId("spinner");
      expect(spinner).toHaveClass("h-12");
      expect(spinner).toHaveClass("w-12");
    });
  });

  describe("styling", () => {
    it("applies animation class", () => {
      render(<Spinner data-testid="spinner" />);
      expect(screen.getByTestId("spinner")).toHaveClass("animate-spin");
    });

    it("applies default text color", () => {
      render(<Spinner data-testid="spinner" />);
      expect(screen.getByTestId("spinner")).toHaveClass("text-fg-subtle");
    });

    it("merges custom className", () => {
      render(<Spinner data-testid="spinner" className="text-fg-brand" />);
      const spinner = screen.getByTestId("spinner");
      expect(spinner).toHaveClass("text-fg-brand");
      expect(spinner).toHaveClass("animate-spin");
    });
  });

  describe("svg structure", () => {
    it("has viewBox attribute", () => {
      render(<Spinner data-testid="spinner" />);
      expect(screen.getByTestId("spinner")).toHaveAttribute("viewBox", "0 0 24 24");
    });

    it("contains circle and path elements", () => {
      render(<Spinner data-testid="spinner" />);
      const spinner = screen.getByTestId("spinner");
      expect(spinner.querySelector("circle")).toBeInTheDocument();
      expect(spinner.querySelector("path")).toBeInTheDocument();
    });
  });
});
