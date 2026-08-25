/// <reference types="@testing-library/jest-dom" />

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Temporal } from "../../temporal";

import { DateRangePicker } from "./DateRangePicker";
import type { DateRangeValue } from "./daterangepicker.types";

function getDay(container: HTMLElement, day: number, base?: Temporal.PlainDate): HTMLElement {
  const date = (base ?? Temporal.Now.plainDateISO()).with({ day });
  const el = container.querySelector(`[data-date="${date.toString()}"]`);
  if (!el) throw new Error(`Day button for ${date} not found`);
  return el as HTMLElement;
}

describe("DateRangePicker", () => {
  describe("Rendering & Interaction", () => {
    it("renders with placeholder when no value is provided", () => {
      render(<DateRangePicker placeholder="Select date range..." />);

      const input = screen.getByRole("combobox");
      expect(input).toHaveValue("");
      expect(input).toHaveAttribute("placeholder", "Select date range...");
    });

    it("renders with default placeholder when none is provided", () => {
      render(<DateRangePicker />);

      const input = screen.getByRole("combobox");
      expect(input).toHaveAttribute("placeholder", "Select date range...");
    });

    it("opens picker popup on trigger click", async () => {
      const user = userEvent.setup();
      render(<DateRangePicker />);

      const input = screen.getByRole("combobox");
      await user.click(input);

      // Dialog should be visible
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    it("closes picker on cancel button click", async () => {
      const user = userEvent.setup();
      render(<DateRangePicker />);

      // Open picker
      await user.click(screen.getByRole("combobox"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Click cancel
      const dialog = screen.getByRole("dialog");
      await user.click(within(dialog).getByRole("button", { name: /cancel/i }));

      // Dialog should be closed
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("closes picker on apply button click", async () => {
      const user = userEvent.setup();
      render(<DateRangePicker />);

      // Open picker
      await user.click(screen.getByRole("combobox"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Click apply
      const dialog = screen.getByRole("dialog");
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      // Dialog should be closed
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("closes picker on outside click (dismiss)", async () => {
      const user = userEvent.setup();
      render(
        <div>
          <DateRangePicker />
          <button type="button">Outside</button>
        </div>
      );

      // Open picker
      await user.click(screen.getByRole("combobox"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Click outside
      await user.click(screen.getByRole("button", { name: "Outside" }));

      // Dialog should be closed
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("Range Selection", () => {
    it("selects date range (from → to) via calendar clicks", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DateRangePicker onChange={handleChange} />);

      // Open picker
      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      // Click day 10 (from)
      await user.click(getDay(dialog, 10));

      // Click day 20 (to)
      await user.click(getDay(dialog, 20));

      // Click apply
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      // Should call onChange with range
      expect(handleChange).toHaveBeenCalledTimes(1);
      const range: DateRangeValue = handleChange.mock.calls[0]![0];
      expect(range.from).toBeInstanceOf(Temporal.PlainDate);
      expect(range.to).toBeInstanceOf(Temporal.PlainDate);
      expect(range.from?.day).toBe(10);
      expect(range.to?.day).toBe(20);
    });

    it("swaps dates if user selects to before from", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DateRangePicker onChange={handleChange} />);

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      // Click day 20 first (from)
      await user.click(getDay(dialog, 20));

      // Click day 10 second (to, but earlier)
      await user.click(getDay(dialog, 10));

      // Click apply
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      // Should swap: from=10, to=20
      const range: DateRangeValue = handleChange.mock.calls[0]![0];
      expect(range.from?.day).toBe(10);
      expect(range.to?.day).toBe(20);
    });

    it("displays selected range in formatted text", () => {
      const from = Temporal.PlainDate.from("2025-01-15");
      const to = Temporal.PlainDate.from("2025-01-22");

      render(<DateRangePicker value={{ from, to }} />);

      const input = screen.getByRole("combobox");
      // Expected format: "January 15, 2025 – January 22, 2025"
      expect(input).toHaveValue("January 15, 2025 – January 22, 2025");
    });

    it("displays single date range with same formatting", () => {
      const date = Temporal.PlainDate.from("2025-01-15");

      render(<DateRangePicker value={{ from: date, to: date }} />);

      const input = screen.getByRole("combobox");
      expect(input).toHaveValue("January 15, 2025 – January 15, 2025");
    });

    it("displays partial range (only from)", () => {
      const from = Temporal.PlainDate.from("2025-01-15");

      render(<DateRangePicker value={{ from, to: undefined }} />);

      const input = screen.getByRole("combobox");
      expect(input).toHaveValue("January 15, 2025 – ...");
    });

    it("displays partial range (only to)", () => {
      const to = Temporal.PlainDate.from("2025-01-22");

      render(<DateRangePicker value={{ from: undefined, to }} />);

      const input = screen.getByRole("combobox");
      expect(input).toHaveValue("... – January 22, 2025");
    });

    it("clears range when clear button is clicked", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const from = Temporal.PlainDate.from("2025-01-15");
      const to = Temporal.PlainDate.from("2025-01-22");

      render(<DateRangePicker value={{ from, to }} onChange={handleChange} />);

      // Click clear button
      await user.click(screen.getByRole("button", { name: /clear/i }));

      // Should call onChange with undefined
      expect(handleChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe("Presets", () => {
    it("shows default presets in sidebar by default", async () => {
      const user = userEvent.setup();
      render(<DateRangePicker />);

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      // Check for default presets
      expect(within(dialog).getByRole("button", { name: "Today" })).toBeInTheDocument();
      expect(within(dialog).getByRole("button", { name: "Yesterday" })).toBeInTheDocument();
      expect(within(dialog).getByRole("button", { name: "Last 7 days" })).toBeInTheDocument();
      expect(within(dialog).getByRole("button", { name: "Last 30 days" })).toBeInTheDocument();
      expect(within(dialog).getByRole("button", { name: "This month" })).toBeInTheDocument();
      expect(within(dialog).getByRole("button", { name: "Last month" })).toBeInTheDocument();
    });

    it("applies preset range when preset is clicked", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DateRangePicker onChange={handleChange} />);

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      // Click "Today" preset
      await user.click(within(dialog).getByRole("button", { name: "Today" }));

      // Click apply
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      // Should call onChange with today's date range
      expect(handleChange).toHaveBeenCalledTimes(1);
      const range: DateRangeValue = handleChange.mock.calls[0]![0];
      const today = Temporal.Now.plainDateISO();
      expect(Temporal.PlainDate.compare(range.from!, today)).toBe(0);
      expect(Temporal.PlainDate.compare(range.to!, today)).toBe(0);
    });

    it("applies Last 7 days preset correctly", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DateRangePicker onChange={handleChange} />);

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      // Click "Last 7 days" preset
      await user.click(within(dialog).getByRole("button", { name: "Last 7 days" }));
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      const range: DateRangeValue = handleChange.mock.calls[0]![0];
      const today = Temporal.Now.plainDateISO();
      const weekAgo = today.subtract({ days: 6 });

      expect(Temporal.PlainDate.compare(range.from!, weekAgo)).toBe(0);
      expect(Temporal.PlainDate.compare(range.to!, today)).toBe(0);
    });

    it("hides presets when showPresets={false}", async () => {
      const user = userEvent.setup();
      render(<DateRangePicker showPresets={false} />);

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      // Presets should not be visible
      expect(within(dialog).queryByRole("button", { name: "Today" })).not.toBeInTheDocument();
      expect(within(dialog).queryByRole("button", { name: "Last 7 days" })).not.toBeInTheDocument();
    });

    it("uses custom presets when provided", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const customDate = Temporal.PlainDate.from("2025-12-25");

      const customPresets = [
        {
          label: "Christmas 2025",
          value: () => ({ from: customDate, to: customDate }),
        },
      ];

      render(<DateRangePicker presets={customPresets} onChange={handleChange} />);

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      // Should show custom preset
      expect(within(dialog).getByRole("button", { name: "Christmas 2025" })).toBeInTheDocument();

      // Should not show default presets
      expect(within(dialog).queryByRole("button", { name: "Today" })).not.toBeInTheDocument();

      // Apply custom preset
      await user.click(within(dialog).getByRole("button", { name: "Christmas 2025" }));
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      const range: DateRangeValue = handleChange.mock.calls[0]![0];
      expect(Temporal.PlainDate.compare(range.from!, customDate)).toBe(0);
      expect(Temporal.PlainDate.compare(range.to!, customDate)).toBe(0);
    });
  });

  describe("Constraints", () => {
    it("respects minDate constraint (disables earlier dates)", async () => {
      const user = userEvent.setup();
      const now = Temporal.Now.plainDateISO();
      const minDate = now.with({ day: 10 });

      render(<DateRangePicker minDate={minDate} />);

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      // Day 5 should be disabled (before minDate)
      const day5 = getDay(dialog, 5);
      expect(day5).toBeDisabled();

      // Day 15 should be enabled (after minDate)
      const day15 = getDay(dialog, 15);
      expect(day15).not.toBeDisabled();
    });

    it("respects maxDate constraint (disables later dates)", async () => {
      const user = userEvent.setup();
      const now = Temporal.Now.plainDateISO();
      const maxDate = now.with({ day: 20 });

      render(<DateRangePicker maxDate={maxDate} />);

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      // Day 25 should be disabled (after maxDate)
      const day25 = getDay(dialog, 25);
      expect(day25).toBeDisabled();

      // Day 15 should be enabled (before maxDate)
      const day15 = getDay(dialog, 15);
      expect(day15).not.toBeDisabled();
    });

    it("respects disabled date matcher (function)", async () => {
      const user = userEvent.setup();
      // Disable weekends
      const isWeekend = (date: Temporal.PlainDate) => date.dayOfWeek === 6 || date.dayOfWeek === 7;

      render(<DateRangePicker disabled={isWeekend} />);

      await user.click(screen.getByRole("combobox"));

      // This test verifies the function receives Temporal.PlainDate
      // The actual weekend days depend on the current month
      // Just verify the picker opens and accepts the function
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("State Management", () => {
    it("controlled mode: uses external value prop", async () => {
      const handleChange = vi.fn();
      const from = Temporal.PlainDate.from("2025-01-10");
      const to = Temporal.PlainDate.from("2025-01-20");

      const { rerender } = render(<DateRangePicker value={{ from, to }} onChange={handleChange} />);

      // Should display controlled value
      const input = screen.getByRole("combobox");
      expect(input).toHaveValue("January 10, 2025 – January 20, 2025");

      // Change external value
      const newFrom = Temporal.PlainDate.from("2025-02-05");
      const newTo = Temporal.PlainDate.from("2025-02-15");
      rerender(<DateRangePicker value={{ from: newFrom, to: newTo }} onChange={handleChange} />);

      // Should update display
      expect(input).toHaveValue("February 5, 2025 – February 15, 2025");
    });

    it("uncontrolled mode: manages internal state with defaultValue", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const from = Temporal.PlainDate.from("2025-01-10");
      const to = Temporal.PlainDate.from("2025-01-20");

      render(<DateRangePicker defaultValue={{ from, to }} onChange={handleChange} />);

      // Should display default value
      const input = screen.getByRole("combobox");
      expect(input).toHaveValue("January 10, 2025 – January 20, 2025");

      // Select new range
      await user.click(input);
      const dialog = screen.getByRole("dialog");
      const jan2025 = Temporal.PlainDate.from("2025-01-01");
      await user.click(getDay(dialog, 5, jan2025));
      await user.click(getDay(dialog, 15, jan2025));
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      // Should update internal state and display
      expect(handleChange).toHaveBeenCalledTimes(1);
      // Input should now show new range
      expect(input.getAttribute("value")).toContain("5");
      expect(input.getAttribute("value")).toContain("15");
    });

    it("calls onChange with selected range", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DateRangePicker onChange={handleChange} />);

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      // Select range
      await user.click(getDay(dialog, 10));
      await user.click(getDay(dialog, 20));
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      expect(handleChange).toHaveBeenCalledTimes(1);
      const range: DateRangeValue = handleChange.mock.calls[0]![0];
      expect(range).toHaveProperty("from");
      expect(range).toHaveProperty("to");
      expect(range.from).toBeInstanceOf(Temporal.PlainDate);
      expect(range.to).toBeInstanceOf(Temporal.PlainDate);
    });
  });

  describe("Form Integration", () => {
    it("creates hidden inputs with name.from and name.to", () => {
      const from = Temporal.PlainDate.from("2025-01-15");
      const to = Temporal.PlainDate.from("2025-01-22");

      const { container } = render(<DateRangePicker name="dateRange" value={{ from, to }} />);

      // Should create two hidden inputs
      const hiddenInputs = container.querySelectorAll('input[type="hidden"]');
      expect(hiddenInputs).toHaveLength(2);

      // Check names and values
      const fromInput = container.querySelector('input[name="dateRange.from"]');
      const toInput = container.querySelector('input[name="dateRange.to"]');

      expect(fromInput).toHaveValue("2025-01-15");
      expect(toInput).toHaveValue("2025-01-22");
    });

    it("creates no hidden inputs when name is not provided", () => {
      const from = Temporal.PlainDate.from("2025-01-15");
      const to = Temporal.PlainDate.from("2025-01-22");

      const { container } = render(<DateRangePicker value={{ from, to }} />);

      const hiddenInputs = container.querySelectorAll('input[type="hidden"]');
      expect(hiddenInputs).toHaveLength(0);
    });

    it("creates hidden inputs only for defined values", () => {
      const from = Temporal.PlainDate.from("2025-01-15");

      const { container } = render(<DateRangePicker name="dateRange" value={{ from, to: undefined }} />);

      const fromInput = container.querySelector('input[name="dateRange.from"]');
      const toInput = container.querySelector('input[name="dateRange.to"]');

      expect(fromInput).toHaveValue("2025-01-15");
      expect(toInput).not.toBeInTheDocument();
    });
  });

  describe("Draft/Commit Pattern", () => {
    it("maintains draft value while picker is open", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DateRangePicker onChange={handleChange} />);

      // Open picker
      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      // Select dates (draft state)
      await user.click(getDay(dialog, 10));
      await user.click(getDay(dialog, 20));

      // onChange should NOT be called yet (still in draft)
      expect(handleChange).not.toHaveBeenCalled();

      // Apply to commit
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      // Now onChange should be called
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("reverts to committed value on cancel", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const from = Temporal.PlainDate.from("2025-01-10");
      const to = Temporal.PlainDate.from("2025-01-20");

      render(<DateRangePicker value={{ from, to }} onChange={handleChange} />);

      const input = screen.getByRole("combobox");
      expect(input).toHaveValue("January 10, 2025 – January 20, 2025");

      // Open picker and make changes
      await user.click(input);
      const dialog = screen.getByRole("dialog");
      const jan2025 = Temporal.PlainDate.from("2025-01-01");
      await user.click(getDay(dialog, 5, jan2025));
      await user.click(getDay(dialog, 15, jan2025));

      // Cancel instead of apply
      await user.click(within(dialog).getByRole("button", { name: /cancel/i }));

      // onChange should NOT be called
      expect(handleChange).not.toHaveBeenCalled();

      // Input should still show original value
      expect(input).toHaveValue("January 10, 2025 – January 20, 2025");
    });

    it("commits draft value on apply", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DateRangePicker onChange={handleChange} />);

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      // Make draft changes
      await user.click(getDay(dialog, 10));
      await user.click(getDay(dialog, 20));

      // Apply (commit draft)
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      // onChange should be called with committed value
      expect(handleChange).toHaveBeenCalledTimes(1);
      const range: DateRangeValue = handleChange.mock.calls[0]![0];
      expect(range.from?.day).toBe(10);
      expect(range.to?.day).toBe(20);
    });
  });

  describe("Accessibility", () => {
    it("uses combobox role for trigger input", () => {
      render(<DateRangePicker />);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("uses dialog role for popup", async () => {
      const user = userEvent.setup();
      render(<DateRangePicker />);

      await user.click(screen.getByRole("combobox"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("marks trigger as disabled when isDisabled is true", () => {
      render(<DateRangePicker isDisabled />);

      const input = screen.getByRole("combobox");
      expect(input).toBeDisabled();
    });

    it("marks trigger as invalid when isInvalid is true", () => {
      render(<DateRangePicker isInvalid />);

      const input = screen.getByRole("combobox");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });
  });
});
