/// <reference types="@testing-library/jest-dom" />

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { addDaysISO, type ISODate, startOfMonthISO, todayISO } from "../../date-time";

import { DatePicker } from "./DatePicker";

/**
 * Nth day of a month, as an ISO date. Built with the ISO helpers rather than
 * Temporal, which is also the point: a consumer can compute test fixtures and
 * `presets` values without touching the date engine.
 */
function isoDay(day: number, base: ISODate = todayISO()): ISODate {
  return addDaysISO(startOfMonthISO(base), day - 1);
}

function getDay(container: HTMLElement, day: number, base?: ISODate): HTMLElement {
  const date = isoDay(day, base);
  const el = container.querySelector(`[data-date="${date}"]`);
  if (!el) throw new Error(`Day button for ${date} not found`);
  return el as HTMLElement;
}

describe("DatePicker", () => {
  describe("ISO string boundary", () => {
    it("accepts an ISO date as the value prop", () => {
      render(<DatePicker value="2025-01-15" />);

      // formatDateMediumYear uses a long month name.
      expect(screen.getByRole("combobox")).toHaveValue("January 15, 2025");
    });

    it("calls onChange with a canonical ISO date string when a date is selected", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DatePicker onChange={handleChange} />);

      await user.click(screen.getByRole("combobox"));

      const dialog = screen.getByRole("dialog");
      await user.click(getDay(dialog, 15));
      await user.click(within(dialog).getByRole("button", { name: "Apply" }));

      expect(handleChange).toHaveBeenCalledTimes(1);
      const calledWith = handleChange.mock.calls[0]?.[0];
      expect(typeof calledWith).toBe("string");
      expect(calledWith).toBe(isoDay(15));
    });

    it("calls onChange with undefined when the value is cleared", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DatePicker value="2025-01-15" onChange={handleChange} />);

      await user.click(screen.getByRole("button", { name: /clear/i }));

      expect(handleChange).toHaveBeenCalledWith(undefined);
    });

    it("respects an ISO minDate", async () => {
      const user = userEvent.setup();
      render(<DatePicker minDate={isoDay(10)} />);

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      expect(getDay(dialog, 5)).toBeDisabled();
      expect(getDay(dialog, 15)).not.toBeDisabled();
    });

    it("respects an ISO maxDate", async () => {
      const user = userEvent.setup();
      render(<DatePicker maxDate={isoDay(20)} />);

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      expect(getDay(dialog, 25)).toBeDisabled();
      expect(getDay(dialog, 15)).not.toBeDisabled();
    });

    it("handles range mode with ISO from/to", () => {
      render(<DatePicker mode="range" value={{ from: "2025-01-10", to: "2025-01-20" }} onChange={() => {}} />);

      expect(screen.getByRole("combobox")).toHaveValue("January 10, 2025 – January 20, 2025");
    });

    it("reports a range selection as ISO strings", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DatePicker mode="range" onChange={handleChange} />);

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");
      await user.click(getDay(dialog, 10));
      await user.click(getDay(dialog, 20));
      await user.click(within(dialog).getByRole("button", { name: "Apply" }));

      expect(handleChange).toHaveBeenCalledWith({ from: isoDay(10), to: isoDay(20) });
    });

    it("handles multiple mode with an ISO date array", () => {
      render(<DatePicker mode="multiple" value={["2025-01-10", "2025-01-15", "2025-01-20"]} onChange={() => {}} />);

      expect(screen.getByRole("combobox")).toHaveValue("January 10, 2025, January 15, 2025, January 20, 2025");
    });

    it("reports a multiple selection as an array of ISO strings", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DatePicker mode="multiple" onChange={handleChange} />);

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");
      await user.click(getDay(dialog, 10));
      await user.click(getDay(dialog, 12));
      await user.click(within(dialog).getByRole("button", { name: "Apply" }));

      expect(handleChange).toHaveBeenCalledWith([isoDay(10), isoDay(12)]);
    });

    it("formats a December date correctly", () => {
      render(<DatePicker value="2025-12-25" />);
      expect(screen.getByRole("combobox")).toHaveValue("December 25, 2025");
    });

    it("accepts a defaultValue as an ISO string in uncontrolled mode", () => {
      render(<DatePicker defaultValue="2025-03-07" />);
      expect(screen.getByRole("combobox")).toHaveValue("March 7, 2025");
    });
  });

  describe("hidden form inputs", () => {
    it("submits a single value as an ISO date", () => {
      const { container } = render(<DatePicker name="dueDate" value="2025-01-15" />);
      expect(container.querySelector('input[type="hidden"][name="dueDate"]')).toHaveValue("2025-01-15");
    });

    it("submits both ends of a range", () => {
      const { container } = render(<DatePicker mode="range" name="window" value={{ from: "2025-01-10", to: "2025-01-20" }} onChange={() => {}} />);
      expect(container.querySelector('input[name="window.from"]')).toHaveValue("2025-01-10");
      expect(container.querySelector('input[name="window.to"]')).toHaveValue("2025-01-20");
    });
  });

  describe("the disabled prop", () => {
    it("accepts a single ISO date", async () => {
      const user = userEvent.setup();
      render(<DatePicker disabled={isoDay(15)} />);

      await user.click(screen.getByRole("combobox"));
      expect(getDay(screen.getByRole("dialog"), 15)).toBeDisabled();
    });

    it("accepts an array of ISO dates", async () => {
      const user = userEvent.setup();
      render(<DatePicker disabled={[isoDay(10), isoDay(15)]} />);

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      expect(getDay(dialog, 10)).toBeDisabled();
      expect(getDay(dialog, 15)).toBeDisabled();
      expect(getDay(dialog, 12)).not.toBeDisabled();
    });

    it("accepts { before } and { after }", async () => {
      const user = userEvent.setup();
      const { unmount } = render(<DatePicker disabled={{ before: isoDay(10) }} />);
      await user.click(screen.getByRole("combobox"));
      expect(getDay(screen.getByRole("dialog"), 9)).toBeDisabled();
      expect(getDay(screen.getByRole("dialog"), 10)).not.toBeDisabled();
      unmount();

      render(<DatePicker disabled={{ after: isoDay(20) }} />);
      await user.click(screen.getByRole("combobox"));
      expect(getDay(screen.getByRole("dialog"), 21)).toBeDisabled();
      expect(getDay(screen.getByRole("dialog"), 20)).not.toBeDisabled();
    });

    it("disables weekends declaratively via { dayOfWeek }", async () => {
      const user = userEvent.setup();
      // Pin to a month whose weekend days are known: Feb 2025 starts on a Saturday,
      // so the 1st and 2nd are Sat/Sun and the 3rd is a Monday.
      render(<DatePicker value="2025-02-10" disabled={{ dayOfWeek: ["sat", "sun"] }} />);

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      expect(getDay(dialog, 1, "2025-02-01")).toBeDisabled();
      expect(getDay(dialog, 2, "2025-02-01")).toBeDisabled();
      expect(getDay(dialog, 3, "2025-02-01")).not.toBeDisabled();
    });

    it("hands a predicate ISO strings, and honours its result", async () => {
      const user = userEvent.setup();
      const seen: unknown[] = [];

      render(
        <DatePicker
          disabled={(date) => {
            seen.push(date);
            return date === isoDay(15);
          }}
        />
      );

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      expect(getDay(dialog, 15)).toBeDisabled();
      expect(getDay(dialog, 16)).not.toBeDisabled();
      expect(seen.length).toBeGreaterThan(0);
      expect(seen.every((entry) => typeof entry === "string")).toBe(true);
    });
  });

  describe("presets", () => {
    it("accepts ISO preset values and reports the choice as ISO", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const today = todayISO();
      const tomorrow = addDaysISO(today, 1);

      render(
        <DatePicker
          presets={[
            { label: "Today", value: today },
            { label: "Tomorrow", value: tomorrow },
          ]}
          onChange={handleChange}
        />
      );

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");
      await user.click(within(dialog).getByRole("button", { name: "Tomorrow" }));
      await user.click(within(dialog).getByRole("button", { name: "Apply" }));

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange.mock.calls[0]?.[0]).toBe(tomorrow);
    });
  });
});
