/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeatMapCalendar } from "./HeatMapCalendar";
import type { HeatMapCell } from "./heat-map.utils";

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

describe("HeatMapCalendar", () => {
  describe("rendering", () => {
    it("renders nothing when data is empty", () => {
      const { container } = render(<HeatMapCalendar data={[]} />);
      expect(container).toBeEmptyDOMElement();
    });

    it("renders one svg (month) with an accessible img role for a single-month dataset", () => {
      render(<HeatMapCalendar data={cells({ "2025-01-15": 1 })} />);
      expect(screen.getAllByRole("img")).toHaveLength(1);
    });

    it("labels the month svg with the month and year", () => {
      render(<HeatMapCalendar data={cells({ "2025-01-15": 1 })} />);
      expect(screen.getByTitle("Jan 2025")).toBeInTheDocument();
    });

    it("renders a rect for every day in the month, not just the days with data", () => {
      // January 2025 has 31 days
      const { container } = render(<HeatMapCalendar data={cells({ "2025-01-15": 5 })} />);
      expect(container.querySelectorAll("rect")).toHaveLength(31);
    });

    it("renders a single data point", () => {
      const { container } = render(<HeatMapCalendar data={cells({ "2025-01-15": 5 })} />);
      expect(container.querySelectorAll("rect").length).toBeGreaterThan(0);
    });
  });

  describe("month spanning", () => {
    it("renders one svg per month spanned by the data, including months with no data points", () => {
      // Jan 15 -> Mar 3 spans Jan, Feb, Mar even though Feb has no data point
      render(<HeatMapCalendar data={cells({ "2025-01-15": 1, "2025-03-03": 2 })} />);
      expect(screen.getByTitle("Jan 2025")).toBeInTheDocument();
      expect(screen.getByTitle("Feb 2025")).toBeInTheDocument();
      expect(screen.getByTitle("Mar 2025")).toBeInTheDocument();
      expect(screen.getAllByRole("img")).toHaveLength(3);
    });

    it("crosses a year boundary correctly", () => {
      render(<HeatMapCalendar data={cells({ "2024-12-28": 1, "2025-01-05": 2 })} />);
      expect(screen.getByTitle("Dec 2024")).toBeInTheDocument();
      expect(screen.getByTitle("Jan 2025")).toBeInTheDocument();
      expect(screen.getAllByRole("img")).toHaveLength(2);
    });

    it("renders a single svg when all data falls in the same month", () => {
      render(<HeatMapCalendar data={cells({ "2025-01-01": 1, "2025-01-31": 2 })} />);
      expect(screen.getAllByRole("img")).toHaveLength(1);
    });
  });

  describe("leap years", () => {
    it("renders 29 days for February in a leap year (2024)", () => {
      const { container } = render(<HeatMapCalendar data={cells({ "2024-02-15": 1 })} />);
      expect(container.querySelectorAll("rect")).toHaveLength(29);
    });

    it("renders 28 days for February in a non-leap year (2023)", () => {
      const { container } = render(<HeatMapCalendar data={cells({ "2023-02-15": 1 })} />);
      expect(container.querySelectorAll("rect")).toHaveLength(28);
    });
  });

  describe("weekday alignment", () => {
    it("positions the 1st of the month according to its day of week", () => {
      // Jan 1 2025 is a Wednesday -> col 2 (Monday = col 0)
      render(<HeatMapCalendar data={cells({ "2025-01-01": 1 })} formatTooltip={(cell) => cell.date} />);
      expect(cellByTooltip("2025-01-01")).toHaveAttribute("x", String(2 * 14));
    });

    it("positions a Monday in column 0", () => {
      // 2025-01-06 is a Monday
      render(<HeatMapCalendar data={cells({ "2025-01-06": 1 })} formatTooltip={(cell) => cell.date} />);
      expect(cellByTooltip("2025-01-06")).toHaveAttribute("x", "0");
    });

    it("positions a Sunday in the last column", () => {
      // 2025-01-12 is a Sunday
      render(<HeatMapCalendar data={cells({ "2025-01-12": 1 })} formatTooltip={(cell) => cell.date} />);
      expect(cellByTooltip("2025-01-12")).toHaveAttribute("x", String(6 * 14));
    });
  });

  describe("day labels", () => {
    it("renders the day-of-week labels for each month", () => {
      render(<HeatMapCalendar data={cells({ "2025-01-15": 1, "2025-03-03": 1 })} />);
      const dayLabelTexts = screen.getAllByText("M");
      // one "M" label per month svg (Jan, Feb, Mar)
      expect(dayLabelTexts).toHaveLength(3);
    });
  });

  describe("color scale bucketing", () => {
    it("fills a zero-value cell (no data for that day) with the first color-scale entry", () => {
      render(<HeatMapCalendar data={cells({ "2025-01-01": 1 })} formatTooltip={(cell) => cell.date} />);
      // Jan 2, 2025 has no data point, defaults to value 0
      expect(cellByTooltip("2025-01-02")).toHaveAttribute("fill", "var(--bg-subtle)");
    });

    it("fills the max-value cell with the top color-scale entry", () => {
      render(<HeatMapCalendar data={cells({ "2025-01-01": 1, "2025-01-02": 4 })} formatTooltip={(cell) => cell.date} />);
      expect(cellByTooltip("2025-01-02")).toHaveAttribute("fill", "var(--bg-brand-strong)");
    });

    it("buckets intermediate values proportionally across a 3-value scale", () => {
      // max is 3, default scale has 4 stops (0..3): ratios 1/3, 2/3, 3/3 map exactly to buckets 1, 2, 3
      render(<HeatMapCalendar data={cells({ "2025-01-01": 1, "2025-01-02": 2, "2025-01-03": 3 })} formatTooltip={(cell) => cell.date} />);
      expect(cellByTooltip("2025-01-01")).toHaveAttribute("fill", "var(--bg-brand-subtle)");
      expect(cellByTooltip("2025-01-02")).toHaveAttribute("fill", "var(--bg-brand)");
      expect(cellByTooltip("2025-01-03")).toHaveAttribute("fill", "var(--bg-brand-strong)");
    });

    it("applies a custom color scale", () => {
      render(
        <HeatMapCalendar
          data={cells({ "2025-01-01": 1 })}
          colorScale={["var(--bg-subtle)", "var(--bg-danger-subtle)", "var(--bg-danger)", "var(--bg-danger-strong)"]}
          formatTooltip={(cell) => cell.date}
        />
      );
      expect(cellByTooltip("2025-01-01")).toHaveAttribute("fill", "var(--bg-danger-strong)");
    });
  });

  describe("sizing props", () => {
    it("uses default cellSize/cellGap to size the grid width (7 columns)", () => {
      const { container } = render(<HeatMapCalendar data={cells({ "2025-01-15": 1 })} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", String(7 * 14));
    });

    it("honors a custom cellSize and cellGap", () => {
      const { container } = render(<HeatMapCalendar data={cells({ "2025-01-15": 1 })} cellSize={20} cellGap={5} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", String(7 * 25));
    });
  });

  describe("tooltips", () => {
    it("does not render a title on cells when formatTooltip is not provided", () => {
      const { container } = render(<HeatMapCalendar data={cells({ "2025-01-15": 1 })} />);
      const rects = Array.from(container.querySelectorAll("rect"));
      for (const rect of rects) {
        expect(rect.querySelector("title")).not.toBeInTheDocument();
      }
    });

    it("renders the formatted tooltip text as a title on the cell", () => {
      render(<HeatMapCalendar data={cells({ "2025-01-15": 7 })} formatTooltip={(cell) => `${cell.date}: ${cell.value}`} />);
      expect(screen.getByText("2025-01-15: 7")).toBeInTheDocument();
    });
  });

  describe("className merging", () => {
    it("merges custom className with the default wrapper classes", () => {
      const { container } = render(<HeatMapCalendar data={cells({ "2025-01-15": 1 })} className="custom-class" />);
      expect(container.firstElementChild).toHaveClass("custom-class");
      expect(container.firstElementChild).toHaveClass("flex");
      expect(container.firstElementChild).toHaveClass("flex-wrap");
    });
  });

  describe("prop spreading", () => {
    it("spreads additional props onto the wrapper div", () => {
      render(<HeatMapCalendar data={cells({ "2025-01-15": 1 })} data-testid="calendar-root" />);
      expect(screen.getByTestId("calendar-root")).toBeInTheDocument();
    });
  });
});
