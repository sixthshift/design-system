/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeatMapMatrix } from "./HeatMapMatrix";
import type { HeatMapCell } from "./heat-map.utils";
import { getIntensity } from "./heat-map.utils";

// Fixed dates instead of "today" so tests never break as the calendar rolls
// over. Monday 2025-01-06 through Sunday 2025-01-12 is one full ISO week.
const MON = "2025-01-06";
const TUE = "2025-01-07";
const WED = "2025-01-08";
const SUN = "2025-01-12";
const NEXT_MON = "2025-01-13";

function cells(values: Record<string, number>): HeatMapCell[] {
  return Object.entries(values).map(([date, value]) => ({ date, value }));
}

/** Locates the <rect> cell whose tooltip <title> matches the given text. */
function cellByTooltip(text: string): Element {
  const title = screen.getByText(text);
  const rect = title.closest("rect");
  if (!rect) throw new Error(`no rect ancestor for tooltip "${text}"`);
  return rect;
}

describe("HeatMapMatrix", () => {
  describe("rendering", () => {
    it("renders nothing when data is empty", () => {
      const { container } = render(<HeatMapMatrix data={[]} />);
      expect(container).toBeEmptyDOMElement();
    });

    it("renders an svg with an accessible img role", () => {
      render(<HeatMapMatrix data={cells({ [MON]: 1 })} />);
      expect(screen.getByRole("img")).toBeInTheDocument();
    });

    it("renders a title on the svg", () => {
      render(<HeatMapMatrix data={cells({ [MON]: 1 })} />);
      expect(screen.getByTitle("Heat map")).toBeInTheDocument();
    });

    it("renders one rect per data point", () => {
      const { container } = render(<HeatMapMatrix data={cells({ [MON]: 1, [TUE]: 2, [WED]: 3 })} />);
      expect(container.querySelectorAll("rect")).toHaveLength(3);
    });

    it("renders a single data point", () => {
      const { container } = render(<HeatMapMatrix data={cells({ [MON]: 5 })} />);
      expect(container.querySelectorAll("rect")).toHaveLength(1);
    });
  });

  describe("day labels", () => {
    it("shows day labels by default", () => {
      const { container } = render(<HeatMapMatrix data={cells({ [MON]: 1 })} />);
      const labels = Array.from(container.querySelectorAll("text")).map((el) => el.textContent);
      expect(labels).toEqual(["M", "T", "W", "T", "F", "S", "S"]);
    });

    it("hides day labels when showDayLabels is false", () => {
      const { container } = render(<HeatMapMatrix data={cells({ [MON]: 1 })} showDayLabels={false} />);
      expect(container.querySelectorAll("text")).toHaveLength(0);
    });

    it("reduces svg height when day labels are hidden", () => {
      const withLabels = render(<HeatMapMatrix data={cells({ [MON]: 1 })} showDayLabels />);
      const withLabelsHeight = Number(withLabels.container.querySelector("svg")?.getAttribute("height"));
      withLabels.unmount();

      const withoutLabels = render(<HeatMapMatrix data={cells({ [MON]: 1 })} showDayLabels={false} />);
      const withoutLabelsHeight = Number(withoutLabels.container.querySelector("svg")?.getAttribute("height"));

      expect(withLabelsHeight - withoutLabelsHeight).toBe(14);
    });
  });

  describe("sizing props", () => {
    it("uses default cellSize/cellGap to size the grid (7 columns)", () => {
      const { container } = render(<HeatMapMatrix data={cells({ [MON]: 1 })} />);
      const svg = container.querySelector("svg");
      // default cellSize 12 + cellGap 2 = step 14; 7 columns wide
      expect(svg).toHaveAttribute("width", String(7 * 14));
    });

    it("honors a custom cellSize and cellGap", () => {
      const { container } = render(<HeatMapMatrix data={cells({ [MON]: 1 })} cellSize={20} cellGap={5} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", String(7 * 25));
    });

    it("sizes a single-row week with default step", () => {
      const { container } = render(<HeatMapMatrix data={cells({ [MON]: 1, [SUN]: 1 })} showDayLabels={false} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("height", String(14));
    });

    it("wraps into a second row once a new week starts", () => {
      const { container } = render(<HeatMapMatrix data={cells({ [MON]: 1, [SUN]: 1, [NEXT_MON]: 1 })} showDayLabels={false} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("height", String(2 * 14));
    });
  });

  describe("row wrapping and column alignment", () => {
    it("places a Monday cell in column 0", () => {
      const { container } = render(<HeatMapMatrix data={cells({ [MON]: 1 })} showDayLabels={false} />);
      const rect = container.querySelector("rect");
      expect(rect).toHaveAttribute("x", "0");
    });

    it("places a Sunday cell in the last column", () => {
      const { container } = render(<HeatMapMatrix data={cells({ [SUN]: 1 })} showDayLabels={false} />);
      const rect = container.querySelector("rect");
      expect(rect).toHaveAttribute("x", String(6 * 14));
    });

    it("keeps a full Mon-Sun week on a single row", () => {
      const { container } = render(<HeatMapMatrix data={cells({ [MON]: 1, [TUE]: 1, [SUN]: 1 })} showDayLabels={false} />);
      const ys = new Set(Array.from(container.querySelectorAll("rect")).map((el) => el.getAttribute("y")));
      expect(ys.size).toBe(1);
    });

    it("starts a new row for the following Monday", () => {
      const { container } = render(<HeatMapMatrix data={cells({ [MON]: 1, [SUN]: 1, [NEXT_MON]: 1 })} showDayLabels={false} />);
      const ys = Array.from(container.querySelectorAll("rect")).map((el) => el.getAttribute("y"));
      expect(new Set(ys).size).toBe(2);
      // second Monday starts a fresh row at y = 0 (labelHeight 0 + row index 1 * step 14)
      expect(ys).toContain("14");
    });

    it("sorts unordered input data before laying out rows", () => {
      const { container } = render(<HeatMapMatrix data={cells({ [TUE]: 1, [MON]: 1, [SUN]: 1 })} showDayLabels={false} />);
      const rects = Array.from(container.querySelectorAll("rect"));
      expect(rects.map((el) => el.getAttribute("x"))).toEqual(["0", "14", String(6 * 14)]);
    });
  });

  describe("color scale bucketing", () => {
    it("fills a zero-value cell with the first color-scale entry", () => {
      render(<HeatMapMatrix data={cells({ [MON]: 0, [TUE]: 4 })} formatTooltip={(cell) => cell.date} />);
      expect(cellByTooltip(MON)).toHaveAttribute("fill", "var(--bg-subtle)");
    });

    it("fills the max-value cell with the top color-scale entry", () => {
      render(<HeatMapMatrix data={cells({ [MON]: 1, [TUE]: 4 })} formatTooltip={(cell) => cell.date} />);
      expect(cellByTooltip(TUE)).toHaveAttribute("fill", "var(--bg-brand-strong)");
    });

    it("buckets intermediate values proportionally across a 3-value scale", () => {
      // max is 3, default scale has 4 stops (0..3): ratios 1/3, 2/3, 3/3 map exactly to buckets 1, 2, 3
      render(<HeatMapMatrix data={cells({ [MON]: 1, [TUE]: 2, [WED]: 3 })} formatTooltip={(cell) => cell.date} />);
      expect(cellByTooltip(MON)).toHaveAttribute("fill", "var(--bg-brand-subtle)");
      expect(cellByTooltip(TUE)).toHaveAttribute("fill", "var(--bg-brand)");
      expect(cellByTooltip(WED)).toHaveAttribute("fill", "var(--bg-brand-strong)");
    });

    it("applies a custom color scale", () => {
      render(
        <HeatMapMatrix
          data={cells({ [MON]: 1 })}
          colorScale={["var(--bg-subtle)", "var(--bg-success-subtle)", "var(--bg-success)", "var(--bg-success-strong)"]}
          formatTooltip={(cell) => cell.date}
        />
      );
      expect(cellByTooltip(MON)).toHaveAttribute("fill", "var(--bg-success-strong)");
    });

    it("collapses to a binary scale when only two colors are provided", () => {
      render(<HeatMapMatrix data={cells({ [MON]: 1, [TUE]: 4 })} colorScale={["var(--bg-subtle)", "var(--bg-brand)"]} formatTooltip={(cell) => cell.date} />);
      // With only 2 stops any positive value maps to the single non-zero bucket
      expect(cellByTooltip(MON)).toHaveAttribute("fill", "var(--bg-brand)");
      expect(cellByTooltip(TUE)).toHaveAttribute("fill", "var(--bg-brand)");
    });
  });

  describe("getIntensity boundaries (shared bucketing helper)", () => {
    it("returns 0 for a zero or negative value", () => {
      expect(getIntensity(0, 10, 4)).toBe(0);
      expect(getIntensity(-5, 10, 4)).toBe(0);
    });

    it("returns 0 when max is zero or negative", () => {
      expect(getIntensity(5, 0, 4)).toBe(0);
      expect(getIntensity(5, -1, 4)).toBe(0);
    });

    it("returns the top bucket exactly at the max value", () => {
      expect(getIntensity(10, 10, 4)).toBe(3);
    });

    it("clamps values above the max to the top bucket", () => {
      expect(getIntensity(999, 10, 4)).toBe(3);
    });

    it("rounds up to the nearest bucket for values between boundaries", () => {
      expect(getIntensity(1, 3, 4)).toBe(1);
      expect(getIntensity(2, 3, 4)).toBe(2);
      expect(getIntensity(3, 3, 4)).toBe(3);
    });

    it("never returns bucket 0 for a positive value, however small", () => {
      expect(getIntensity(1, 1_000_000, 4)).toBe(1);
    });
  });

  describe("tooltips", () => {
    it("does not render a title on cells when formatTooltip is not provided", () => {
      const { container } = render(<HeatMapMatrix data={cells({ [MON]: 1 })} showDayLabels={false} />);
      const rect = container.querySelector("rect");
      expect(rect?.querySelector("title")).not.toBeInTheDocument();
    });

    it("renders the formatted tooltip text as a title on the cell", () => {
      render(<HeatMapMatrix data={cells({ [MON]: 7 })} formatTooltip={(cell) => `${cell.date}: ${cell.value}`} />);
      expect(screen.getByText(`${MON}: 7`)).toBeInTheDocument();
    });
  });

  describe("className merging", () => {
    it("merges custom className with the default wrapper classes", () => {
      const { container } = render(<HeatMapMatrix data={cells({ [MON]: 1 })} className="custom-class" />);
      expect(container.firstElementChild).toHaveClass("custom-class");
      expect(container.firstElementChild).toHaveClass("inline-block");
    });
  });

  describe("prop spreading", () => {
    it("spreads additional props onto the wrapper div", () => {
      render(<HeatMapMatrix data={cells({ [MON]: 1 })} data-testid="matrix-root" />);
      expect(screen.getByTestId("matrix-root")).toBeInTheDocument();
    });
  });
});
