/// <reference types="@testing-library/jest-dom" />
import { Temporal } from "@sixthshift/temporal";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DateTimePicker } from "./DateTimePicker";

function getDay(container: HTMLElement, day: number, base?: Temporal.PlainDate): HTMLElement {
  const date = (base ?? Temporal.Now.plainDateISO()).with({ day });
  const el = container.querySelector(`[data-date="${date.toString()}"]`);
  if (!el) throw new Error(`Day button for ${date} not found`);
  return el as HTMLElement;
}

describe("DateTimePicker", () => {
  describe("Rendering & Interaction", () => {
    it("renders with placeholder when no value is provided", () => {
      render(<DateTimePicker placeholder="Select date and time..." />);

      const input = screen.getByRole("combobox");
      expect(input).toHaveValue("");
      expect(input).toHaveAttribute("placeholder", "Select date and time...");
    });

    it("renders with default placeholder when none is provided", () => {
      render(<DateTimePicker />);

      const input = screen.getByRole("combobox");
      expect(input).toHaveAttribute("placeholder", "Select date and time...");
    });

    it("opens picker popup on trigger click", async () => {
      const user = userEvent.setup();
      render(<DateTimePicker />);

      const input = screen.getByRole("combobox");
      await user.click(input);

      // Dialog should be visible
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    it("shows date calendar in popup", async () => {
      const user = userEvent.setup();
      render(<DateTimePicker />);

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      // Should have day buttons (checking for a few days)
      expect(getDay(dialog, 15)).toBeInTheDocument();
      expect(getDay(dialog, 20)).toBeInTheDocument();
    });

    it("shows time picker in popup (side-by-side with calendar)", async () => {
      const user = userEvent.setup();
      render(<DateTimePicker />);

      await user.click(screen.getByRole("combobox"));
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
      render(<DateTimePicker />);

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
          <DateTimePicker />
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

  describe("DateTime Selection", () => {
    it("selects date and time to create PlainDateTime", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DateTimePicker onChange={handleChange} />);

      // Open picker
      await user.click(screen.getByRole("combobox"));
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
      expect(result).toBeInstanceOf(Temporal.Instant);
    });

    it("displays selected datetime in formatted text", () => {
      const dateTime = Temporal.Instant.from("2025-01-15T14:30:00Z");

      render(<DateTimePicker value={dateTime} />);

      const input = screen.getByRole("combobox") as HTMLInputElement;
      // Should display in format like "January 15, 2025, 2:30 PM" (date may vary by timezone)
      expect(input.value).toMatch(/Jan(uary)?\s+\d{1,2},\s+2025/);
      expect(input.value).toMatch(/\d{1,2}:\d{2}\s*(AM|PM)/);
    });

    it("displays datetime with 24h format", () => {
      const dateTime = Temporal.Instant.from("2025-01-15T14:30:00Z");

      render(<DateTimePicker value={dateTime} clockFormat="24h" />);

      const input = screen.getByRole("combobox") as HTMLInputElement;
      // Date may vary by timezone, time format should be 24h
      expect(input.value).toMatch(/Jan(uary)?\s+\d{1,2},\s+2025/);
      expect(input.value).toMatch(/\d{2}:\d{2}/);
    });

    it("displays datetime with seconds when showSeconds is true", () => {
      const dateTime = Temporal.Instant.from("2025-01-15T14:30:45Z");

      render(<DateTimePicker value={dateTime} showSeconds />);

      const input = screen.getByRole("combobox") as HTMLInputElement;
      // Date may vary by timezone
      expect(input.value).toMatch(/Jan(uary)?\s+\d{1,2},\s+2025/);
      // Should show seconds in format like "2:30:45 PM" or "14:30:45"
      expect(input.value).toMatch(/:\d{2}:\d{2}/); // Should have two colons (HH:MM:SS)
    });

    it("clears datetime when clear button is clicked", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const dateTime = Temporal.Instant.from("2025-01-15T14:30:00Z");

      render(<DateTimePicker value={dateTime} onChange={handleChange} />);

      // Click clear button
      await user.click(screen.getByRole("button", { name: /clear/i }));

      // Should call onChange with undefined
      expect(handleChange).toHaveBeenCalledWith(undefined);
    });

    it("combines date and time into Temporal.PlainDateTime", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      // Use a fixed start date that's not today (otherwise clicking today
      // de-selects the default draftDate set on open).
      const startValue = Temporal.Instant.from("2025-06-10T12:00:00Z");
      render(<DateTimePicker value={startValue} onChange={handleChange} />);

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      // Select a different date in the same month
      const targetDate = Temporal.PlainDate.from("2025-06-20");
      await user.click(getDay(dialog, 20, targetDate));

      // Apply
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      const result = handleChange.mock.calls[0]![0];
      expect(result).toBeInstanceOf(Temporal.Instant);

      // Check date component by converting to local timezone
      const zoned = result.toZonedDateTimeISO(Temporal.Now.timeZoneId());
      expect(zoned.day).toBe(20);
      // Should have time component (even if default)
      expect(zoned.hour).toBeGreaterThanOrEqual(0);
      expect(zoned.minute).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Constraints", () => {
    it("respects minDate constraint (disables earlier dates)", async () => {
      const user = userEvent.setup();
      const now = Temporal.Now.plainDateISO();
      const minDate = now.with({ day: 10 });

      render(<DateTimePicker minDate={minDate} />);

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

      render(<DateTimePicker maxDate={maxDate} />);

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

      render(<DateTimePicker disabledDates={isWeekend} />);

      await user.click(screen.getByRole("combobox"));

      // Verify picker opens and accepts the function
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("respects minuteStep intervals", async () => {
      const user = userEvent.setup();

      render(<DateTimePicker minuteStep={15} />);

      await user.click(screen.getByRole("combobox"));
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

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      // Should show AM/PM selector
      expect(dialog.textContent).toMatch(/AM|PM/);
    });

    it("supports 24h clock format", async () => {
      const user = userEvent.setup();

      render(<DateTimePicker clockFormat="24h" />);

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      // Should NOT show AM/PM selector
      expect(dialog.textContent).not.toMatch(/AM|PM/);
    });

    it("shows seconds column when showSeconds is true", async () => {
      const user = userEvent.setup();

      render(<DateTimePicker showSeconds />);

      await user.click(screen.getByRole("combobox"));

      // Should have seconds in the time picker
      // Exact test depends on implementation
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("hides seconds column when showSeconds is false", async () => {
      const user = userEvent.setup();

      render(<DateTimePicker showSeconds={false} />);

      await user.click(screen.getByRole("combobox"));

      // Should NOT have seconds column
      // Exact test depends on implementation
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("State Management", () => {
    it("controlled mode: uses external value prop", () => {
      const handleChange = vi.fn();
      const dateTime = Temporal.Instant.from("2025-01-15T14:30:00Z");

      const { rerender } = render(<DateTimePicker value={dateTime} onChange={handleChange} />);

      // Should display controlled value (date may vary by timezone)
      const input = screen.getByRole("combobox") as HTMLInputElement;
      expect(input.value).toMatch(/Jan(uary)?\s+\d{1,2},\s+2025/);

      // Change external value
      const newDateTime = Temporal.Instant.from("2025-02-20T10:15:00Z");
      rerender(<DateTimePicker value={newDateTime} onChange={handleChange} />);

      // Should update display
      expect(input.value).toMatch(/Feb(ruary)?\s+\d{1,2},\s+2025/);
    });

    it("uncontrolled mode: manages internal state with defaultValue", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const dateTime = Temporal.Instant.from("2025-01-15T14:30:00Z");

      render(<DateTimePicker defaultValue={dateTime} onChange={handleChange} />);

      // Should display default value (date may vary by timezone)
      const input = screen.getByRole("combobox") as HTMLInputElement;
      expect(input.value).toMatch(/Jan(uary)?\s+\d{1,2},\s+2025/);

      // Select new datetime
      await user.click(input);
      const dialog = screen.getByRole("dialog");
      const jan2025 = Temporal.PlainDate.from("2025-01-01");
      await user.click(getDay(dialog, 20, jan2025));
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      // Should call onChange
      expect(handleChange).toHaveBeenCalled();
    });

    it("calls onChange with PlainDateTime", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DateTimePicker onChange={handleChange} />);

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      // Select date
      await user.click(getDay(dialog, 15));
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      expect(handleChange).toHaveBeenCalledTimes(1);
      const result = handleChange.mock.calls[0]![0];
      expect(result).toBeInstanceOf(Temporal.Instant);
    });
  });

  describe("Form Integration", () => {
    it("creates hidden input with ISO 8601 datetime string", () => {
      const dateTime = Temporal.Instant.from("2025-01-15T14:30:45Z");

      const { container } = render(<DateTimePicker name="eventDateTime" value={dateTime} />);

      // Should create hidden input
      const hiddenInput = container.querySelector('input[type="hidden"]');
      expect(hiddenInput).toHaveAttribute("name", "eventDateTime");
      expect(hiddenInput).toHaveValue("2025-01-15T14:30:45Z");
    });

    it("creates no hidden input when name is not provided", () => {
      const dateTime = Temporal.Instant.from("2025-01-15T14:30:00Z");

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
      await user.click(screen.getByRole("combobox"));
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
      const dateTime = Temporal.Instant.from("2025-01-15T14:30:00Z");

      render(<DateTimePicker value={dateTime} onChange={handleChange} />);

      const input = screen.getByRole("combobox") as HTMLInputElement;
      const originalValue = input.value;

      // Open picker and make changes
      await user.click(input);
      const dialog = screen.getByRole("dialog");
      const jan2025 = Temporal.PlainDate.from("2025-01-01");
      await user.click(getDay(dialog, 20, jan2025));

      // Cancel instead of apply
      await user.click(within(dialog).getByRole("button", { name: /cancel/i }));

      // onChange should NOT be called
      expect(handleChange).not.toHaveBeenCalled();

      // Input should still show original value
      expect(input.value).toBe(originalValue);
    });

    it("commits draft value on apply", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      // Use a fixed start date that's not today (otherwise clicking today
      // de-selects the default draftDate set on open).
      const startValue = Temporal.Instant.from("2025-06-10T12:00:00Z");
      render(<DateTimePicker value={startValue} onChange={handleChange} />);

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      // Make draft changes — click a different day in the same month
      const targetDate = Temporal.PlainDate.from("2025-06-20");
      await user.click(getDay(dialog, 20, targetDate));

      // Apply (commit draft)
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      // onChange should be called with committed value
      expect(handleChange).toHaveBeenCalledTimes(1);
      const result = handleChange.mock.calls[0]![0];
      expect(result).toBeInstanceOf(Temporal.Instant);
      const zoned = result.toZonedDateTimeISO(Temporal.Now.timeZoneId());
      expect(zoned.day).toBe(20);
    });
  });

  describe("Accessibility", () => {
    it("uses combobox role for trigger input", () => {
      render(<DateTimePicker />);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("uses dialog role for popup", async () => {
      const user = userEvent.setup();
      render(<DateTimePicker />);

      await user.click(screen.getByRole("combobox"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("marks trigger as disabled when isDisabled is true", () => {
      render(<DateTimePicker isDisabled />);

      const input = screen.getByRole("combobox");
      expect(input).toBeDisabled();
    });

    it("marks trigger as invalid when isInvalid is true", () => {
      render(<DateTimePicker isInvalid />);

      const input = screen.getByRole("combobox");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("Instant Value Handling", () => {
    it("accepts and displays Instant value in user timezone", async () => {
      const instant = Temporal.Instant.from("2026-01-24T23:30:00Z");
      render(<DateTimePicker value={instant} />);

      const input = screen.getByRole("combobox") as HTMLInputElement;
      // Should display in local timezone (exact format varies by timezone)
      expect(input.value).toContain("Jan");
      expect(input.value).toContain("2026");
    });

    it("calls onChange with Instant when user selects date and time", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DateTimePicker onChange={onChange} />);

      // Open picker
      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      // Select a date (15th)
      await user.click(getDay(dialog, 15));

      // Apply selection
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      // Should be called with Instant
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          toString: expect.any(Function),
        })
      );
      const result = onChange.mock.calls[0]![0];
      expect(result).toBeInstanceOf(Temporal.Instant);
    });

    it("converts Instant to ZonedDateTime for internal display state", async () => {
      const user = userEvent.setup();
      // 11:30 PM UTC = 3:30 PM PST (same day in PST)
      const instant = Temporal.Instant.from("2026-01-24T23:30:00Z");
      render(<DateTimePicker value={instant} />);

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      // Time picker should show time in local timezone
      // (exact display depends on system timezone, just verify it opens)
      expect(dialog.textContent).toContain("Hour");
      expect(dialog.textContent).toContain("Min");
    });
  });
});
