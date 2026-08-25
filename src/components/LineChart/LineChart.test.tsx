/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { Interpolation, LineChartSeries } from "./LineChart";
import { LineChart } from "./LineChart";

// With yMin=0, yMax=10, height=200 (default), showAxes=true (default) the chart
// area is deterministic: padding = { top: 12, right: 16, bottom: 32, left: 48 },
// chartW = 600 - 48 - 16 = 536, chartH = 200 - 12 - 32 = 156.
const twoPoints: LineChartSeries[] = [
  {
    name: "Series",
    data: [
      { label: "A", value: 0 },
      { label: "B", value: 10 },
    ],
  },
];

const threePoints: LineChartSeries[] = [
  {
    name: "Series",
    data: [
      { label: "A", value: 0 },
      { label: "B", value: 5 },
      { label: "C", value: 10 },
    ],
  },
];

describe("LineChart", () => {
  describe("rendering", () => {
    it("renders an svg with an accessible title", () => {
      render(<LineChart series={twoPoints} />);
      expect(screen.getByRole("img", { name: "Line chart" })).toBeInTheDocument();
    });

    it("renders one line path per series", () => {
      const { container } = render(
        <LineChart
          series={[
            {
              name: "Tasks",
              data: [
                { label: "A", value: 1 },
                { label: "B", value: 2 },
              ],
            },
            {
              name: "Habits",
              data: [
                { label: "A", value: 3 },
                { label: "B", value: 4 },
              ],
            },
          ]}
        />
      );
      expect(container.querySelectorAll("path")).toHaveLength(2);
    });

    it("renders nothing extra for an empty series list", () => {
      const { container } = render(<LineChart series={[]} yMin={0} yMax={10} />);
      expect(container.querySelectorAll("path")).toHaveLength(0);
      expect(container.querySelectorAll("circle")).toHaveLength(0);
    });

    it("renders nothing for a series with empty data", () => {
      const { container } = render(<LineChart series={[{ name: "Empty", data: [] }]} yMin={0} yMax={10} />);
      expect(container.querySelectorAll("path")).toHaveLength(0);
      expect(container.querySelectorAll("circle")).toHaveLength(0);
    });
  });

  describe("path geometry", () => {
    it("builds an exact linear path for two points", () => {
      const { container } = render(<LineChart series={twoPoints} yMin={0} yMax={10} interpolation="linear" />);
      const path = container.querySelector("path");
      expect(path).toHaveAttribute("d", "M 48 168 L 584 12");
    });

    it.each([
      ["linear", "M 48 168 L 316 90 L 584 12"],
      ["monotone", "M 48 168 C 182 168, 182 90, 316 90 C 450 90, 450 12, 584 12"],
      ["stepAfter", "M 48 168 L 316 168 L 316 90 L 584 90 L 584 12"],
      ["stepBefore", "M 48 168 L 48 90 L 316 90 L 316 12 L 584 12"],
    ] as const satisfies readonly [Interpolation, string][])("builds the %s path for three points", (interpolation, expected) => {
      const { container } = render(<LineChart series={threePoints} yMin={0} yMax={10} interpolation={interpolation} />);
      const path = container.querySelector("path");
      expect(path).toHaveAttribute("d", expected);
    });

    it("builds a single-point path with only a moveto command", () => {
      const { container } = render(<LineChart series={[{ data: [{ label: "A", value: 5 }] }]} yMin={0} yMax={10} />);
      const path = container.querySelector("path");
      expect(path).toHaveAttribute("d", "M 48 90");
    });

    it("adds a closed fill-area path before the line when fillArea is true", () => {
      const { container } = render(<LineChart series={twoPoints} yMin={0} yMax={10} interpolation="linear" fillArea />);
      const paths = container.querySelectorAll("path");
      expect(paths).toHaveLength(2);
      expect(paths[0]).toHaveAttribute("d", "M 48 168 L 584 12 L 584 168 L 48 168 Z");
      expect(paths[0]).toHaveAttribute("opacity", "0.1");
      expect(paths[1]).toHaveAttribute("d", "M 48 168 L 584 12");
    });

    it("does not render a fill-area path when fillArea is false", () => {
      const { container } = render(<LineChart series={twoPoints} yMin={0} yMax={10} fillArea={false} />);
      expect(container.querySelectorAll("path")).toHaveLength(1);
    });
  });

  describe("dots", () => {
    it("renders a dot per data point by default", () => {
      const { container } = render(<LineChart series={threePoints} yMin={0} yMax={10} />);
      expect(container.querySelectorAll("circle")).toHaveLength(3);
    });

    it("hides dots when showDots is false", () => {
      const { container } = render(<LineChart series={threePoints} yMin={0} yMax={10} showDots={false} />);
      expect(container.querySelectorAll("circle")).toHaveLength(0);
    });

    it("positions dots using the same coordinates as the line path", () => {
      const { container } = render(<LineChart series={twoPoints} yMin={0} yMax={10} interpolation="linear" />);
      const circles = container.querySelectorAll("circle");
      expect(circles[0]).toHaveAttribute("cx", "48");
      expect(circles[0]).toHaveAttribute("cy", "168");
      expect(circles[1]).toHaveAttribute("cx", "584");
      expect(circles[1]).toHaveAttribute("cy", "12");
    });
  });

  describe("grid and axes", () => {
    it("renders dashed grid lines by default", () => {
      const { container } = render(<LineChart series={twoPoints} yMin={0} yMax={10} />);
      expect(container.querySelectorAll("line[stroke-dasharray]").length).toBeGreaterThan(0);
    });

    it("hides grid lines when showGrid is false", () => {
      const { container } = render(<LineChart series={twoPoints} yMin={0} yMax={10} showGrid={false} />);
      expect(container.querySelectorAll("line[stroke-dasharray]")).toHaveLength(0);
    });

    it("renders axis lines and y-tick labels by default", () => {
      const { container } = render(<LineChart series={twoPoints} yMin={0} yMax={10} />);
      // Two axis lines (y-axis + x-axis) without a dash pattern.
      expect(container.querySelectorAll("line:not([stroke-dasharray])")).toHaveLength(2);
      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("hides axis lines and y-tick labels when showAxes is false", () => {
      const { container } = render(<LineChart series={twoPoints} yMin={0} yMax={10} showAxes={false} />);
      expect(container.querySelectorAll("line:not([stroke-dasharray])")).toHaveLength(0);
      expect(screen.queryByText("0")).not.toBeInTheDocument();
    });

    it("renders x-axis labels by default", () => {
      render(<LineChart series={twoPoints} yMin={0} yMax={10} />);
      expect(screen.getByText("A")).toBeInTheDocument();
      expect(screen.getByText("B")).toBeInTheDocument();
    });

    it("hides x-axis labels when showLabels is false", () => {
      render(<LineChart series={twoPoints} yMin={0} yMax={10} showLabels={false} />);
      expect(screen.queryByText("A")).not.toBeInTheDocument();
    });
  });

  describe("value labels", () => {
    it("hides value labels by default", () => {
      const { container } = render(<LineChart series={twoPoints} yMin={0} yMax={10} />);
      // Per-point value labels use the "fill-fg-normal" class, distinct from y-tick labels.
      expect(container.querySelectorAll("text.fill-fg-normal")).toHaveLength(0);
    });

    it("shows formatted value labels when showValues is true", () => {
      const { container } = render(<LineChart series={twoPoints} yMin={0} yMax={10} showValues formatValue={(v) => `${v}pt`} />);
      const valueLabels = container.querySelectorAll("text.fill-fg-normal");
      expect(Array.from(valueLabels).map((el) => el.textContent)).toEqual(["0pt", "10pt"]);
    });
  });

  describe("formatValue", () => {
    it("formats y-axis tick labels", () => {
      render(<LineChart series={twoPoints} yMin={0} yMax={10} formatValue={(v) => `${v}%`} />);
      expect(screen.getByText("0%")).toBeInTheDocument();
      expect(screen.getByText("10%")).toBeInTheDocument();
    });
  });

  describe("colors", () => {
    it("cycles through the default series colors", () => {
      const { container } = render(
        <LineChart
          series={[{ data: [{ label: "A", value: 1 }] }, { data: [{ label: "A", value: 2 }] }, { data: [{ label: "A", value: 3 }] }]}
          yMin={0}
          yMax={10}
        />
      );
      const paths = container.querySelectorAll("path");
      expect(paths[0]).toHaveAttribute("stroke", "var(--fg-brand)");
      expect(paths[1]).toHaveAttribute("stroke", "var(--fg-success)");
      expect(paths[2]).toHaveAttribute("stroke", "var(--fg-warning)");
    });

    it("uses a custom series color when provided", () => {
      const { container } = render(<LineChart series={[{ data: threePoints[0]!.data, color: "var(--fg-danger)" }]} yMin={0} yMax={10} />);
      expect(container.querySelector("path")).toHaveAttribute("stroke", "var(--fg-danger)");
    });
  });

  describe("tooltip", () => {
    it("does not render a tooltip by default", async () => {
      render(<LineChart series={twoPoints} yMin={0} yMax={10} />);
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("shows tooltip text on hover when showTooltip is true", async () => {
      const user = userEvent.setup();
      const { container } = render(<LineChart series={twoPoints} yMin={0} yMax={10} showTooltip />);

      const trigger = container.querySelector("span");
      expect(trigger).not.toBeNull();
      await user.hover(trigger as HTMLElement);

      expect(await screen.findByRole("tooltip")).toBeInTheDocument();
      // twoPoints series has a name, so the tooltip prefixes with the series name.
      expect(screen.getByText("Series: 0")).toBeInTheDocument();
    });

    it("uses formatTooltip to build custom tooltip text", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <LineChart series={twoPoints} yMin={0} yMax={10} showTooltip formatTooltip={(point) => `${point.label} -> ${point.value}`} />
      );

      const trigger = container.querySelector("span");
      await user.hover(trigger as HTMLElement);

      expect(await screen.findByText("A -> 0")).toBeInTheDocument();
    });
  });

  describe("className merging", () => {
    it("merges custom className with default classes", () => {
      const { container } = render(<LineChart series={twoPoints} yMin={0} yMax={10} className="custom-class" />);
      expect(container.firstElementChild).toHaveClass("custom-class");
      expect(container.firstElementChild).toHaveClass("relative");
    });

    it("spreads additional props onto the root element", () => {
      render(<LineChart series={twoPoints} yMin={0} yMax={10} data-testid="line-chart" />);
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("handles negative values", () => {
      const { container } = render(
        <LineChart
          series={[
            {
              data: [
                { label: "A", value: -10 },
                { label: "B", value: 10 },
              ],
            },
          ]}
          yMin={-10}
          yMax={10}
          interpolation="linear"
        />
      );
      expect(container.querySelector("path")).toHaveAttribute("d", "M 48 168 L 584 12");
    });

    it("handles very large values without producing NaN coordinates", () => {
      const { container } = render(
        <LineChart
          series={[
            {
              data: [
                { label: "A", value: 1 },
                { label: "B", value: 1_000_000 },
              ],
            },
          ]}
          interpolation="linear"
        />
      );
      const path = container.querySelector("path");
      expect(path?.getAttribute("d")).not.toContain("NaN");
    });

    it("renders full text for a long x-axis label", () => {
      const longLabel = "This is an extremely long axis label that stays intact";
      render(
        <LineChart
          series={[
            {
              data: [
                { label: longLabel, value: 1 },
                { label: "B", value: 2 },
              ],
            },
          ]}
        />
      );
      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });
  });
});
