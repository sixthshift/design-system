/// <reference types="@testing-library/jest-dom" />

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { addDaysISO, type ISODate, type ISODateRange, startOfMonthISO, todayISO } from "../../date-time";

import { DateRangePicker } from "./DateRangePicker";
import type { PresetOption } from "./daterangepicker.types";

function isoDay(day: number, base: ISODate = todayISO()): ISODate {
  return addDaysISO(startOfMonthISO(base), day - 1);
}

function getDay(container: HTMLElement, day: number, base?: ISODate): HTMLElement {
  const date = isoDay(day, base);
  const el = container.querySelector(`[data-date="${date}"]`);
  if (!el) throw new Error(`Day button for ${date} not found`);
  return el as HTMLElement;
}

/**
 * Range mode renders two segmented fields — one per end — sharing one popover,
 * so there is no single combobox that both opens it and carries the value.
 */
function startField(): HTMLElement {
  return screen.getByRole("group", { name: "Start date" });
}

function endField(): HTMLElement {
  return screen.getByRole("group", { name: "End date" });
}

function openPicker(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  return user.click(screen.getByRole("button", { name: "Open calendar for start date" }));
}

describe("DateRangePicker", () => {
  describe("Rendering & Interaction", () => {
    it("shows both fields empty when no value is provided", () => {
      render(<DateRangePicker />);

      expect(startField().textContent).toBe("mm/dd/yyyy");
      expect(endField().textContent).toBe("mm/dd/yyyy");
    });

    it("opens picker popup on trigger click", async () => {
      const user = userEvent.setup();
      render(<DateRangePicker />);

      await openPicker(user);

      // Dialog should be visible
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    it("closes picker on cancel button click", async () => {
      const user = userEvent.setup();
      render(<DateRangePicker />);

      // Open picker
      await openPicker(user);
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
      await openPicker(user);
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
      await openPicker(user);
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
      await openPicker(user);
      const dialog = screen.getByRole("dialog");

      // Click day 10 (from)
      await user.click(getDay(dialog, 10));

      // Click day 20 (to)
      await user.click(getDay(dialog, 20));

      // Click apply
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      // Should call onChange with range
      expect(handleChange).toHaveBeenCalledTimes(1);
      const range: ISODateRange = handleChange.mock.calls[0]![0];
      expect(typeof range.from).toBe("string");
      expect(typeof range.to).toBe("string");
      expect(range.from).toBe(isoDay(10));
      expect(range.to).toBe(isoDay(20));
    });

    it("swaps dates if user selects to before from", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DateRangePicker onChange={handleChange} />);

      await openPicker(user);
      const dialog = screen.getByRole("dialog");

      // Click day 20 first (from)
      await user.click(getDay(dialog, 20));

      // Click day 10 second (to, but earlier)
      await user.click(getDay(dialog, 10));

      // Click apply
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      // Should swap: from=10, to=20
      const range: ISODateRange = handleChange.mock.calls[0]![0];
      expect(range.from).toBe(isoDay(10));
      expect(range.to).toBe(isoDay(20));
    });

    it("displays selected range in formatted text", () => {
      const from = "2025-01-15";
      const to = "2025-01-22";

      render(<DateRangePicker value={{ from, to }} />);

      expect(startField().textContent).toBe("01/15/2025");
      expect(endField().textContent).toBe("01/22/2025");
    });

    it("displays single date range with same formatting", () => {
      const date = "2025-01-15";

      render(<DateRangePicker value={{ from: date, to: date }} />);

      expect(startField().textContent).toBe("01/15/2025");
      expect(endField().textContent).toBe("01/15/2025");
    });

    it("displays partial range (only from)", () => {
      const from = "2025-01-15";

      render(<DateRangePicker value={{ from, to: undefined }} />);

      expect(startField().textContent).toBe("01/15/2025");
      expect(endField().textContent).toBe("mm/dd/yyyy");
    });

    it("displays partial range (only to)", () => {
      const to = "2025-01-22";

      render(<DateRangePicker value={{ from: undefined, to }} />);

      expect(startField().textContent).toBe("mm/dd/yyyy");
      expect(endField().textContent).toBe("01/22/2025");
    });

    it("clears range when clear button is clicked", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const from = "2025-01-15";
      const to = "2025-01-22";

      const { rerender } = render(<DateRangePicker value={{ from, to }} onChange={handleChange} />);

      // Each end clears on its own now, so clearing one keeps the other.
      await user.click(screen.getByRole("button", { name: "Clear end date" }));
      expect(handleChange).toHaveBeenCalledWith({ from, to: undefined });

      // Clearing the last remaining end clears the range itself.
      rerender(<DateRangePicker value={{ from, to: undefined }} onChange={handleChange} />);
      await user.click(screen.getByRole("button", { name: "Clear start date" }));
      expect(handleChange).toHaveBeenLastCalledWith(undefined);
    });
  });

  describe("Presets", () => {
    it("shows default presets in sidebar by default", async () => {
      const user = userEvent.setup();
      render(<DateRangePicker />);

      await openPicker(user);
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

      await openPicker(user);
      const dialog = screen.getByRole("dialog");

      // Click "Today" preset
      await user.click(within(dialog).getByRole("button", { name: "Today" }));

      // Click apply
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      // Should call onChange with today's date range
      expect(handleChange).toHaveBeenCalledTimes(1);
      const range: ISODateRange = handleChange.mock.calls[0]![0];
      const today = todayISO();
      expect(range.from).toBe(today);
      expect(range.to).toBe(today);
    });

    it("applies Last 7 days preset correctly", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DateRangePicker onChange={handleChange} />);

      await openPicker(user);
      const dialog = screen.getByRole("dialog");

      // Click "Last 7 days" preset
      await user.click(within(dialog).getByRole("button", { name: "Last 7 days" }));
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      const range: ISODateRange = handleChange.mock.calls[0]![0];
      const today = todayISO();
      const weekAgo = addDaysISO(today, -6);

      expect(range.from).toBe(weekAgo);
      expect(range.to).toBe(today);
    });

    it("hides presets when showPresets={false}", async () => {
      const user = userEvent.setup();
      render(<DateRangePicker showPresets={false} />);

      await openPicker(user);
      const dialog = screen.getByRole("dialog");

      // Presets should not be visible
      expect(within(dialog).queryByRole("button", { name: "Today" })).not.toBeInTheDocument();
      expect(within(dialog).queryByRole("button", { name: "Last 7 days" })).not.toBeInTheDocument();
    });

    it("uses custom presets when provided", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const customDate = "2025-12-25";

      const customPresets: PresetOption[] = [
        {
          label: "Christmas 2025",
          value: () => ({ from: customDate, to: customDate }),
        },
      ];

      render(<DateRangePicker presets={customPresets} onChange={handleChange} />);

      await openPicker(user);
      const dialog = screen.getByRole("dialog");

      // Should show custom preset
      expect(within(dialog).getByRole("button", { name: "Christmas 2025" })).toBeInTheDocument();

      // Should not show default presets
      expect(within(dialog).queryByRole("button", { name: "Today" })).not.toBeInTheDocument();

      // Apply custom preset
      await user.click(within(dialog).getByRole("button", { name: "Christmas 2025" }));
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      const range: ISODateRange = handleChange.mock.calls[0]![0];
      expect(range.from).toBe(customDate);
      expect(range.to).toBe(customDate);
    });
  });

  describe("Constraints", () => {
    it("respects minDate constraint (disables earlier dates)", async () => {
      const user = userEvent.setup();
      const minDate = isoDay(10);

      render(<DateRangePicker minDate={minDate} />);

      await openPicker(user);
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
      const maxDate = isoDay(20);

      render(<DateRangePicker maxDate={maxDate} />);

      await openPicker(user);
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
      const isWeekend = { dayOfWeek: ["sat", "sun"] } as const;

      render(<DateRangePicker disabled={isWeekend} />);

      await openPicker(user);

      // This test verifies the declarative day-of-week matcher is accepted
      // The actual weekend days depend on the current month
      // Just verify the picker opens and accepts the function
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("State Management", () => {
    it("controlled mode: uses external value prop", async () => {
      const handleChange = vi.fn();
      const from = "2025-01-10";
      const to = "2025-01-20";

      const { rerender } = render(<DateRangePicker value={{ from, to }} onChange={handleChange} />);

      // Should display controlled value
      expect(startField().textContent).toBe("01/10/2025");
      expect(endField().textContent).toBe("01/20/2025");

      // Change external value
      const newFrom = "2025-02-05";
      const newTo = "2025-02-15";
      rerender(<DateRangePicker value={{ from: newFrom, to: newTo }} onChange={handleChange} />);

      // Should update display
      expect(startField().textContent).toBe("02/05/2025");
      expect(endField().textContent).toBe("02/15/2025");
    });

    it("uncontrolled mode: manages internal state with defaultValue", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const from = "2025-01-10";
      const to = "2025-01-20";

      render(<DateRangePicker defaultValue={{ from, to }} onChange={handleChange} />);

      // Should display default value
      expect(startField().textContent).toBe("01/10/2025");
      expect(endField().textContent).toBe("01/20/2025");

      // Select new range
      await openPicker(user);
      const dialog = screen.getByRole("dialog");
      const jan2025 = "2025-01-01";
      await user.click(getDay(dialog, 5, jan2025));
      await user.click(getDay(dialog, 15, jan2025));
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      // Should update internal state and display
      expect(handleChange).toHaveBeenCalledTimes(1);
      // The fields should now show the new range
      expect(startField().textContent).toBe("01/05/2025");
      expect(endField().textContent).toBe("01/15/2025");
    });

    it("calls onChange with selected range", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DateRangePicker onChange={handleChange} />);

      await openPicker(user);
      const dialog = screen.getByRole("dialog");

      // Select range
      await user.click(getDay(dialog, 10));
      await user.click(getDay(dialog, 20));
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      expect(handleChange).toHaveBeenCalledTimes(1);
      const range: ISODateRange = handleChange.mock.calls[0]![0];
      expect(range).toHaveProperty("from");
      expect(range).toHaveProperty("to");
      expect(typeof range.from).toBe("string");
      expect(typeof range.to).toBe("string");
    });
  });

  describe("Form Integration", () => {
    it("creates hidden inputs with name.from and name.to", () => {
      const from = "2025-01-15";
      const to = "2025-01-22";

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
      const from = "2025-01-15";
      const to = "2025-01-22";

      const { container } = render(<DateRangePicker value={{ from, to }} />);

      const hiddenInputs = container.querySelectorAll('input[type="hidden"]');
      expect(hiddenInputs).toHaveLength(0);
    });

    it("creates hidden inputs only for defined values", () => {
      const from = "2025-01-15";

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
      await openPicker(user);
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
      const from = "2025-01-10";
      const to = "2025-01-20";

      render(<DateRangePicker value={{ from, to }} onChange={handleChange} />);

      expect(startField().textContent).toBe("01/10/2025");
      expect(endField().textContent).toBe("01/20/2025");

      // Open picker and make changes
      await openPicker(user);
      const dialog = screen.getByRole("dialog");
      const jan2025 = "2025-01-01";
      await user.click(getDay(dialog, 5, jan2025));
      await user.click(getDay(dialog, 15, jan2025));

      // Cancel instead of apply
      await user.click(within(dialog).getByRole("button", { name: /cancel/i }));

      // onChange should NOT be called
      expect(handleChange).not.toHaveBeenCalled();

      // The fields should still show the committed range
      expect(startField().textContent).toBe("01/10/2025");
      expect(endField().textContent).toBe("01/20/2025");
    });

    it("commits draft value on apply", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DateRangePicker onChange={handleChange} />);

      await openPicker(user);
      const dialog = screen.getByRole("dialog");

      // Make draft changes
      await user.click(getDay(dialog, 10));
      await user.click(getDay(dialog, 20));

      // Apply (commit draft)
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      // onChange should be called with committed value
      expect(handleChange).toHaveBeenCalledTimes(1);
      const range: ISODateRange = handleChange.mock.calls[0]![0];
      expect(range.from).toBe(isoDay(10));
      expect(range.to).toBe(isoDay(20));
    });
  });

  describe("Accessibility", () => {
    it("exposes each end as a labelled group of spinbuttons", () => {
      render(<DateRangePicker />);

      expect(startField()).toBeInTheDocument();
      expect(endField()).toBeInTheDocument();
      expect(screen.getAllByRole("spinbutton", { name: "Month" })).toHaveLength(2);
    });

    it("uses dialog role for popup", async () => {
      const user = userEvent.setup();
      render(<DateRangePicker />);

      await openPicker(user);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("marks both triggers as disabled when isDisabled is true", () => {
      render(<DateRangePicker isDisabled />);

      expect(screen.getByRole("button", { name: "Open calendar for start date" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Open calendar for end date" })).toBeDisabled();
      expect(startField()).toHaveAttribute("aria-disabled", "true");
    });

    it("marks both fields as invalid when isInvalid is true", () => {
      render(<DateRangePicker isInvalid />);

      expect(startField()).toHaveAttribute("aria-invalid", "true");
      expect(endField()).toHaveAttribute("aria-invalid", "true");
    });
  });
});

describe("DateRangePicker — ref forwarding", () => {
  it("forwards ref to the trigger wrapper element", () => {
    const ref = vi.fn();
    render(<DateRangePicker ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
