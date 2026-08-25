/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { BarChartItem } from "./BarChart";
import { BarChart } from "./BarChart";

const basicData: BarChartItem[] = [
  { label: "Tasks", value: 12 },
  { label: "Habits", value: 14 },
  { label: "Events", value: 6 },
];

describe("BarChart", () => {
  describe("rendering", () => {
    it("renders a row for each data item", () => {
      render(<BarChart data={basicData} />);
      expect(screen.getByText("Tasks")).toBeInTheDocument();
      expect(screen.getByText("Habits")).toBeInTheDocument();
      expect(screen.getByText("Events")).toBeInTheDocument();
    });

    it("renders formatted values by default", () => {
      render(<BarChart data={basicData} />);
      expect(screen.getByText("12")).toBeInTheDocument();
      expect(screen.getByText("14")).toBeInTheDocument();
      expect(screen.getByText("6")).toBeInTheDocument();
    });

    it("renders nothing when data is empty", () => {
      const { container } = render(<BarChart data={[]} />);
      expect(container.querySelectorAll(".transition-all")).toHaveLength(0);
      expect(container.textContent).toBe("");
    });

    it("renders a single item", () => {
      render(<BarChart data={[{ label: "Progress", value: 73 }]} />);
      expect(screen.getByText("Progress")).toBeInTheDocument();
      expect(screen.getByText("73")).toBeInTheDocument();
    });
  });

  describe("value display", () => {
    it("hides values when showValues is false", () => {
      render(<BarChart data={basicData} showValues={false} />);
      expect(screen.queryByText("12")).not.toBeInTheDocument();
      expect(screen.queryByText("14")).not.toBeInTheDocument();
      expect(screen.getByText("Tasks")).toBeInTheDocument();
    });

    it("formats values with formatValue", () => {
      render(<BarChart data={[{ label: "Sleep", value: 7.5 }]} formatValue={(v) => `${v}h`} />);
      expect(screen.getByText("7.5h")).toBeInTheDocument();
    });
  });

  describe("bar width", () => {
    it("sizes bars proportionally to the computed max value", () => {
      const { container } = render(
        <BarChart
          data={[
            { label: "A", value: 5 },
            { label: "B", value: 10 },
          ]}
        />
      );
      const fills = container.querySelectorAll<HTMLElement>(".transition-all");
      expect(fills[0]).toHaveStyle({ width: "50%" });
      expect(fills[1]).toHaveStyle({ width: "100%" });
    });

    it("renders 0% width for a zero value", () => {
      const { container } = render(
        <BarChart
          data={[
            { label: "A", value: 0 },
            { label: "B", value: 10 },
          ]}
        />
      );
      const fills = container.querySelectorAll<HTMLElement>(".transition-all");
      expect(fills[0]).toHaveStyle({ width: "0%" });
    });

    it("uses the maxValue prop instead of the computed max", () => {
      const { container } = render(<BarChart data={[{ label: "A", value: 25 }]} maxValue={50} />);
      const fills = container.querySelectorAll<HTMLElement>(".transition-all");
      expect(fills[0]).toHaveStyle({ width: "50%" });
    });

    it("clamps width to 100% when value exceeds maxValue", () => {
      const { container } = render(<BarChart data={[{ label: "A", value: 150 }]} maxValue={100} />);
      const fills = container.querySelectorAll<HTMLElement>(".transition-all");
      expect(fills[0]).toHaveStyle({ width: "100%" });
    });
  });

  describe("colors", () => {
    it("cycles through the default color palette by index", () => {
      const data: BarChartItem[] = [
        { label: "A", value: 1 },
        { label: "B", value: 1 },
        { label: "C", value: 1 },
        { label: "D", value: 1 },
        { label: "E", value: 1 },
        { label: "F", value: 1 },
      ];
      const { container } = render(<BarChart data={data} />);
      const fills = container.querySelectorAll<HTMLElement>(".transition-all");
      expect(fills[0]?.style.backgroundColor).toBe("var(--fg-brand)");
      expect(fills[1]?.style.backgroundColor).toBe("var(--fg-success)");
      expect(fills[2]?.style.backgroundColor).toBe("var(--fg-warning)");
      expect(fills[3]?.style.backgroundColor).toBe("var(--fg-danger)");
      expect(fills[4]?.style.backgroundColor).toBe("var(--fg-subtle)");
      // wraps back around to the first color
      expect(fills[5]?.style.backgroundColor).toBe("var(--fg-brand)");
    });

    it("uses a custom item color when provided", () => {
      const { container } = render(<BarChart data={[{ label: "A", value: 5, color: "var(--fg-danger)" }]} />);
      const fills = container.querySelectorAll<HTMLElement>(".transition-all");
      expect(fills[0]?.style.backgroundColor).toBe("var(--fg-danger)");
    });
  });

  describe("bar height", () => {
    it("applies the default bar height", () => {
      const { container } = render(<BarChart data={[{ label: "A", value: 5 }]} />);
      const track = container.querySelector<HTMLElement>(".bg-bg-subtle");
      expect(track).toHaveStyle({ height: "24px" });
    });

    it("applies a custom bar height", () => {
      const { container } = render(<BarChart data={[{ label: "A", value: 5 }]} barHeight={16} />);
      const track = container.querySelector<HTMLElement>(".bg-bg-subtle");
      expect(track).toHaveStyle({ height: "16px" });
    });
  });

  describe("className merging", () => {
    it("merges custom className with default classes", () => {
      const { container } = render(<BarChart data={basicData} className="custom-class" />);
      expect(container.firstElementChild).toHaveClass("custom-class");
      expect(container.firstElementChild).toHaveClass("flex-col");
    });

    it("spreads additional props onto the root element", () => {
      render(<BarChart data={basicData} data-testid="bar-chart" />);
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("renders negative values without crashing", () => {
      render(<BarChart data={[{ label: "Deficit", value: -5 }]} />);
      expect(screen.getByText("Deficit")).toBeInTheDocument();
      expect(screen.getByText("-5")).toBeInTheDocument();
    });

    it("renders very large values with a proportional bar", () => {
      const { container } = render(
        <BarChart
          data={[
            { label: "Small", value: 1 },
            { label: "Huge", value: 1_000_000 },
          ]}
        />
      );
      const fills = container.querySelectorAll<HTMLElement>(".transition-all");
      expect(fills[1]).toHaveStyle({ width: "100%" });
      expect(screen.getByText("1000000")).toBeInTheDocument();
    });

    it("renders the full text of a long label", () => {
      const longLabel = "This is an extremely long label that should not be truncated in the DOM text content";
      render(<BarChart data={[{ label: longLabel, value: 5 }]} />);
      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });
  });

  describe("width clamping", () => {
    it("clamps a negative value to a 0% bar rather than a negative width", () => {
      const { container } = render(<BarChart data={[{ label: "Negative", value: -50 }]} maxValue={100} />);
      const widths = Array.from(container.querySelectorAll<HTMLElement>("[style*='width']")).map((el) => el.style.width);
      expect(widths).not.toHaveLength(0);
      for (const width of widths) {
        expect(width.startsWith("-")).toBe(false);
      }
      expect(widths).toContain("0%");
    });
  });
});
