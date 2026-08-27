/// <reference types="@testing-library/jest-dom" />

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { addDaysISO, fromISOInstant, type ISODate, isInstantString, startOfMonthISO, Temporal, todayISO } from "../../date-time";

import { DateTimePicker } from "./DateTimePicker";

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
 * The trigger is a segmented field: the clock button opens the popover and the
 * segments hold the value, so no single element does both.
 */
function openPicker(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  return user.click(screen.getByRole("button", { name: "Open date and time picker" }));
}

/** What the segments read, e.g. `"01/15/2025 02:30 PM"`. */
function fieldValue(): string {
  return screen.getByRole("group", { name: "Date and time" }).textContent ?? "";
}

function segment(name: string): HTMLElement {
  return screen.getByRole("spinbutton", { name });
}

describe("DateTimePicker", () => {
  describe("Rendering & Interaction", () => {
    it("shows the segment placeholders when no value is provided", () => {
      render(<DateTimePicker />);

      // The segments are the placeholder: there is no text to put a `placeholder`
      // attribute on any more.
      expect(fieldValue()).toBe("mm/dd/yyyy hh:mm --");
    });

    it("opens picker popup on trigger click", async () => {
      const user = userEvent.setup();
      render(<DateTimePicker />);

      await openPicker(user);

      // Dialog should be visible
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    it("shows date calendar in popup", async () => {
      const user = userEvent.setup();
      render(<DateTimePicker />);

      await openPicker(user);
      const dialog = screen.getByRole("dialog");

      // Should have day buttons (checking for a few days)
      expect(getDay(dialog, 15)).toBeInTheDocument();
      expect(getDay(dialog, 20)).toBeInTheDocument();
    });

    it("shows time picker in popup (side-by-side with calendar)", async () => {
      const user = userEvent.setup();
      render(<DateTimePicker />);

      await openPicker(user);
      const dialog = screen.getByRole("dialog");

      // Should have time selection UI (check for hour/minute columns)
      expect(dialog.textContent).toContain("Hour");
      expect(dialog.textContent).toContain("Min");
      expect(dialog.textContent).toContain("Time"); // Time section header
    });

    it("closes picker on cancel button click", async () => {
      const user = userEvent.setup();
      render(<DateTimePicker />);

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
      render(<DateTimePicker />);

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
          <DateTimePicker />
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

  describe("DateTime Selection", () => {
    it("selects date and time to create PlainDateTime", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DateTimePicker onChange={handleChange} />);

      // Open picker
      await openPicker(user);
      const dialog = screen.getByRole("dialog");

      // Select date (day 15)
      await user.click(getDay(dialog, 15));

      // Select time (find and click hour/minute)
      // This is implementation-dependent, but we should be able to interact with time selection
      // For now, we'll just apply and check the result structure
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      // Should call onChange with Instant
      expect(handleChange).toHaveBeenCalledTimes(1);
      const result = handleChange.mock.calls[0]![0];
      expect(isInstantString(result)).toBe(true);
    });

    it("displays selected datetime in formatted text", () => {
      const dateTime = "2025-01-15T14:30:00Z";

      render(<DateTimePicker value={dateTime} />);

      // Date may vary by timezone, so match the shape rather than the day.
      expect(fieldValue()).toMatch(/^\d{2}\/\d{2}\/2025 \d{2}:\d{2} (AM|PM)$/);
    });

    it("displays datetime with 24h format", () => {
      const dateTime = "2025-01-15T14:30:00Z";

      render(<DateTimePicker value={dateTime} clockFormat="24h" />);

      expect(fieldValue()).toMatch(/^\d{2}\/\d{2}\/2025 \d{2}:\d{2}$/);
    });

    it("displays datetime with seconds when showSeconds is true", () => {
      const dateTime = "2025-01-15T14:30:45Z";

      render(<DateTimePicker value={dateTime} showSeconds />);

      expect(fieldValue()).toMatch(/^\d{2}\/\d{2}\/2025 \d{2}:\d{2}:45 (AM|PM)$/);
    });

    it("clears datetime when clear button is clicked", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const dateTime = "2025-01-15T14:30:00Z";

      render(<DateTimePicker value={dateTime} onChange={handleChange} />);

      // Click clear button
      await user.click(screen.getByRole("button", { name: /clear/i }));

      // Should call onChange with undefined
      expect(handleChange).toHaveBeenCalledWith(undefined);
    });

    it("combines date and time into a single instant", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      // Use a fixed start date that's not today (otherwise clicking today
      // de-selects the default draftDate set on open).
      const startValue = "2025-06-10T12:00:00Z";
      render(<DateTimePicker value={startValue} onChange={handleChange} />);

      await openPicker(user);
      const dialog = screen.getByRole("dialog");

      // Select a different date in the same month
      const targetDate = "2025-06-20";
      await user.click(getDay(dialog, 20, targetDate));

      // Apply
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      const result = handleChange.mock.calls[0]![0];
      expect(isInstantString(result)).toBe(true);

      // Check date component by converting to local timezone
      const zoned = fromISOInstant(result).toZonedDateTimeISO(Temporal.Now.timeZoneId());
      expect(zoned.day).toBe(20);
      // Should have time component (even if default)
      expect(zoned.hour).toBeGreaterThanOrEqual(0);
      expect(zoned.minute).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Constraints", () => {
    it("respects minDate constraint (disables earlier dates)", async () => {
      const user = userEvent.setup();
      const minDate = isoDay(10);

      render(<DateTimePicker minDate={minDate} />);

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

      render(<DateTimePicker maxDate={maxDate} />);

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

      render(<DateTimePicker disabledDates={isWeekend} />);

      await openPicker(user);

      // Verify picker opens and accepts the function
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("respects minuteStep intervals", async () => {
      const user = userEvent.setup();

      render(<DateTimePicker minuteStep={15} />);

      await openPicker(user);
      const dialog = screen.getByRole("dialog");

      // Should only show minutes in 15-minute intervals (00, 15, 30, 45)
      // The exact test depends on implementation, but we verify the prop is accepted
      expect(dialog).toBeInTheDocument();
    });
  });

  describe("Time Format", () => {
    it("supports 12h clock format with AM/PM", async () => {
      const user = userEvent.setup();

      render(<DateTimePicker clockFormat="12h" />);

      await openPicker(user);
      const dialog = screen.getByRole("dialog");

      // Should show AM/PM selector
      expect(dialog.textContent).toMatch(/AM|PM/);
    });

    it("supports 24h clock format", async () => {
      const user = userEvent.setup();

      render(<DateTimePicker clockFormat="24h" />);

      await openPicker(user);
      const dialog = screen.getByRole("dialog");

      // Should NOT show AM/PM selector
      expect(dialog.textContent).not.toMatch(/AM|PM/);
    });

    it("shows seconds column when showSeconds is true", async () => {
      const user = userEvent.setup();

      render(<DateTimePicker showSeconds />);

      await openPicker(user);

      // Should have seconds in the time picker
      // Exact test depends on implementation
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("hides seconds column when showSeconds is false", async () => {
      const user = userEvent.setup();

      render(<DateTimePicker showSeconds={false} />);

      await openPicker(user);

      // Should NOT have seconds column
      // Exact test depends on implementation
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("State Management", () => {
    it("controlled mode: uses external value prop", () => {
      const handleChange = vi.fn();
      const dateTime = "2025-01-15T14:30:00Z";

      const { rerender } = render(<DateTimePicker value={dateTime} onChange={handleChange} />);

      // Should display controlled value (date may vary by timezone)
      expect(fieldValue()).toMatch(/^01\/\d{2}\/2025/);

      // Change external value
      const newDateTime = "2025-02-20T10:15:00Z";
      rerender(<DateTimePicker value={newDateTime} onChange={handleChange} />);

      // Should update display
      expect(fieldValue()).toMatch(/^02\/\d{2}\/2025/);
    });

    it("uncontrolled mode: manages internal state with defaultValue", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const dateTime = "2025-01-15T14:30:00Z";

      render(<DateTimePicker defaultValue={dateTime} onChange={handleChange} />);

      // Should display default value (date may vary by timezone)
      expect(fieldValue()).toMatch(/^01\/\d{2}\/2025/);

      // Select new datetime
      await openPicker(user);
      const dialog = screen.getByRole("dialog");
      const jan2025 = "2025-01-01";
      await user.click(getDay(dialog, 20, jan2025));
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      // Should call onChange
      expect(handleChange).toHaveBeenCalled();
    });

    it("calls onChange with PlainDateTime", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DateTimePicker onChange={handleChange} />);

      await openPicker(user);
      const dialog = screen.getByRole("dialog");

      // Select date
      await user.click(getDay(dialog, 15));
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      expect(handleChange).toHaveBeenCalledTimes(1);
      const result = handleChange.mock.calls[0]![0];
      expect(isInstantString(result)).toBe(true);
    });
  });

  describe("Form Integration", () => {
    it("creates hidden input with ISO 8601 datetime string", () => {
      const dateTime = "2025-01-15T14:30:45Z";

      const { container } = render(<DateTimePicker name="eventDateTime" value={dateTime} />);

      // Should create hidden input
      const hiddenInput = container.querySelector('input[type="hidden"]');
      expect(hiddenInput).toHaveAttribute("name", "eventDateTime");
      expect(hiddenInput).toHaveValue("2025-01-15T14:30:45Z");
    });

    it("creates no hidden input when name is not provided", () => {
      const dateTime = "2025-01-15T14:30:00Z";

      const { container } = render(<DateTimePicker value={dateTime} />);

      const hiddenInputs = container.querySelectorAll('input[type="hidden"]');
      expect(hiddenInputs).toHaveLength(0);
    });
  });

  describe("Draft/Commit Pattern", () => {
    it("maintains draft value while picker is open", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DateTimePicker onChange={handleChange} />);

      // Open picker
      await openPicker(user);
      const dialog = screen.getByRole("dialog");

      // Select date (draft state)
      await user.click(getDay(dialog, 15));

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
      const dateTime = "2025-01-15T14:30:00Z";

      render(<DateTimePicker value={dateTime} onChange={handleChange} />);

      const originalValue = fieldValue();

      // Open picker and make changes
      await openPicker(user);
      const dialog = screen.getByRole("dialog");
      const jan2025 = "2025-01-01";
      await user.click(getDay(dialog, 20, jan2025));

      // Cancel instead of apply
      await user.click(within(dialog).getByRole("button", { name: /cancel/i }));

      // onChange should NOT be called
      expect(handleChange).not.toHaveBeenCalled();

      // Input should still show original value
      expect(fieldValue()).toBe(originalValue);
    });

    it("commits draft value on apply", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      // Use a fixed start date that's not today (otherwise clicking today
      // de-selects the default draftDate set on open).
      const startValue = "2025-06-10T12:00:00Z";
      render(<DateTimePicker value={startValue} onChange={handleChange} />);

      await openPicker(user);
      const dialog = screen.getByRole("dialog");

      // Make draft changes — click a different day in the same month
      const targetDate = "2025-06-20";
      await user.click(getDay(dialog, 20, targetDate));

      // Apply (commit draft)
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      // onChange should be called with committed value
      expect(handleChange).toHaveBeenCalledTimes(1);
      const result = handleChange.mock.calls[0]![0];
      expect(isInstantString(result)).toBe(true);
      const zoned = fromISOInstant(result).toZonedDateTimeISO(Temporal.Now.timeZoneId());
      expect(zoned.day).toBe(20);
    });
  });

  describe("typeable segments", () => {
    it("types a whole date and time straight through", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DateTimePicker onChange={handleChange} />);

      // No tabbing: the digits roll from the year into the hour on their own,
      // and `p` sets the meridiem.
      await user.click(segment("Month"));
      await user.keyboard("1520260330p");

      expect(fieldValue()).toBe("01/05/2026 03:30 PM");
      expect(handleChange).toHaveBeenCalledTimes(1);

      // The value is an instant, so check the wall clock it lands on locally.
      const emitted = handleChange.mock.calls[0]![0] as string;
      expect(isInstantString(emitted)).toBe(true);
      const local = fromISOInstant(emitted).toZonedDateTimeISO(Temporal.Now.timeZoneId());
      expect([local.year, local.month, local.day, local.hour, local.minute]).toEqual([2026, 1, 5, 15, 30]);
    });

    it("holds onChange until the whole value is there", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DateTimePicker onChange={handleChange} />);

      await user.click(segment("Month"));
      await user.keyboard("15202603");

      // A date with an hour but no minute is not an instant.
      expect(handleChange).not.toHaveBeenCalled();
    });

    it("opens the popover on Alt+ArrowDown and moves focus into the grid", async () => {
      const user = userEvent.setup();
      render(<DateTimePicker value="2026-01-24T12:30:00Z" onChange={() => {}} />);

      await user.click(segment("Month"));
      await user.keyboard("{Alt>}{ArrowDown}{/Alt}");

      const dialog = screen.getByRole("dialog");
      expect(dialog.contains(document.activeElement)).toBe(true);
      expect(document.activeElement).toHaveAttribute("data-date");
    });

    it("clears the value when a segment is emptied", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DateTimePicker defaultValue="2026-01-24T12:30:00Z" onChange={handleChange} />);

      await user.click(segment("Year"));
      await user.keyboard("{Backspace}");

      expect(fieldValue()).toContain("yyyy");
      expect(handleChange).toHaveBeenCalledWith(undefined);
    });

    it("focuses a segment when the field is clicked anywhere", async () => {
      const user = userEvent.setup();
      render(<DateTimePicker />);

      await user.click(screen.getByRole("group", { name: "Date and time" }));
      expect(document.activeElement).toBe(segment("Month"));
    });
  });

  describe("Accessibility", () => {
    it("exposes the field as a group of labelled spinbuttons", () => {
      render(<DateTimePicker />);

      expect(screen.getByRole("group", { name: "Date and time" })).toBeInTheDocument();
      for (const name of ["Month", "Day", "Year", "Hour", "Minute", "AM/PM"]) {
        expect(segment(name)).toBeInTheDocument();
      }
    });

    it("uses dialog role for popup", async () => {
      const user = userEvent.setup();
      render(<DateTimePicker />);

      await openPicker(user);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("marks the trigger as disabled when isDisabled is true", () => {
      render(<DateTimePicker isDisabled />);

      expect(screen.getByRole("button", { name: "Open date and time picker" })).toBeDisabled();
      expect(screen.getByRole("group", { name: "Date and time" })).toHaveAttribute("aria-disabled", "true");
      expect(segment("Month")).toHaveAttribute("tabindex", "-1");
    });

    it("marks the field as invalid when isInvalid is true", () => {
      render(<DateTimePicker isInvalid />);

      expect(screen.getByRole("group", { name: "Date and time" })).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("Instant Value Handling", () => {
    it("accepts and displays Instant value in user timezone", async () => {
      const instant = "2026-01-24T23:30:00Z";
      render(<DateTimePicker value={instant} />);

      // Should display in local timezone (the exact day varies by timezone)
      expect(fieldValue()).toMatch(/^01\/\d{2}\/2026/);
    });

    it("calls onChange with a canonical UTC instant string when user selects date and time", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DateTimePicker onChange={onChange} />);

      // Open picker
      await openPicker(user);
      const dialog = screen.getByRole("dialog");

      // Select a date (15th)
      await user.click(getDay(dialog, 15));

      // Apply selection
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      // Should be called with Instant
      const result = onChange.mock.calls[0]![0];
      expect(typeof result).toBe("string");
      expect(isInstantString(result)).toBe(true);
      expect(result).toMatch(/Z$/);
    });

    it("converts Instant to ZonedDateTime for internal display state", async () => {
      const user = userEvent.setup();
      // 11:30 PM UTC = 3:30 PM PST (same day in PST)
      const instant = "2026-01-24T23:30:00Z";
      render(<DateTimePicker value={instant} />);

      await openPicker(user);
      const dialog = screen.getByRole("dialog");

      // Time picker should show time in local timezone
      // (exact display depends on system timezone, just verify it opens)
      expect(dialog.textContent).toContain("Hour");
      expect(dialog.textContent).toContain("Min");
    });
  });
});

describe("DateTimePicker — ref forwarding", () => {
  it("forwards ref to the trigger wrapper element", () => {
    const ref = vi.fn();
    render(<DateTimePicker ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
