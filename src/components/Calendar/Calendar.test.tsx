/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Temporal } from "../../temporal";
import { Calendar } from "./Calendar";
import type { DateRangeValue, PresetOption } from "./calendar.types";

// The component derives "today" from `today()` in ../../temporal. Pin it to a
// fixed leap-day so `isToday` highlighting and the "Today" button are
// deterministic and don't rot as the real calendar date moves forward.
const FIXED_TODAY = Temporal.PlainDate.from("2024-02-29");

vi.mock("../../temporal", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../temporal")>();
  return {
    ...actual,
    today: () => FIXED_TODAY,
  };
});

function getDay(container: HTMLElement, date: Temporal.PlainDate): HTMLElement {
  const el = container.querySelector(`[data-date="${date.toString()}"]`);
  if (!el) throw new Error(`Day button for ${date.toString()} not found`);
  return el as HTMLElement;
}

const FEB_2024 = Temporal.PlainDate.from("2024-02-01");
const DEC_2024 = Temporal.PlainDate.from("2024-12-01");
const JAN_2025 = Temporal.PlainDate.from("2025-01-01");

describe("Calendar", () => {
  describe("rendering", () => {
    it("renders a grid", () => {
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    it("renders the month/year header", () => {
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      expect(screen.getByText("February 2024")).toBeInTheDocument();
    });

    it("renders default day-of-week labels starting on Sunday", () => {
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      expect(["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].every((label) => screen.getAllByText(label).length > 0)).toBe(true);
    });

    it("renders a button for every day in the month", () => {
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      // Feb 2024 has 29 days
      for (let day = 1; day <= 29; day++) {
        const date = FEB_2024.with({ day });
        expect(getDay(document.body, date)).toBeInTheDocument();
      }
    });

    it("renders 'Previous month' and 'Next month' navigation buttons", () => {
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      expect(screen.getByRole("button", { name: "Previous month" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Next month" })).toBeInTheDocument();
    });

    it("does not render a footer by default", () => {
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      expect(screen.queryByRole("button", { name: "Apply" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Today" })).not.toBeInTheDocument();
    });

    it("does not render a presets sidebar when no presets are given", () => {
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      expect(screen.queryAllByRole("button").some((btn) => btn.textContent === "Today")).toBe(false);
    });
  });

  describe("single mode", () => {
    it("renders with no selection", () => {
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      const day15 = getDay(document.body, FEB_2024.with({ day: 15 }));
      expect(day15).not.toHaveClass("bg-bg-brand");
    });

    it("calls onSelect with the clicked Temporal.PlainDate", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      render(<Calendar mode="single" value={undefined} onSelect={handleSelect} month={FEB_2024} onMonthChange={() => {}} />);

      await user.click(getDay(document.body, FEB_2024.with({ day: 15 })));

      expect(handleSelect).toHaveBeenCalledTimes(1);
      const calledWith = handleSelect.mock.calls[0]![0];
      expect(calledWith).toBeInstanceOf(Temporal.PlainDate);
      expect(Temporal.PlainDate.compare(calledWith, FEB_2024.with({ day: 15 }))).toBe(0);
    });

    it("marks the selected date with the selected class", () => {
      render(<Calendar mode="single" value={FEB_2024.with({ day: 15 })} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      const day15 = getDay(document.body, FEB_2024.with({ day: 15 }));
      expect(day15).toHaveClass("bg-bg-brand");
      const day16 = getDay(document.body, FEB_2024.with({ day: 16 }));
      expect(day16).not.toHaveClass("bg-bg-brand");
    });

    it("calls onSelect with undefined when the selected date is clicked again (toggle off)", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      const selected = FEB_2024.with({ day: 15 });
      render(<Calendar mode="single" value={selected} onSelect={handleSelect} month={FEB_2024} onMonthChange={() => {}} />);

      await user.click(getDay(document.body, selected));

      expect(handleSelect).toHaveBeenCalledWith(undefined);
    });

    it("is a controlled component: selecting a new date does not change the value prop rendering until re-rendered", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      const { rerender } = render(<Calendar mode="single" value={undefined} onSelect={handleSelect} month={FEB_2024} onMonthChange={() => {}} />);

      const day10 = getDay(document.body, FEB_2024.with({ day: 10 }));
      await user.click(day10);
      expect(day10).not.toHaveClass("bg-bg-brand");

      rerender(<Calendar mode="single" value={FEB_2024.with({ day: 10 })} onSelect={handleSelect} month={FEB_2024} onMonthChange={() => {}} />);
      expect(getDay(document.body, FEB_2024.with({ day: 10 }))).toHaveClass("bg-bg-brand");
    });
  });

  describe("multiple mode", () => {
    it("renders with an empty selection", () => {
      render(<Calendar mode="multiple" value={[]} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      const day15 = getDay(document.body, FEB_2024.with({ day: 15 }));
      expect(day15).not.toHaveClass("bg-bg-brand");
    });

    it("calls onSelect with the date appended when an unselected date is clicked", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      const existing = FEB_2024.with({ day: 5 });
      render(<Calendar mode="multiple" value={[existing]} onSelect={handleSelect} month={FEB_2024} onMonthChange={() => {}} />);

      await user.click(getDay(document.body, FEB_2024.with({ day: 10 })));

      expect(handleSelect).toHaveBeenCalledTimes(1);
      const calledWith = handleSelect.mock.calls[0]![0] as Temporal.PlainDate[];
      expect(calledWith).toHaveLength(2);
      expect(calledWith.some((d) => Temporal.PlainDate.compare(d, existing) === 0)).toBe(true);
      expect(calledWith.some((d) => Temporal.PlainDate.compare(d, FEB_2024.with({ day: 10 })) === 0)).toBe(true);
    });

    it("calls onSelect with the date removed when a selected date is clicked again", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      const dates = [FEB_2024.with({ day: 5 }), FEB_2024.with({ day: 10 })];
      render(<Calendar mode="multiple" value={dates} onSelect={handleSelect} month={FEB_2024} onMonthChange={() => {}} />);

      await user.click(getDay(document.body, FEB_2024.with({ day: 5 })));

      expect(handleSelect).toHaveBeenCalledTimes(1);
      const calledWith = handleSelect.mock.calls[0]![0] as Temporal.PlainDate[];
      expect(calledWith).toHaveLength(1);
      expect(Temporal.PlainDate.compare(calledWith[0]!, FEB_2024.with({ day: 10 }))).toBe(0);
    });

    it("marks all selected dates with the selected class", () => {
      const dates = [FEB_2024.with({ day: 5 }), FEB_2024.with({ day: 10 }), FEB_2024.with({ day: 20 })];
      render(<Calendar mode="multiple" value={dates} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);

      for (const date of dates) {
        expect(getDay(document.body, date)).toHaveClass("bg-bg-brand");
      }
      expect(getDay(document.body, FEB_2024.with({ day: 6 }))).not.toHaveClass("bg-bg-brand");
    });

    it("does not call onSelect to add beyond the max limit", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      const dates = [FEB_2024.with({ day: 1 }), FEB_2024.with({ day: 2 })];
      render(<Calendar mode="multiple" value={dates} onSelect={handleSelect} max={2} month={FEB_2024} onMonthChange={() => {}} />);

      await user.click(getDay(document.body, FEB_2024.with({ day: 3 })));

      expect(handleSelect).not.toHaveBeenCalled();
    });

    it("still allows removing a date when at the max limit", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      const dates = [FEB_2024.with({ day: 1 }), FEB_2024.with({ day: 2 })];
      render(<Calendar mode="multiple" value={dates} onSelect={handleSelect} max={2} month={FEB_2024} onMonthChange={() => {}} />);

      await user.click(getDay(document.body, FEB_2024.with({ day: 1 })));

      expect(handleSelect).toHaveBeenCalledTimes(1);
      const calledWith = handleSelect.mock.calls[0]![0] as Temporal.PlainDate[];
      expect(calledWith).toHaveLength(1);
    });

    it("allows adding under the max limit", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      const dates = [FEB_2024.with({ day: 1 })];
      render(<Calendar mode="multiple" value={dates} onSelect={handleSelect} max={2} month={FEB_2024} onMonthChange={() => {}} />);

      await user.click(getDay(document.body, FEB_2024.with({ day: 2 })));

      expect(handleSelect).toHaveBeenCalledTimes(1);
      const calledWith = handleSelect.mock.calls[0]![0] as Temporal.PlainDate[];
      expect(calledWith).toHaveLength(2);
    });
  });

  describe("range mode", () => {
    it("renders with no selection", () => {
      render(<Calendar mode="range" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      const day15 = getDay(document.body, FEB_2024.with({ day: 15 }));
      expect(day15).not.toHaveClass("bg-bg-brand");
    });

    it("sets 'from' on the first click", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      render(<Calendar mode="range" value={undefined} onSelect={handleSelect} month={FEB_2024} onMonthChange={() => {}} />);

      await user.click(getDay(document.body, FEB_2024.with({ day: 10 })));

      expect(handleSelect).toHaveBeenCalledWith({ from: expect.anything(), to: undefined });
      const range = handleSelect.mock.calls[0]![0] as DateRangeValue;
      expect(Temporal.PlainDate.compare(range.from!, FEB_2024.with({ day: 10 }))).toBe(0);
      expect(range.to).toBeUndefined();
    });

    it("sets 'to' on the second click when the date is after 'from'", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      const from = FEB_2024.with({ day: 10 });
      render(<Calendar mode="range" value={{ from, to: undefined }} onSelect={handleSelect} month={FEB_2024} onMonthChange={() => {}} />);

      await user.click(getDay(document.body, FEB_2024.with({ day: 20 })));

      const range = handleSelect.mock.calls[0]![0] as DateRangeValue;
      expect(Temporal.PlainDate.compare(range.from!, from)).toBe(0);
      expect(Temporal.PlainDate.compare(range.to!, FEB_2024.with({ day: 20 }))).toBe(0);
    });

    it("swaps 'from' and 'to' when the second click is before 'from'", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      const from = FEB_2024.with({ day: 20 });
      render(<Calendar mode="range" value={{ from, to: undefined }} onSelect={handleSelect} month={FEB_2024} onMonthChange={() => {}} />);

      await user.click(getDay(document.body, FEB_2024.with({ day: 10 })));

      const range = handleSelect.mock.calls[0]![0] as DateRangeValue;
      expect(Temporal.PlainDate.compare(range.from!, FEB_2024.with({ day: 10 }))).toBe(0);
      expect(Temporal.PlainDate.compare(range.to!, from)).toBe(0);
    });

    it("starts a new range when clicking after both 'from' and 'to' are set", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      const from = FEB_2024.with({ day: 10 });
      const to = FEB_2024.with({ day: 20 });
      render(<Calendar mode="range" value={{ from, to }} onSelect={handleSelect} month={FEB_2024} onMonthChange={() => {}} />);

      await user.click(getDay(document.body, FEB_2024.with({ day: 5 })));

      const range = handleSelect.mock.calls[0]![0] as DateRangeValue;
      expect(Temporal.PlainDate.compare(range.from!, FEB_2024.with({ day: 5 }))).toBe(0);
      expect(range.to).toBeUndefined();
    });

    it("marks the start of a range with the selected class", () => {
      const from = FEB_2024.with({ day: 10 });
      const to = FEB_2024.with({ day: 20 });
      render(<Calendar mode="range" value={{ from, to }} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      expect(getDay(document.body, from)).toHaveClass("bg-bg-brand");
    });

    it("marks the end of a range with the selected class", () => {
      const from = FEB_2024.with({ day: 10 });
      const to = FEB_2024.with({ day: 20 });
      render(<Calendar mode="range" value={{ from, to }} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      expect(getDay(document.body, to)).toHaveClass("bg-bg-brand");
    });

    it("marks dates between 'from' and 'to' with the middle-of-range class", () => {
      const from = FEB_2024.with({ day: 10 });
      const to = FEB_2024.with({ day: 20 });
      render(<Calendar mode="range" value={{ from, to }} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      const middle = getDay(document.body, FEB_2024.with({ day: 15 }));
      expect(middle).toHaveClass("bg-bg-brand-subtle");
      expect(middle).not.toHaveClass("bg-bg-brand");
    });

    it("does not mark dates outside the range", () => {
      const from = FEB_2024.with({ day: 10 });
      const to = FEB_2024.with({ day: 20 });
      render(<Calendar mode="range" value={{ from, to }} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      const outside = getDay(document.body, FEB_2024.with({ day: 25 }));
      expect(outside).not.toHaveClass("bg-bg-brand");
      expect(outside).not.toHaveClass("bg-bg-brand-subtle");
    });

    it("marks a single-day range (from === to) with the selected class", () => {
      const day = FEB_2024.with({ day: 10 });
      render(<Calendar mode="range" value={{ from: day, to: day }} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      expect(getDay(document.body, day)).toHaveClass("bg-bg-brand");
    });
  });

  describe("navigation", () => {
    it("calls onMonthChange with the previous month when clicking 'Previous month'", async () => {
      const user = userEvent.setup();
      const handleMonthChange = vi.fn();
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={handleMonthChange} />);

      await user.click(screen.getByRole("button", { name: "Previous month" }));

      const newMonth = handleMonthChange.mock.calls[0]![0] as Temporal.PlainDate;
      expect(newMonth.year).toBe(2024);
      expect(newMonth.month).toBe(1);
    });

    it("calls onMonthChange with the next month when clicking 'Next month'", async () => {
      const user = userEvent.setup();
      const handleMonthChange = vi.fn();
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={handleMonthChange} />);

      await user.click(screen.getByRole("button", { name: "Next month" }));

      const newMonth = handleMonthChange.mock.calls[0]![0] as Temporal.PlainDate;
      expect(newMonth.year).toBe(2024);
      expect(newMonth.month).toBe(3);
    });

    it("navigates from December into January of the next year", async () => {
      const user = userEvent.setup();
      const handleMonthChange = vi.fn();
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={DEC_2024} onMonthChange={handleMonthChange} />);

      await user.click(screen.getByRole("button", { name: "Next month" }));

      const newMonth = handleMonthChange.mock.calls[0]![0] as Temporal.PlainDate;
      expect(newMonth.year).toBe(2025);
      expect(newMonth.month).toBe(1);
    });

    it("navigates from January into December of the previous year", async () => {
      const user = userEvent.setup();
      const handleMonthChange = vi.fn();
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={JAN_2025} onMonthChange={handleMonthChange} />);

      await user.click(screen.getByRole("button", { name: "Previous month" }));

      const newMonth = handleMonthChange.mock.calls[0]![0] as Temporal.PlainDate;
      expect(newMonth.year).toBe(2024);
      expect(newMonth.month).toBe(12);
    });

    it("re-renders the grid for the new month when the month prop changes", () => {
      const { rerender } = render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      expect(screen.getByText("February 2024")).toBeInTheDocument();

      rerender(<Calendar mode="single" value={undefined} onSelect={() => {}} month={DEC_2024} onMonthChange={() => {}} />);
      expect(screen.getByText("December 2024")).toBeInTheDocument();
      expect(screen.queryByText("February 2024")).not.toBeInTheDocument();
    });
  });

  describe("disabled dates", () => {
    it("disables a single disabled date", () => {
      const disabledDate = FEB_2024.with({ day: 15 });
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} disabled={disabledDate} />);
      expect(getDay(document.body, disabledDate)).toBeDisabled();
      expect(getDay(document.body, FEB_2024.with({ day: 16 }))).not.toBeDisabled();
    });

    it("disables an array of dates", () => {
      const disabledDates = [FEB_2024.with({ day: 5 }), FEB_2024.with({ day: 15 })];
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} disabled={disabledDates} />);
      expect(getDay(document.body, FEB_2024.with({ day: 5 }))).toBeDisabled();
      expect(getDay(document.body, FEB_2024.with({ day: 15 }))).toBeDisabled();
      expect(getDay(document.body, FEB_2024.with({ day: 6 }))).not.toBeDisabled();
    });

    it("disables dates matching a predicate function", () => {
      const isWeekend = (date: Temporal.PlainDate) => date.dayOfWeek === 6 || date.dayOfWeek === 7;
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} disabled={isWeekend} />);
      // Feb 3, 2024 is a Saturday
      expect(getDay(document.body, FEB_2024.with({ day: 3 })).dataset.date).toBe("2024-02-03");
      expect(getDay(document.body, FEB_2024.with({ day: 3 }))).toBeDisabled();
      // Feb 5, 2024 is a Monday
      expect(getDay(document.body, FEB_2024.with({ day: 5 }))).not.toBeDisabled();
    });

    it("disables dates before a 'before' matcher", () => {
      render(
        <Calendar
          mode="single"
          value={undefined}
          onSelect={() => {}}
          month={FEB_2024}
          onMonthChange={() => {}}
          disabled={{ before: FEB_2024.with({ day: 10 }) }}
        />
      );
      expect(getDay(document.body, FEB_2024.with({ day: 5 }))).toBeDisabled();
      expect(getDay(document.body, FEB_2024.with({ day: 10 }))).not.toBeDisabled();
      expect(getDay(document.body, FEB_2024.with({ day: 15 }))).not.toBeDisabled();
    });

    it("disables dates after an 'after' matcher", () => {
      render(
        <Calendar
          mode="single"
          value={undefined}
          onSelect={() => {}}
          month={FEB_2024}
          onMonthChange={() => {}}
          disabled={{ after: FEB_2024.with({ day: 20 }) }}
        />
      );
      expect(getDay(document.body, FEB_2024.with({ day: 25 }))).toBeDisabled();
      expect(getDay(document.body, FEB_2024.with({ day: 20 }))).not.toBeDisabled();
      expect(getDay(document.body, FEB_2024.with({ day: 15 }))).not.toBeDisabled();
    });

    it("disables dates within a 'from'/'to' range matcher (inclusive)", () => {
      render(
        <Calendar
          mode="single"
          value={undefined}
          onSelect={() => {}}
          month={FEB_2024}
          onMonthChange={() => {}}
          disabled={{ from: FEB_2024.with({ day: 10 }), to: FEB_2024.with({ day: 15 }) }}
        />
      );
      expect(getDay(document.body, FEB_2024.with({ day: 10 }))).toBeDisabled();
      expect(getDay(document.body, FEB_2024.with({ day: 12 }))).toBeDisabled();
      expect(getDay(document.body, FEB_2024.with({ day: 15 }))).toBeDisabled();
      expect(getDay(document.body, FEB_2024.with({ day: 9 }))).not.toBeDisabled();
      expect(getDay(document.body, FEB_2024.with({ day: 16 }))).not.toBeDisabled();
    });

    it("disables dates matching any matcher in an array of matchers", () => {
      const isWeekend = (date: Temporal.PlainDate) => date.dayOfWeek === 6 || date.dayOfWeek === 7;
      render(
        <Calendar
          mode="single"
          value={undefined}
          onSelect={() => {}}
          month={FEB_2024}
          onMonthChange={() => {}}
          disabled={[isWeekend, FEB_2024.with({ day: 14 })]}
        />
      );
      // Feb 3, 2024 is a Saturday (matches predicate)
      expect(getDay(document.body, FEB_2024.with({ day: 3 }))).toBeDisabled();
      // Feb 14 is a Wednesday, matched by the explicit date
      expect(getDay(document.body, FEB_2024.with({ day: 14 }))).toBeDisabled();
      // Feb 13 is a Tuesday, matches neither
      expect(getDay(document.body, FEB_2024.with({ day: 13 }))).not.toBeDisabled();
    });

    it("applies disabled styling classes", () => {
      const disabledDate = FEB_2024.with({ day: 15 });
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} disabled={disabledDate} />);
      const day = getDay(document.body, disabledDate);
      expect(day).toHaveClass("cursor-not-allowed");
      expect(day).toHaveClass("opacity-50");
    });

    it("does not call onSelect when a disabled date is clicked", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      const disabledDate = FEB_2024.with({ day: 15 });
      render(<Calendar mode="single" value={undefined} onSelect={handleSelect} month={FEB_2024} onMonthChange={() => {}} disabled={disabledDate} />);

      // A disabled button won't dispatch a click event via user-event, but assert
      // the invariant explicitly regardless of how the click is attempted.
      await user.click(getDay(document.body, disabledDate));

      expect(handleSelect).not.toHaveBeenCalled();
    });
  });

  describe("min/max dates", () => {
    it("disables dates before minDate", () => {
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} minDate={FEB_2024.with({ day: 10 })} />);
      expect(getDay(document.body, FEB_2024.with({ day: 5 }))).toBeDisabled();
      expect(getDay(document.body, FEB_2024.with({ day: 10 }))).not.toBeDisabled();
      expect(getDay(document.body, FEB_2024.with({ day: 15 }))).not.toBeDisabled();
    });

    it("disables dates after maxDate", () => {
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} maxDate={FEB_2024.with({ day: 20 })} />);
      expect(getDay(document.body, FEB_2024.with({ day: 25 }))).toBeDisabled();
      expect(getDay(document.body, FEB_2024.with({ day: 20 }))).not.toBeDisabled();
      expect(getDay(document.body, FEB_2024.with({ day: 15 }))).not.toBeDisabled();
    });

    it("only enables dates within both minDate and maxDate", () => {
      render(
        <Calendar
          mode="single"
          value={undefined}
          onSelect={() => {}}
          month={FEB_2024}
          onMonthChange={() => {}}
          minDate={FEB_2024.with({ day: 10 })}
          maxDate={FEB_2024.with({ day: 20 })}
        />
      );
      expect(getDay(document.body, FEB_2024.with({ day: 5 }))).toBeDisabled();
      expect(getDay(document.body, FEB_2024.with({ day: 25 }))).toBeDisabled();
      expect(getDay(document.body, FEB_2024.with({ day: 10 }))).not.toBeDisabled();
      expect(getDay(document.body, FEB_2024.with({ day: 15 }))).not.toBeDisabled();
      expect(getDay(document.body, FEB_2024.with({ day: 20 }))).not.toBeDisabled();
    });

    it("disables every date when maxDate is before minDate", () => {
      render(
        <Calendar
          mode="single"
          value={undefined}
          onSelect={() => {}}
          month={FEB_2024}
          onMonthChange={() => {}}
          minDate={FEB_2024.with({ day: 10 })}
          maxDate={FEB_2024.with({ day: 5 })}
        />
      );
      for (let day = 1; day <= 29; day++) {
        expect(getDay(document.body, FEB_2024.with({ day }))).toBeDisabled();
      }
    });
  });

  describe("presets", () => {
    it("renders a preset button for each preset (single mode)", () => {
      const presets: PresetOption<Temporal.PlainDate>[] = [
        { label: "Today", value: FIXED_TODAY },
        { label: "Tomorrow", value: FIXED_TODAY.add({ days: 1 }) },
      ];
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} presets={presets} />);

      expect(screen.getByRole("button", { name: "Today" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Tomorrow" })).toBeInTheDocument();
    });

    it("calls onSelect with the preset value when a single-mode preset is clicked", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      const tomorrow = FIXED_TODAY.add({ days: 1 });
      const presets: PresetOption<Temporal.PlainDate>[] = [{ label: "Tomorrow", value: tomorrow }];
      render(<Calendar mode="single" value={undefined} onSelect={handleSelect} month={FEB_2024} onMonthChange={() => {}} presets={presets} />);

      await user.click(screen.getByRole("button", { name: "Tomorrow" }));

      expect(handleSelect).toHaveBeenCalledTimes(1);
      const calledWith = handleSelect.mock.calls[0]![0] as Temporal.PlainDate;
      expect(Temporal.PlainDate.compare(calledWith, tomorrow)).toBe(0);
    });

    it("calls onSelect with the preset range when a range-mode preset is clicked", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      const range: DateRangeValue = { from: FEB_2024.with({ day: 10 }), to: FEB_2024.with({ day: 20 }) };
      const presets: PresetOption<DateRangeValue>[] = [{ label: "Custom range", value: range }];
      render(<Calendar mode="range" value={undefined} onSelect={handleSelect} month={FEB_2024} onMonthChange={() => {}} presets={presets} />);

      await user.click(screen.getByRole("button", { name: "Custom range" }));

      expect(handleSelect).toHaveBeenCalledTimes(1);
      const calledWith = handleSelect.mock.calls[0]![0] as DateRangeValue;
      expect(Temporal.PlainDate.compare(calledWith.from!, range.from!)).toBe(0);
      expect(Temporal.PlainDate.compare(calledWith.to!, range.to!)).toBe(0);
    });

    it("calls onSelect with the preset array when a multiple-mode preset is clicked", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      const dates = [FEB_2024.with({ day: 1 }), FEB_2024.with({ day: 2 })];
      const presets: PresetOption<Temporal.PlainDate[]>[] = [{ label: "First two days", value: dates }];
      render(<Calendar mode="multiple" value={[]} onSelect={handleSelect} month={FEB_2024} onMonthChange={() => {}} presets={presets} />);

      await user.click(screen.getByRole("button", { name: "First two days" }));

      expect(handleSelect).toHaveBeenCalledTimes(1);
      const calledWith = handleSelect.mock.calls[0]![0] as Temporal.PlainDate[];
      expect(calledWith).toHaveLength(2);
    });

    it("highlights the active preset that matches the current value", () => {
      const tomorrow = FIXED_TODAY.add({ days: 1 });
      const presets: PresetOption<Temporal.PlainDate>[] = [
        { label: "Today", value: FIXED_TODAY },
        { label: "Tomorrow", value: tomorrow },
      ];
      render(<Calendar mode="single" value={tomorrow} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} presets={presets} />);

      expect(screen.getByRole("button", { name: "Tomorrow" })).toHaveClass("bg-bg-brand-subtle");
      expect(screen.getByRole("button", { name: "Today" })).not.toHaveClass("bg-bg-brand-subtle");
    });

    it("does not highlight any preset when the value doesn't match", () => {
      const presets: PresetOption<Temporal.PlainDate>[] = [{ label: "Today", value: FIXED_TODAY }];
      render(<Calendar mode="single" value={FEB_2024.with({ day: 3 })} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} presets={presets} />);

      expect(screen.getByRole("button", { name: "Today" })).not.toHaveClass("bg-bg-brand-subtle");
    });
  });

  describe("footer", () => {
    it("renders Apply and Cancel buttons when handlers are provided and showFooter is true", () => {
      render(
        <Calendar
          mode="single"
          value={undefined}
          onSelect={() => {}}
          month={FEB_2024}
          onMonthChange={() => {}}
          showFooter
          onApply={() => {}}
          onCancel={() => {}}
        />
      );
      expect(screen.getByRole("button", { name: "Apply" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("calls onApply when Apply is clicked", async () => {
      const user = userEvent.setup();
      const handleApply = vi.fn();
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} showFooter onApply={handleApply} />);

      await user.click(screen.getByRole("button", { name: "Apply" }));

      expect(handleApply).toHaveBeenCalledTimes(1);
    });

    it("calls onCancel when Cancel is clicked", async () => {
      const user = userEvent.setup();
      const handleCancel = vi.fn();
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} showFooter onCancel={handleCancel} />);

      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it("renders the Today button when showFooter and showToday are true and mode is not range", () => {
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} showFooter showToday />);
      expect(screen.getByRole("button", { name: "Today" })).toBeInTheDocument();
    });

    it("does not render the Today button when showToday is false", () => {
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} showFooter showToday={false} />);
      expect(screen.queryByRole("button", { name: "Today" })).not.toBeInTheDocument();
    });

    it("does not render the Today button in range mode even when showToday is true", () => {
      render(<Calendar mode="range" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} showFooter showToday />);
      expect(screen.queryByRole("button", { name: "Today" })).not.toBeInTheDocument();
    });

    it("selects the fixed today's date and navigates to today's month when Today is clicked (single mode)", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      const handleMonthChange = vi.fn();
      render(<Calendar mode="single" value={undefined} onSelect={handleSelect} month={FEB_2024} onMonthChange={handleMonthChange} showFooter showToday />);

      await user.click(screen.getByRole("button", { name: "Today" }));

      const selected = handleSelect.mock.calls[0]![0] as Temporal.PlainDate;
      expect(Temporal.PlainDate.compare(selected, FIXED_TODAY)).toBe(0);
      const newMonth = handleMonthChange.mock.calls[0]![0] as Temporal.PlainDate;
      expect(Temporal.PlainDate.compare(newMonth, FIXED_TODAY)).toBe(0);
    });

    it("appends today's date in multiple mode when Today is clicked", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      const existing = [FEB_2024.with({ day: 5 })];
      render(<Calendar mode="multiple" value={existing} onSelect={handleSelect} month={FEB_2024} onMonthChange={() => {}} showFooter showToday />);

      await user.click(screen.getByRole("button", { name: "Today" }));

      const calledWith = handleSelect.mock.calls[0]![0] as Temporal.PlainDate[];
      expect(calledWith).toHaveLength(2);
      expect(calledWith.some((d) => Temporal.PlainDate.compare(d, FIXED_TODAY) === 0)).toBe(true);
    });

    it("does not duplicate today's date in multiple mode if already selected", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      const handleMonthChange = vi.fn();
      const existing = [FIXED_TODAY];
      render(<Calendar mode="multiple" value={existing} onSelect={handleSelect} month={FEB_2024} onMonthChange={handleMonthChange} showFooter showToday />);

      await user.click(screen.getByRole("button", { name: "Today" }));

      expect(handleSelect).not.toHaveBeenCalled();
      // Month navigation still happens even if the date was already selected.
      expect(handleMonthChange).toHaveBeenCalledTimes(1);
    });
  });

  describe("today highlighting", () => {
    it("marks the fixed today's date with a ring class when unselected", () => {
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      const todayButton = getDay(document.body, FIXED_TODAY);
      expect(todayButton).toHaveClass("ring-1");
    });

    it("does not apply the today ring class to other days", () => {
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      const otherDay = getDay(document.body, FEB_2024.with({ day: 10 }));
      expect(otherDay).not.toHaveClass("ring-1");
    });

    it("omits the today ring class when today is selected (selection style takes over)", () => {
      render(<Calendar mode="single" value={FIXED_TODAY} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      const todayButton = getDay(document.body, FIXED_TODAY);
      expect(todayButton).not.toHaveClass("ring-1");
      expect(todayButton).toHaveClass("bg-bg-brand");
    });

    it("does not mark any day as today when the displayed month doesn't include today", () => {
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={DEC_2024} onMonthChange={() => {}} />);
      const decemberDays = document.querySelectorAll('[data-date^="2024-12-"]');
      expect(decemberDays.length).toBeGreaterThan(0);
      decemberDays.forEach((day) => {
        expect(day).not.toHaveClass("ring-1");
      });
    });
  });

  describe("keyboard interaction", () => {
    it("gives today's day button tabIndex 0 and other day buttons tabIndex -1", () => {
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      expect(getDay(document.body, FIXED_TODAY)).toHaveAttribute("tabIndex", "0");
      expect(getDay(document.body, FEB_2024.with({ day: 10 }))).toHaveAttribute("tabIndex", "-1");
    });

    it("selects a focused day button by pressing Enter", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      render(<Calendar mode="single" value={undefined} onSelect={handleSelect} month={FEB_2024} onMonthChange={() => {}} />);

      getDay(document.body, FIXED_TODAY).focus();
      await user.keyboard("{Enter}");

      expect(handleSelect).toHaveBeenCalledTimes(1);
    });

    it("selects a focused day button by pressing Space", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      render(<Calendar mode="single" value={undefined} onSelect={handleSelect} month={FEB_2024} onMonthChange={() => {}} />);

      getDay(document.body, FIXED_TODAY).focus();
      await user.keyboard(" ");

      expect(handleSelect).toHaveBeenCalledTimes(1);
    });

    it("navigates to the previous month via the keyboard-activatable nav button", async () => {
      const user = userEvent.setup();
      const handleMonthChange = vi.fn();
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={handleMonthChange} />);

      screen.getByRole("button", { name: "Previous month" }).focus();
      await user.keyboard("{Enter}");

      expect(handleMonthChange).toHaveBeenCalledTimes(1);
    });

    it("does not select a disabled day when Enter is pressed on it", () => {
      const handleSelect = vi.fn();
      const disabledDate = FIXED_TODAY;
      render(<Calendar mode="single" value={undefined} onSelect={handleSelect} month={FEB_2024} onMonthChange={() => {}} disabled={disabledDate} />);

      const button = getDay(document.body, disabledDate);
      expect(button).toBeDisabled();
      // Disabled buttons cannot receive focus or activation; the handler must
      // never have been invoked.
      expect(handleSelect).not.toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("exposes the day grid via role='grid'", () => {
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    it("gives navigation buttons accessible names", () => {
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      expect(screen.getByRole("button", { name: "Previous month" })).toHaveAttribute("aria-label", "Previous month");
      expect(screen.getByRole("button", { name: "Next month" })).toHaveAttribute("aria-label", "Next month");
    });

    it("gives each day button an accessible name matching its formatted date", () => {
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      expect(getDay(document.body, FEB_2024.with({ day: 15 }))).toHaveAttribute("aria-label", "February 15, 2024");
    });

    it("marks disabled day buttons with the native disabled attribute", () => {
      const disabledDate = FEB_2024.with({ day: 15 });
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} disabled={disabledDate} />);
      expect(getDay(document.body, disabledDate)).toHaveAttribute("disabled");
    });
  });

  describe("className merging", () => {
    it("merges a custom className onto the root element", () => {
      const { container } = render(
        <Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} className="custom-calendar" />
      );
      expect(container.firstElementChild).toHaveClass("custom-calendar");
    });

    it("keeps the base layout class alongside a custom className", () => {
      const { container } = render(
        <Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} className="custom-calendar" />
      );
      expect(container.firstElementChild).toHaveClass("flex");
    });
  });

  describe("weekStartsOn day labels", () => {
    it.each([0, 1, 2, 3, 4, 5, 6] as const)("rotates the day-of-week header to start on day %i", (weekStartsOn) => {
      const expected = [
        ...["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].slice(weekStartsOn),
        ...["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].slice(0, weekStartsOn),
      ];

      const { container } = render(
        <Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} weekStartsOn={weekStartsOn} />
      );

      const labels = Array.from(container.querySelectorAll(".grid.grid-cols-7"))[0]?.children;
      expect(labels).toBeDefined();
      const labelTexts = Array.from(labels!).map((el) => el.textContent);
      expect(labelTexts).toEqual(expected);
    });
  });

  describe("weekStartsOn grid alignment", () => {
    it("starts the grid on Sunday before the 1st when weekStartsOn=0 (Feb 2024 starts on Thursday)", () => {
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} weekStartsOn={0} />);
      // Sunday Jan 28, 2024 should be the first rendered leading day from the previous month.
      const jan28 = document.querySelector('[data-date="2024-01-28"]');
      expect(jan28).toBeNull(); // leading days outside the current month render as empty placeholders, not day buttons
      expect(getDay(document.body, FEB_2024.with({ day: 1 }))).toBeInTheDocument();
    });

    it("starts the grid on Monday before the 1st when weekStartsOn=1 (Feb 2024 starts on Thursday)", () => {
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} weekStartsOn={1} />);
      expect(getDay(document.body, FEB_2024.with({ day: 1 }))).toBeInTheDocument();
    });

    it("renders the same number of leading blank cells consistent with a 6-week (42-day) grid", () => {
      const { container: gridSunday } = render(
        <Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} weekStartsOn={0} />
      );
      const dayGrid = gridSunday.querySelector('[role="grid"]');
      expect(dayGrid?.children).toHaveLength(42);
    });
  });

  describe("edge cases", () => {
    it("renders Feb 29 on a leap year", () => {
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      expect(getDay(document.body, Temporal.PlainDate.from("2024-02-29"))).toBeInTheDocument();
    });

    it("does not render Feb 29 on a non-leap year", () => {
      const feb2025 = Temporal.PlainDate.from("2025-02-01");
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={feb2025} onMonthChange={() => {}} />);
      expect(document.querySelector('[data-date="2025-02-29"]')).toBeNull();
      expect(getDay(document.body, Temporal.PlainDate.from("2025-02-28"))).toBeInTheDocument();
    });

    it("handles an empty multiple-mode value array", () => {
      render(<Calendar mode="multiple" value={[]} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    it("handles a range value with only 'from' set", () => {
      render(
        <Calendar mode="range" value={{ from: FEB_2024.with({ day: 10 }), to: undefined }} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />
      );
      const day = getDay(document.body, FEB_2024.with({ day: 10 }));
      expect(day).toHaveClass("bg-bg-brand");
    });

    it("handles a range value with only 'to' set", () => {
      render(
        <Calendar mode="range" value={{ from: undefined, to: FEB_2024.with({ day: 10 }) }} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />
      );
      const day = getDay(document.body, FEB_2024.with({ day: 10 }));
      expect(day).toHaveClass("bg-bg-brand");
    });

    it("renders correctly when no presets, footer, or disabled dates are configured", () => {
      render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
      expect(screen.getByRole("grid")).toBeInTheDocument();
      expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    });
  });
});
