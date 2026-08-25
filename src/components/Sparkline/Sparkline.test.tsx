/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { SparklineProps } from "./Sparkline";
import { Sparkline } from "./Sparkline";

// With the default width=80, height=24 (padX=1, padY=2), the drawable area is
// innerW=78, innerH=20, so coordinates for small fixed datasets are exact:
//   x_i = 1 + (i / (n - 1)) * 78
//   y_i = 2 + 20 - ((v - min) / range) * 20

describe("Sparkline", () => {
  describe("rendering", () => {
    it("renders an svg with an accessible label", () => {
      render(<Sparkline data={[1, 2, 3]} />);
      expect(screen.getByRole("img", { name: "Trend line" })).toBeInTheDocument();
    });

    it("renders nothing for an empty data array", () => {
      const { container } = render(<Sparkline data={[]} />);
      expect(container).toBeEmptyDOMElement();
    });

    it("renders nothing for a single data point", () => {
      const { container } = render(<Sparkline data={[5]} />);
      expect(container).toBeEmptyDOMElement();
    });

    it("renders a path for two or more points", () => {
      const { container } = render(<Sparkline data={[1, 2]} />);
      expect(container.querySelector("path")).toBeInTheDocument();
    });
  });

  describe("path geometry", () => {
    it("builds an exact linear path for two points", () => {
      const { container } = render(<Sparkline data={[0, 10]} interpolation="linear" />);
      const path = container.querySelector("path");
      expect(path).toHaveAttribute("d", "M 1 22 L 79 2");
    });

    it.each([
      ["linear", "M 1 22 L 40 12 L 79 2"],
      ["monotone", "M 1 22 C 20.5 22, 20.5 12, 40 12 C 59.5 12, 59.5 2, 79 2"],
      ["stepAfter", "M 1 22 L 40 22 L 40 12 L 79 12 L 79 2"],
      ["stepBefore", "M 1 22 L 1 12 L 40 12 L 40 2 L 79 2"],
    ] as const satisfies readonly [SparklineProps["interpolation"], string][])("builds the %s path for three points", (interpolation, expected) => {
      const { container } = render(<Sparkline data={[0, 5, 10]} interpolation={interpolation} />);
      const path = container.querySelector("path");
      expect(path).toHaveAttribute("d", expected);
    });

    it("flattens the line when all values are equal", () => {
      const { container } = render(<Sparkline data={[5, 5, 5, 5, 5]} interpolation="linear" />);
      const path = container.querySelector("path");
      expect(path).toHaveAttribute("d", "M 1 22 L 20.5 22 L 40 22 L 59.5 22 L 79 22");
    });

    it("handles negative and positive values", () => {
      const { container } = render(<Sparkline data={[-10, 10]} interpolation="linear" />);
      const path = container.querySelector("path");
      expect(path).toHaveAttribute("d", "M 1 22 L 79 2");
    });

    it("handles very large values without producing NaN coordinates", () => {
      const { container } = render(<Sparkline data={[1, 1_000_000]} interpolation="linear" />);
      const path = container.querySelector("path");
      expect(path?.getAttribute("d")).not.toContain("NaN");
    });
  });

  describe("fill area", () => {
    it("does not render a fill path by default", () => {
      const { container } = render(<Sparkline data={[0, 10]} interpolation="linear" />);
      expect(container.querySelectorAll("path")).toHaveLength(1);
    });

    it("renders a closed fill path when fillArea is true", () => {
      const { container } = render(<Sparkline data={[0, 10]} interpolation="linear" fillArea />);
      const paths = container.querySelectorAll("path");
      expect(paths).toHaveLength(2);
      expect(paths[0]).toHaveAttribute("d", "M 1 22 L 79 2 L 79 22 L 1 22 Z");
      expect(paths[0]).toHaveAttribute("opacity", "0.12");
      expect(paths[1]).toHaveAttribute("d", "M 1 22 L 79 2");
    });
  });

  describe("appearance", () => {
    it("applies the default color and stroke width", () => {
      const { container } = render(<Sparkline data={[1, 2]} />);
      const path = container.querySelector("path:not([opacity])");
      expect(path).toHaveAttribute("stroke", "var(--fg-brand)");
      expect(path).toHaveAttribute("stroke-width", "1.5");
    });

    it("applies a custom color", () => {
      const { container } = render(<Sparkline data={[1, 2]} color="var(--fg-danger)" />);
      const path = container.querySelector("path:not([opacity])");
      expect(path).toHaveAttribute("stroke", "var(--fg-danger)");
    });

    it("applies a custom stroke width", () => {
      const { container } = render(<Sparkline data={[1, 2]} strokeWidth={3} />);
      const path = container.querySelector("path:not([opacity])");
      expect(path).toHaveAttribute("stroke-width", "3");
    });

    it("applies custom width and height to the svg", () => {
      const { container } = render(<Sparkline data={[1, 2]} width={120} height={32} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "120");
      expect(svg).toHaveAttribute("height", "32");
      expect(svg).toHaveAttribute("viewBox", "0 0 120 32");
    });
  });

  describe("className merging", () => {
    it("merges custom className with default classes", () => {
      const { container } = render(<Sparkline data={[1, 2]} className="custom-class" />);
      expect(container.firstElementChild).toHaveClass("custom-class");
      expect(container.firstElementChild).toHaveClass("inline-block");
    });

    it("spreads additional props onto the root element", () => {
      render(<Sparkline data={[1, 2]} data-testid="sparkline" />);
      expect(screen.getByTestId("sparkline")).toBeInTheDocument();
    });
  });
});
