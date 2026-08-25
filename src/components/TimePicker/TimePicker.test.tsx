/// <reference types="@testing-library/jest-dom" />

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Temporal } from "../../date-time";

import { TimePicker } from "./TimePicker";

// Mock scrollTo for JSDOM
beforeAll(() => {
  Element.prototype.scrollTo = vi.fn();
});

describe("TimePicker", () => {
  describe("Temporal type boundary", () => {
    it("accepts Temporal.PlainTime as value prop", () => {
      const time = Temporal.PlainTime.from("14:30");
      render(<TimePicker value={time} />);

      // Should display the formatted time (02:30 PM in 12h format)
      const input = screen.getByRole("combobox");
      expect(input).toHaveValue("02:30 PM");
    });

    it("calls onChange with Temporal.PlainTime when time is selected", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      // Use 24h format to avoid AM/PM complexity
      render(<TimePicker onChange={handleChange} clockFormat="24h" />);

      // Open the picker
      await user.click(screen.getByRole("combobox"));

      const dialog = screen.getByRole("dialog");

      // Select hour 03
      const columns = within(dialog).getAllByRole("listbox");
      expect(columns.length).toBeGreaterThanOrEqual(2);
      await user.click(within(columns[0]!).getByRole("option", { name: "03" }));

      // Select minute 45
      await user.click(within(columns[1]!).getByRole("option", { name: "45" }));

      // Click Apply
      await user.click(within(dialog).getByRole("button", { name: "Apply" }));

      // Should have been called with a Temporal.PlainTime
      expect(handleChange).toHaveBeenCalledTimes(1);
      const calledWith = handleChange.mock.calls[0]![0];
      expect(calledWith).toBeInstanceOf(Temporal.PlainTime);
      expect(calledWith.hour).toBe(3);
      expect(calledWith.minute).toBe(45);
    });

    it("calls onChange with undefined when time is cleared", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const time = Temporal.PlainTime.from("14:30");

      render(<TimePicker value={time} onChange={handleChange} />);

      // Click the clear button
      await user.click(screen.getByRole("button", { name: /clear/i }));

      expect(handleChange).toHaveBeenCalledWith(undefined);
    });

    it("respects minTime constraint with Temporal.PlainTime", async () => {
      const user = userEvent.setup();
      const minTime = Temporal.PlainTime.from("09:00");
      const handleChange = vi.fn();

      render(<TimePicker minTime={minTime} onChange={handleChange} clockFormat="24h" />);

      // Open the picker
      await user.click(screen.getByRole("combobox"));

      const dialog = screen.getByRole("dialog");

      // Select 08:00 (before minTime)
      const columns = within(dialog).getAllByRole("listbox");
      expect(columns.length).toBeGreaterThanOrEqual(2);
      await user.click(within(columns[0]!).getByRole("option", { name: "08" }));

      await user.click(within(columns[1]!).getByRole("option", { name: "00" }));

      // Click Apply - should not apply since time is before minTime
      await user.click(within(dialog).getByRole("button", { name: "Apply" }));

      // onChange should not have been called (or dialog should still be open)
      expect(handleChange).not.toHaveBeenCalled();
    });

    it("respects maxTime constraint with Temporal.PlainTime", async () => {
      const user = userEvent.setup();
      const maxTime = Temporal.PlainTime.from("17:00");
      const handleChange = vi.fn();

      render(<TimePicker maxTime={maxTime} onChange={handleChange} clockFormat="24h" />);

      // Open the picker
      await user.click(screen.getByRole("combobox"));

      const dialog = screen.getByRole("dialog");

      // Select 18:00 (after maxTime)
      const columns = within(dialog).getAllByRole("listbox");
      expect(columns.length).toBeGreaterThanOrEqual(2);
      await user.click(within(columns[0]!).getByRole("option", { name: "18" }));

      await user.click(within(columns[1]!).getByRole("option", { name: "00" }));

      // Click Apply - should not apply since time is after maxTime
      await user.click(within(dialog).getByRole("button", { name: "Apply" }));

      // onChange should not have been called
      expect(handleChange).not.toHaveBeenCalled();
    });

    it("displays formatted time from Temporal.PlainTime in 24h format", () => {
      const time = Temporal.PlainTime.from("14:30:45");
      render(<TimePicker value={time} clockFormat="24h" />);

      const input = screen.getByRole("combobox");
      expect(input).toHaveValue("14:30");
    });

    it("displays formatted time from Temporal.PlainTime in 12h format", () => {
      const time = Temporal.PlainTime.from("14:30");
      render(<TimePicker value={time} clockFormat="12h" />);

      const input = screen.getByRole("combobox");
      expect(input).toHaveValue("02:30 PM");
    });
  });

  describe("presets with Temporal", () => {
    it("accepts preset values as Temporal.PlainTime", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const morning = Temporal.PlainTime.from("09:00");
      const afternoon = Temporal.PlainTime.from("14:00");

      const presets = [
        { label: "Morning", value: morning },
        { label: "Afternoon", value: afternoon },
      ];

      render(<TimePicker presets={presets} onChange={handleChange} />);

      await user.click(screen.getByRole("combobox"));

      const dialog = screen.getByRole("dialog");
      await user.click(within(dialog).getByRole("button", { name: "Afternoon" }));
      await user.click(within(dialog).getByRole("button", { name: "Apply" }));

      expect(handleChange).toHaveBeenCalledTimes(1);
      const calledWith = handleChange.mock.calls[0]![0];
      expect(calledWith).toBeInstanceOf(Temporal.PlainTime);
      expect(calledWith.hour).toBe(14);
      expect(calledWith.minute).toBe(0);
    });
  });

  describe("seconds support with Temporal", () => {
    it("preserves seconds from Temporal.PlainTime when format is HH:mm:ss", () => {
      const time = Temporal.PlainTime.from("14:30:45");
      render(<TimePicker value={time} format="HH:mm:ss" clockFormat="24h" />);

      const input = screen.getByRole("combobox");
      expect(input).toHaveValue("14:30:45");
    });

    it("returns Temporal.PlainTime with seconds when format is HH:mm:ss", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<TimePicker format="HH:mm:ss" clockFormat="24h" onChange={handleChange} />);

      await user.click(screen.getByRole("combobox"));

      const dialog = screen.getByRole("dialog");

      // Select hour, minute, second
      const columns = within(dialog).getAllByRole("listbox");
      expect(columns.length).toBeGreaterThanOrEqual(3);
      await user.click(within(columns[0]!).getByRole("option", { name: "10" }));
      await user.click(within(columns[1]!).getByRole("option", { name: "30" }));
      await user.click(within(columns[2]!).getByRole("option", { name: "15" }));

      await user.click(within(dialog).getByRole("button", { name: "Apply" }));

      expect(handleChange).toHaveBeenCalledTimes(1);
      const calledWith = handleChange.mock.calls[0]![0];
      expect(calledWith).toBeInstanceOf(Temporal.PlainTime);
      expect(calledWith.hour).toBe(10);
      expect(calledWith.minute).toBe(30);
      expect(calledWith.second).toBe(15);
    });
  });
});
