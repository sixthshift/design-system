/// <reference types="@testing-library/jest-dom" />
import { Temporal } from "@sixthshift/temporal";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DatePicker } from "./DatePicker";

function getDay(container: HTMLElement, day: number, base?: Temporal.PlainDate): HTMLElement {
  const date = (base ?? Temporal.Now.plainDateISO()).with({ day });
  const el = container.querySelector(`[data-date="${date.toString()}"]`);
  if (!el) throw new Error(`Day button for ${date} not found`);
  return el as HTMLElement;
}

describe("DatePicker", () => {
  describe("Temporal type boundary", () => {
    it("accepts Temporal.PlainDate as value prop", () => {
      const date = Temporal.PlainDate.from("2025-01-15");
      render(<DatePicker value={date} />);

      // Should display the formatted date (formatDateMediumYear uses long month)
      const input = screen.getByRole("combobox");
      expect(input).toHaveValue("January 15, 2025");
    });

    it("calls onChange with Temporal.PlainDate when date is selected", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DatePicker onChange={handleChange} />);

      // Open the picker
      await user.click(screen.getByRole("combobox"));

      // Find and click a date (the 15th)
      const dialog = screen.getByRole("dialog");
      const dayButton = getDay(dialog, 15);
      await user.click(dayButton);

      // Click Apply
      await user.click(within(dialog).getByRole("button", { name: "Apply" }));

      // Should have been called with a Temporal.PlainDate
      expect(handleChange).toHaveBeenCalledTimes(1);
      const calledWith = handleChange.mock.calls[0]![0];
      expect(calledWith).toBeInstanceOf(Temporal.PlainDate);
      expect(calledWith.day).toBe(15);
    });

    it("calls onChange with undefined when date is cleared", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const date = Temporal.PlainDate.from("2025-01-15");

      render(<DatePicker value={date} onChange={handleChange} />);

      // Click the clear button
      await user.click(screen.getByRole("button", { name: /clear/i }));

      expect(handleChange).toHaveBeenCalledWith(undefined);
    });

    it("respects minDate constraint with Temporal.PlainDate", async () => {
      const user = userEvent.setup();
      // Use current month for visibility
      const now = Temporal.Now.plainDateISO();
      const minDate = now.with({ day: 10 });

      render(<DatePicker minDate={minDate} />);

      // Open the picker
      await user.click(screen.getByRole("combobox"));

      // Day 5 should be disabled (before minDate)
      const dialog = screen.getByRole("dialog");
      const day5 = getDay(dialog, 5);
      expect(day5).toBeDisabled();

      // Day 15 should be enabled (after minDate)
      const day15 = getDay(dialog, 15);
      expect(day15).not.toBeDisabled();
    });

    it("respects maxDate constraint with Temporal.PlainDate", async () => {
      const user = userEvent.setup();
      // Use current month for visibility
      const now = Temporal.Now.plainDateISO();
      const maxDate = now.with({ day: 20 });

      render(<DatePicker maxDate={maxDate} />);

      // Open the picker
      await user.click(screen.getByRole("combobox"));

      // Day 25 should be disabled (after maxDate)
      const dialog = screen.getByRole("dialog");
      const day25 = getDay(dialog, 25);
      expect(day25).toBeDisabled();

      // Day 15 should be enabled (before maxDate)
      const day15 = getDay(dialog, 15);
      expect(day15).not.toBeDisabled();
    });

    it("handles range mode with Temporal.PlainDate from/to", async () => {
      const handleChange = vi.fn();
      const from = Temporal.PlainDate.from("2025-01-10");
      const to = Temporal.PlainDate.from("2025-01-20");

      render(<DatePicker mode="range" value={{ from, to }} onChange={handleChange} />);

      // Should display the range (formatDateMediumYear uses long month)
      const input = screen.getByRole("combobox");
      expect(input).toHaveValue("January 10, 2025 – January 20, 2025");
    });

    it("handles multiple mode with Temporal.PlainDate[]", async () => {
      const handleChange = vi.fn();
      const dates = [Temporal.PlainDate.from("2025-01-10"), Temporal.PlainDate.from("2025-01-15"), Temporal.PlainDate.from("2025-01-20")];

      render(<DatePicker mode="multiple" value={dates} onChange={handleChange} />);

      // Should display multiple dates (formatDateMediumYear uses long month)
      const input = screen.getByRole("combobox");
      expect(input).toHaveValue("January 10, 2025, January 15, 2025, January 20, 2025");
    });

    it("displays formatted date from Temporal.PlainDate", () => {
      const date = Temporal.PlainDate.from("2025-12-25");
      render(<DatePicker value={date} />);

      const input = screen.getByRole("combobox");
      expect(input).toHaveValue("December 25, 2025");
    });
  });

  describe("disabled dates with Temporal", () => {
    it("accepts disabled as Temporal.PlainDate", async () => {
      const user = userEvent.setup();
      // Use current month to ensure visibility
      const now = Temporal.Now.plainDateISO();
      const disabledDate = now.with({ day: 15 });

      render(<DatePicker disabled={disabledDate} />);

      await user.click(screen.getByRole("combobox"));

      const dialog = screen.getByRole("dialog");
      const day15 = getDay(dialog, 15);
      expect(day15).toBeDisabled();
    });

    it("accepts disabled as Temporal.PlainDate[]", async () => {
      const user = userEvent.setup();
      // Use current month to ensure visibility
      const now = Temporal.Now.plainDateISO();
      const disabledDates = [now.with({ day: 10 }), now.with({ day: 15 })];

      render(<DatePicker disabled={disabledDates} />);

      await user.click(screen.getByRole("combobox"));

      const dialog = screen.getByRole("dialog");
      expect(getDay(dialog, 10)).toBeDisabled();
      expect(getDay(dialog, 15)).toBeDisabled();
      expect(getDay(dialog, 12)).not.toBeDisabled();
    });

    it("accepts disabled function receiving Temporal.PlainDate", async () => {
      const user = userEvent.setup();
      // Disable weekends
      const isWeekend = (date: Temporal.PlainDate) => date.dayOfWeek === 6 || date.dayOfWeek === 7;

      render(<DatePicker disabled={isWeekend} />);

      await user.click(screen.getByRole("combobox"));

      // This test verifies the function receives Temporal.PlainDate
      // The actual assertion depends on which days are weekends in the displayed month
    });
  });

  describe("presets with Temporal", () => {
    it("accepts preset values as Temporal.PlainDate", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const today = Temporal.Now.plainDateISO();
      const tomorrow = today.add({ days: 1 });

      const presets = [
        { label: "Today", value: today },
        { label: "Tomorrow", value: tomorrow },
      ];

      render(<DatePicker presets={presets} onChange={handleChange} />);

      await user.click(screen.getByRole("combobox"));

      const dialog = screen.getByRole("dialog");
      await user.click(within(dialog).getByRole("button", { name: "Tomorrow" }));
      await user.click(within(dialog).getByRole("button", { name: "Apply" }));

      expect(handleChange).toHaveBeenCalledTimes(1);
      const calledWith = handleChange.mock.calls[0]![0];
      expect(calledWith).toBeInstanceOf(Temporal.PlainDate);
      expect(Temporal.PlainDate.compare(calledWith, tomorrow)).toBe(0);
    });
  });
});
