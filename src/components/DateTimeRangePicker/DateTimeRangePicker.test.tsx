/// <reference types="@testing-library/jest-dom" />

import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as TemporalModule from "../../date-time";
import { Temporal } from "../../date-time";
import { DateTimeRangePicker } from "./DateTimeRangePicker";
import type { DateTimeRangeValue } from "./datetimerangepicker.types";

function getDay(container: HTMLElement, day: number, base?: Temporal.PlainDate): HTMLElement {
  const date = (base ?? Temporal.PlainDate.from("2025-01-15")).with({ day });
  const el = container.querySelector(`[data-date="${date.toString()}"]`);
  if (!el) throw new Error(`Day button for ${date} not found`);
  return el as HTMLElement;
}

describe("DateTimeRangePicker", () => {
  // Mock today/now to be fixed dates for test stability
  const MOCK_TODAY = Temporal.PlainDate.from("2025-01-15");
  const MOCK_NOW = Temporal.Instant.from("2025-01-15T12:00:00Z");

  beforeEach(() => {
    vi.spyOn(TemporalModule, "today").mockReturnValue(MOCK_TODAY);
    vi.spyOn(TemporalModule, "now").mockReturnValue(MOCK_NOW);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  // =============================================================================
  // Rendering & Basic Interaction (8 tests)
  // =============================================================================

  it("renders with placeholder", () => {
    render(<DateTimeRangePicker placeholder="Select datetime range..." />);
    const input = screen.getByPlaceholderText("Select datetime range...");
    expect(input).toBeInTheDocument();
  });

  it("opens popup on click", async () => {
    const user = userEvent.setup();
    render(<DateTimeRangePicker placeholder="Select range" />);

    const input = screen.getByPlaceholderText("Select range");
    await user.click(input);

    // Should open a dialog/popup
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
  });

  it("shows calendar in popup", async () => {
    const user = userEvent.setup();
    render(<DateTimeRangePicker placeholder="Select range" />);

    const input = screen.getByPlaceholderText("Select range");
    await user.click(input);

    const dialog = screen.getByRole("dialog");
    // Should have calendar with month/year navigation
    expect(within(dialog).getByRole("grid")).toBeInTheDocument();
  });

  it("shows two time pickers in popup (start and end)", async () => {
    const user = userEvent.setup();
    render(<DateTimeRangePicker placeholder="Select range" />);

    const input = screen.getByPlaceholderText("Select range");
    await user.click(input);

    const dialog = screen.getByRole("dialog");
    // Should have start and end time sections
    expect(dialog.textContent).toContain("Start Time");
    expect(dialog.textContent).toContain("End Time");
    // Should have hour/minute columns for both
    const hourLabels = within(dialog).getAllByText("Hour");
    expect(hourLabels).toHaveLength(2); // One for start, one for end
  });

  it("closes on escape key", async () => {
    const user = userEvent.setup();
    render(<DateTimeRangePicker placeholder="Select range" />);

    const input = screen.getByPlaceholderText("Select range");
    await user.click(input);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <DateTimeRangePicker placeholder="Select range" />
      </div>
    );

    const input = screen.getByPlaceholderText("Select range");
    await user.click(input);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByTestId("outside"));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("displays selected datetime range in input", () => {
    const from = Temporal.Instant.from("2025-01-15T14:30:00Z");
    const to = Temporal.Instant.from("2025-01-20T16:45:00Z");

    render(<DateTimeRangePicker defaultValue={{ from, to }} />);

    const input = screen.getByRole("combobox") as HTMLInputElement;
    // Should show formatted range (dates/times may vary by timezone)
    expect(input.value).toMatch(/Jan(uary)?\s+\d{1,2},\s+2025/);
    expect(input.value).toMatch(/\d{1,2}:\d{2}\s*(AM|PM)/);
    expect(input.value).toContain("–");
  });

  it("clears value when clear button clicked", async () => {
    const user = userEvent.setup();
    const from = Temporal.Instant.from("2025-01-15T14:30:00Z");
    const to = Temporal.Instant.from("2025-01-20T16:45:00Z");
    const onChange = vi.fn();

    render(<DateTimeRangePicker defaultValue={{ from, to }} onChange={onChange} />);

    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.value).not.toBe("");

    // Find and click clear button (X icon)
    const clearButton = screen.getByRole("button", { name: /clear/i });
    await user.click(clearButton);

    expect(input.value).toBe("");
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  // =============================================================================
  // Range Selection (6 tests)
  // =============================================================================

  it("selects start and end dates", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<DateTimeRangePicker onChange={onChange} placeholder="Select range" />);

    const input = screen.getByPlaceholderText("Select range");
    await user.click(input);

    const dialog = screen.getByRole("dialog");
    const grid = within(dialog).getByRole("grid");

    // Select start date (15th)
    const startDate = getDay(grid, 15);
    await user.click(startDate);

    // Select end date (20th)
    const endDate = getDay(grid, 20);
    await user.click(endDate);

    // Give the calendar time to update
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Click Apply to commit the selection
    const applyButton = within(dialog).getByRole("button", { name: /apply/i });
    await user.click(applyButton);

    // Should have both dates selected (as Instant values)
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]?.[0] as DateTimeRangeValue;
    expect(lastCall).toBeDefined();

    expect(lastCall.from).toBeInstanceOf(Temporal.Instant);
    expect(lastCall.to).toBeDefined();
    expect(lastCall.to).toBeInstanceOf(Temporal.Instant);

    // Convert to zoned datetime to check the day
    const tz = Temporal.Now.timeZoneId();
    const fromDate = lastCall.from!.toZonedDateTimeISO(tz).toPlainDate();
    const toDate = lastCall.to!.toZonedDateTimeISO(tz).toPlainDate();
    expect(fromDate.day).toBe(15);
    expect(toDate.day).toBe(20);
  });

  it("selects start and end times", async () => {
    const user = userEvent.setup();
    const from = Temporal.Instant.from("2025-01-15T00:00:00Z");
    const to = Temporal.Instant.from("2025-01-20T00:00:00Z");
    const onChange = vi.fn();

    render(<DateTimeRangePicker defaultValue={{ from, to }} onChange={onChange} placeholder="Select range" />);

    const input = screen.getByPlaceholderText("Select range");
    await user.click(input);

    const dialog = screen.getByRole("dialog");

    // Get all listboxes (time columns)
    const listboxes = within(dialog).getAllByRole("listbox");

    // Select start time: 2 PM (14:00)
    const startHourBox = listboxes[0]!; // First listbox is start hour
    const startHours = within(startHourBox).getAllByRole("option");
    const startHour2PM = startHours.find((btn) => btn.textContent === "02");
    expect(startHour2PM).toBeTruthy();
    await user.click(startHour2PM!);

    // Select start minute: 30
    const startMinuteBox = listboxes[1]!; // Second listbox is start minute
    const startMinutes = within(startMinuteBox).getAllByRole("option");
    const startMin30 = startMinutes.find((btn) => btn.textContent === "30");
    expect(startMin30).toBeTruthy();
    await user.click(startMin30!);

    // Select start period: PM
    const startPM = within(dialog).getAllByText("PM")[0]!;
    await user.click(startPM);

    // Select end time: 4 PM (16:00)
    const endHourBox = listboxes[2]!; // Third listbox is end hour
    const endHours = within(endHourBox).getAllByRole("option");
    const endHour4PM = endHours.find((btn) => btn.textContent === "04");
    expect(endHour4PM).toBeTruthy();
    await user.click(endHour4PM!);

    // Select end minute: 45
    const endMinuteBox = listboxes[3]!; // Fourth listbox is end minute
    const endMinutes = within(endMinuteBox).getAllByRole("option");
    const endMin45 = endMinutes.find((btn) => btn.textContent === "45");
    expect(endMin45).toBeTruthy();
    await user.click(endMin45!);

    // Select end period: PM
    const endPM = within(dialog).getAllByText("PM")[1]!;
    await user.click(endPM);

    // Click Apply to commit changes
    const applyButton = within(dialog).getByRole("button", { name: /apply/i });
    await user.click(applyButton);

    // Verify times were set (convert Instant to PlainDateTime to check time)
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]?.[0] as DateTimeRangeValue;
    expect(lastCall).toBeDefined();
    expect(lastCall.from).toBeInstanceOf(Temporal.Instant);
    expect(lastCall.to).toBeInstanceOf(Temporal.Instant);

    const tz = Temporal.Now.timeZoneId();
    const fromDateTime = lastCall.from!.toZonedDateTimeISO(tz).toPlainDateTime();
    const toDateTime = lastCall.to!.toZonedDateTimeISO(tz).toPlainDateTime();
    expect(fromDateTime.hour).toBe(14);
    expect(fromDateTime.minute).toBe(30);
    expect(toDateTime.hour).toBe(16);
    expect(toDateTime.minute).toBe(45);
  });

  it("updates display with complete datetime range", async () => {
    const user = userEvent.setup();
    render(<DateTimeRangePicker placeholder="Select range" />);

    const input = screen.getByPlaceholderText("Select range") as HTMLInputElement;
    await user.click(input);

    const dialog = screen.getByRole("dialog");
    const grid = within(dialog).getByRole("grid");

    // Select date range
    const startDate = getDay(grid, 15);
    await user.click(startDate);
    const endDate = getDay(grid, 20);
    await user.click(endDate);

    // Click Apply to commit the range
    const applyButton = within(dialog).getByRole("button", { name: /apply/i });
    await user.click(applyButton);

    // Input should display the range (dates may vary by timezone)
    expect(input.value).toMatch(/\w+\s+\d{1,2},\s+2025/);
    expect(input.value).toContain("–");
  });

  it("handles partial range (only start datetime selected)", async () => {
    const user = userEvent.setup();
    render(<DateTimeRangePicker placeholder="Select range" />);

    const input = screen.getByPlaceholderText("Select range") as HTMLInputElement;
    await user.click(input);

    const dialog = screen.getByRole("dialog");
    const grid = within(dialog).getByRole("grid");

    // Select only start date
    const startDate = getDay(grid, 15);
    await user.click(startDate);

    // Click Apply to commit partial range
    const applyButton = within(dialog).getByRole("button", { name: /apply/i });
    await user.click(applyButton);

    // Should show partial range with "..." (date may vary by timezone)
    expect(input.value).toMatch(/\w+\s+\d{1,2},\s+2025/);
    expect(input.value).toContain("...");
  });

  it("allows clearing and re-selecting range", async () => {
    const user = userEvent.setup();
    const from = Temporal.Instant.from("2025-01-15T14:30:00Z");
    const to = Temporal.Instant.from("2025-01-20T16:45:00Z");

    render(<DateTimeRangePicker defaultValue={{ from, to }} />);

    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.value).not.toBe("");

    // Clear the value
    const clearButton = screen.getByRole("button", { name: /clear/i });
    await user.click(clearButton);
    expect(input.value).toBe("");

    // Re-select a new range
    await user.click(input);
    const dialog = screen.getByRole("dialog");
    const grid = within(dialog).getByRole("grid");

    const newStartDate = getDay(grid, 10);
    await user.click(newStartDate);
    const newEndDate = getDay(grid, 12);
    await user.click(newEndDate);

    // Apply the changes
    const applyButton = within(dialog).getByRole("button", { name: /apply/i });
    await user.click(applyButton);

    expect(input.value).toContain("10");
    expect(input.value).toContain("12");
  });

  it("validates that end datetime is after start datetime", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<DateTimeRangePicker onChange={onChange} placeholder="Select range" />);

    const input = screen.getByPlaceholderText("Select range");
    await user.click(input);

    const dialog = screen.getByRole("dialog");
    const grid = within(dialog).getByRole("grid");

    // Select start date (20th)
    const startDate = getDay(grid, 20);
    await user.click(startDate);

    // Try to select earlier end date (15th) - should be prevented or adjusted
    const endDate = getDay(grid, 15);
    await user.click(endDate);

    // Apply the changes to trigger onChange
    const applyButton = within(dialog).getByRole("button", { name: /apply/i });
    await user.click(applyButton);

    // Should swap dates or prevent invalid selection
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]?.[0] as DateTimeRangeValue;
    expect(lastCall).toBeDefined();
    if (lastCall.from && lastCall.to) {
      expect(Temporal.Instant.compare(lastCall.from, lastCall.to)).toBeLessThanOrEqual(0);
    }
  });

  // =============================================================================
  // Presets (4 tests)
  // =============================================================================

  it("shows default presets", async () => {
    const user = userEvent.setup();
    render(<DateTimeRangePicker placeholder="Select range" />);

    const input = screen.getByPlaceholderText("Select range");
    await user.click(input);

    const dialog = screen.getByRole("dialog");

    // Should show preset buttons
    expect(within(dialog).getByText("Last hour")).toBeInTheDocument();
    expect(within(dialog).getByText("Last 24 hours")).toBeInTheDocument();
    expect(within(dialog).getByText("Last 7 days")).toBeInTheDocument();
  });

  it("applies preset when clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<DateTimeRangePicker onChange={onChange} placeholder="Select range" />);

    const input = screen.getByPlaceholderText("Select range");
    await user.click(input);

    const dialog = screen.getByRole("dialog");
    const presetButton = within(dialog).getByText("Last 24 hours");
    await user.click(presetButton);

    // Should have called onChange with preset value
    expect(onChange).toHaveBeenCalled();
    const range = onChange.mock.calls[onChange.mock.calls.length - 1]?.[0] as DateTimeRangeValue;
    expect(range).toBeDefined();
    expect(range.from).toBeDefined();
    expect(range.to).toBeDefined();

    // Verify range is approximately 24 hours
    if (range.from && range.to) {
      const duration = range.from.until(range.to);
      expect(Math.abs(duration.total("hours") - 24)).toBeLessThan(1);
    }
  });

  it("accepts custom presets", async () => {
    const user = userEvent.setup();
    const customPresets = [
      {
        label: "Next Week",
        value: () => {
          const now = TemporalModule.now();
          const nextWeek = now.add({ hours: 7 * 24 });
          return { from: now, to: nextWeek };
        },
      },
    ];

    render(<DateTimeRangePicker presets={customPresets} placeholder="Select range" />);

    const input = screen.getByPlaceholderText("Select range");
    await user.click(input);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Next Week")).toBeInTheDocument();
  });

  it("hides presets when showPresets is false", async () => {
    const user = userEvent.setup();
    render(<DateTimeRangePicker showPresets={false} placeholder="Select range" />);

    const input = screen.getByPlaceholderText("Select range");
    await user.click(input);

    const dialog = screen.getByRole("dialog");

    // Should NOT show preset buttons
    expect(within(dialog).queryByText("Last hour")).not.toBeInTheDocument();
    expect(within(dialog).queryByText("Last 24 hours")).not.toBeInTheDocument();
  });

  // =============================================================================
  // Constraints (6 tests)
  // =============================================================================

  it("respects minDate constraint", async () => {
    const user = userEvent.setup();
    const minDate = Temporal.PlainDate.from("2025-01-15");

    render(<DateTimeRangePicker minDate={minDate} placeholder="Select range" />);

    const input = screen.getByPlaceholderText("Select range");
    await user.click(input);

    const dialog = screen.getByRole("dialog");
    const grid = within(dialog).getByRole("grid");

    // Dates before minDate should be disabled
    const date10 = getDay(grid, 10);
    expect(date10).toBeDisabled();

    // Dates on or after minDate should be enabled
    const date15 = getDay(grid, 15);
    expect(date15).not.toBeDisabled();
  });

  it("respects maxDate constraint", async () => {
    const user = userEvent.setup();
    const maxDate = Temporal.PlainDate.from("2025-01-20");

    render(<DateTimeRangePicker maxDate={maxDate} placeholder="Select range" />);

    const input = screen.getByPlaceholderText("Select range");
    await user.click(input);

    const dialog = screen.getByRole("dialog");
    const grid = within(dialog).getByRole("grid");

    // Dates after maxDate should be disabled
    const date25 = getDay(grid, 25);
    expect(date25).toBeDisabled();

    // Dates on or before maxDate should be enabled
    const date20 = getDay(grid, 20);
    expect(date20).not.toBeDisabled();
  });

  it("disables dates based on disabledDates matcher", async () => {
    const user = userEvent.setup();
    const isWeekend = (date: Temporal.PlainDate) => date.dayOfWeek === 6 || date.dayOfWeek === 7;

    render(<DateTimeRangePicker disabledDates={isWeekend} placeholder="Select range" />);

    const input = screen.getByPlaceholderText("Select range");
    await user.click(input);

    const dialog = screen.getByRole("dialog");
    const grid = within(dialog).getByRole("grid");

    // Find a weekend date and verify it's disabled
    // Jan 18, 2025 is a Saturday
    const saturday = getDay(grid, 18);
    expect(saturday).toBeDisabled();

    // Jan 19, 2025 is a Sunday
    const sunday = getDay(grid, 19);
    expect(sunday).toBeDisabled();
  });

  it("respects minTime constraint for both pickers", async () => {
    const user = userEvent.setup();
    const from = Temporal.Instant.from("2025-01-15T00:00:00Z");
    const to = Temporal.Instant.from("2025-01-20T00:00:00Z");
    const minTime = Temporal.PlainTime.from("09:00:00");

    render(<DateTimeRangePicker defaultValue={{ from, to }} minTime={minTime} placeholder="Select range" />);

    const input = screen.getByPlaceholderText("Select range");
    await user.click(input);

    const dialog = screen.getByRole("dialog");

    // Get all listboxes
    const listboxes = within(dialog).getAllByRole("listbox");

    // Get start time hour column and check that hours before 9 AM are disabled
    const startHourBox = listboxes[0]!;
    const hour8 = within(startHourBox)
      .getAllByRole("option")
      .find((btn) => btn.textContent === "08");
    expect(hour8).toBeDisabled();

    // Get end time hour column and verify same constraint
    const endHourBox = listboxes[2]!; // Third listbox is end hour (0=start hour, 1=start min, 2=end hour)
    const hour8End = within(endHourBox)
      .getAllByRole("option")
      .find((btn) => btn.textContent === "08");
    expect(hour8End).toBeDisabled();
  });

  it("respects maxTime constraint for both pickers", async () => {
    const user = userEvent.setup();
    const from = Temporal.Instant.from("2025-01-15T00:00:00Z");
    const to = Temporal.Instant.from("2025-01-20T00:00:00Z");
    const maxTime = Temporal.PlainTime.from("17:00:00");

    render(<DateTimeRangePicker defaultValue={{ from, to }} maxTime={maxTime} placeholder="Select range" />);

    const input = screen.getByPlaceholderText("Select range");
    await user.click(input);

    const dialog = screen.getByRole("dialog");

    // Switch to PM to test evening hours
    const pmButtons = within(dialog).getAllByText("PM");
    await user.click(pmButtons[0]!); // Switch start time to PM

    // Get all listboxes
    const listboxes = within(dialog).getAllByRole("listbox");

    // In 12h format with PM selected, hour 6 PM (18:00) is after maxTime 17:00, should be disabled
    const startHourBox = listboxes[0]!;
    const hour6PM = within(startHourBox)
      .getAllByRole("option")
      .find((btn) => btn.textContent === "06");
    expect(hour6PM).toBeDisabled();

    // Switch end time to PM and verify same constraint
    await user.click(pmButtons[1]!); // Switch end time to PM
    const endHourBox = listboxes[2]!; // Third listbox is end hour
    const hour6EndPM = within(endHourBox)
      .getAllByRole("option")
      .find((btn) => btn.textContent === "06");
    expect(hour6EndPM).toBeDisabled();
  });

  it("respects minuteStep in both time pickers", async () => {
    const user = userEvent.setup();
    const from = Temporal.Instant.from("2025-01-15T14:00:00Z");
    const to = Temporal.Instant.from("2025-01-20T16:00:00Z");

    render(<DateTimeRangePicker defaultValue={{ from, to }} minuteStep={15} placeholder="Select range" />);

    const input = screen.getByPlaceholderText("Select range");
    await user.click(input);

    const dialog = screen.getByRole("dialog");

    // Get all listboxes
    const listboxes = within(dialog).getAllByRole("listbox");

    // Get start time minute column (second listbox)
    const startMinuteBox = listboxes[1]!;
    const startMinutes = within(startMinuteBox).getAllByRole("option");

    // Should only have 00, 15, 30, 45
    expect(startMinutes).toHaveLength(4);
    expect(startMinutes.some((btn) => btn.textContent === "00")).toBe(true);
    expect(startMinutes.some((btn) => btn.textContent === "15")).toBe(true);
    expect(startMinutes.some((btn) => btn.textContent === "30")).toBe(true);
    expect(startMinutes.some((btn) => btn.textContent === "45")).toBe(true);

    // Get end time minute column (fourth listbox)
    const endMinuteBox = listboxes[3]!;
    const endMinutes = within(endMinuteBox).getAllByRole("option");

    // Should only have 00, 15, 30, 45
    expect(endMinutes).toHaveLength(4);
  });

  // =============================================================================
  // Time Format (3 tests)
  // =============================================================================

  it("displays in 12-hour format with AM/PM", () => {
    const from = Temporal.Instant.from("2025-01-15T14:30:00Z");
    const to = Temporal.Instant.from("2025-01-20T16:45:00Z");

    render(<DateTimeRangePicker defaultValue={{ from, to }} clockFormat="12h" />);

    const input = screen.getByRole("combobox") as HTMLInputElement;
    // Should show times in 12h format (specific times may vary by timezone)
    expect(input.value).toMatch(/\d{1,2}:\d{2}\s*(AM|PM)/);
  });

  it("displays in 24-hour format", () => {
    const from = Temporal.Instant.from("2025-01-15T14:30:00Z");
    const to = Temporal.Instant.from("2025-01-20T16:45:00Z");

    render(<DateTimeRangePicker defaultValue={{ from, to }} clockFormat="24h" />);

    const input = screen.getByRole("combobox") as HTMLInputElement;
    // Should show times in 24h format (specific times may vary by timezone)
    expect(input.value).toMatch(/\d{2}:\d{2}/);
  });

  it("shows seconds when showSeconds is true", () => {
    const from = Temporal.Instant.from("2025-01-15T14:30:45Z");
    const to = Temporal.Instant.from("2025-01-20T16:45:30Z");

    render(<DateTimeRangePicker defaultValue={{ from, to }} showSeconds />);

    const input = screen.getByRole("combobox") as HTMLInputElement;
    // Should show seconds in format like "2:30:45 PM" or "14:30:45"
    expect(input.value).toMatch(/:\d{2}:\d{2}/); // Should have two colons (HH:MM:SS)
  });

  // =============================================================================
  // State Management (3 tests)
  // =============================================================================

  it("works as controlled component", () => {
    const from = Temporal.Instant.from("2025-01-15T14:30:00Z");
    const to = Temporal.Instant.from("2025-01-20T16:45:00Z");
    const onChange = vi.fn();

    const { rerender } = render(<DateTimeRangePicker value={{ from, to }} onChange={onChange} />);

    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toMatch(/Jan(uary)?\s+\d{1,2},\s+2025/);

    // Update controlled value
    const newFrom = Temporal.Instant.from("2025-02-01T10:00:00Z");
    const newTo = Temporal.Instant.from("2025-02-05T12:00:00Z");
    rerender(<DateTimeRangePicker value={{ from: newFrom, to: newTo }} onChange={onChange} />);

    expect(input.value).toMatch(/Feb(ruary)?\s+\d{1,2},\s+2025/);
  });

  it("works as uncontrolled component with defaultValue", () => {
    const from = Temporal.Instant.from("2025-01-15T14:30:00Z");
    const to = Temporal.Instant.from("2025-01-20T16:45:00Z");

    render(<DateTimeRangePicker defaultValue={{ from, to }} />);

    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toMatch(/Jan(uary)?\s+\d{1,2},\s+2025/);
  });

  it("calls onChange when range changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<DateTimeRangePicker onChange={onChange} placeholder="Select range" />);

    const input = screen.getByPlaceholderText("Select range");
    await user.click(input);

    const dialog = screen.getByRole("dialog");
    const grid = within(dialog).getByRole("grid");

    // Select a date
    const date15 = getDay(grid, 15);
    await user.click(date15);

    // Apply the changes to trigger onChange
    const applyButton = within(dialog).getByRole("button", { name: /apply/i });
    await user.click(applyButton);

    expect(onChange).toHaveBeenCalled();
  });

  // =============================================================================
  // Form Integration (2 tests)
  // =============================================================================

  it("submits datetime range values in form", async () => {
    const user = userEvent.setup();
    const from = Temporal.Instant.from("2025-01-15T14:30:00Z");
    const to = Temporal.Instant.from("2025-01-20T16:45:00Z");

    const handleSubmit = vi.fn((e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      // FormData returns strings from hidden inputs, need to parse them
      const fromStr = formData.get("range.from") as string;
      const toStr = formData.get("range.to") as string;
      return {
        from: fromStr ? Temporal.Instant.from(fromStr) : null,
        to: toStr ? Temporal.Instant.from(toStr) : null,
      };
    });

    render(
      <form onSubmit={handleSubmit}>
        <DateTimeRangePicker name="range" defaultValue={{ from, to }} />
        <button type="submit">Submit</button>
      </form>
    );

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    expect(handleSubmit).toHaveBeenCalled();
    const result = handleSubmit.mock.results[0]!.value;
    // Should have Instant objects (can call toString() to get ISO format)
    expect(result.from).toBeInstanceOf(Temporal.Instant);
    expect(result.to).toBeInstanceOf(Temporal.Instant);
    expect(result.from.toString()).toMatch(/2025-01-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z/);
    expect(result.to.toString()).toMatch(/2025-01-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z/);
  });

  it("uses name prop for form field", () => {
    const from = Temporal.Instant.from("2025-01-15T14:30:00Z");
    const to = Temporal.Instant.from("2025-01-20T16:45:00Z");

    render(<DateTimeRangePicker name="eventRange" defaultValue={{ from, to }} />);

    // Should have hidden inputs with name + ".from" and name + ".to"
    const hiddenInputs = document.querySelectorAll('input[type="hidden"]');
    expect(hiddenInputs).toHaveLength(2);

    const names = Array.from(hiddenInputs).map((input) => (input as HTMLInputElement).name);
    expect(names).toContain("eventRange.from");
    expect(names).toContain("eventRange.to");
  });

  // =============================================================================
  // Disabled & Invalid States (2 tests)
  // =============================================================================

  it("respects isDisabled prop", () => {
    render(<DateTimeRangePicker isDisabled placeholder="Disabled" />);

    const input = screen.getByPlaceholderText("Disabled") as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it("applies invalid styling when isInvalid is true", () => {
    render(<DateTimeRangePicker isInvalid placeholder="Invalid" />);

    const input = screen.getByPlaceholderText("Invalid");
    // Should have error/invalid styling class
    expect(input.className).toContain("border-border-danger");
  });

  describe("Instant Range Value Handling", () => {
    it("accepts and displays Instant range values in user timezone", async () => {
      const range = {
        from: Temporal.Instant.from("2025-01-24T16:00:00Z"),
        to: Temporal.Instant.from("2025-01-24T23:30:00Z"),
      };
      render(<DateTimeRangePicker value={range} />);

      const input = screen.getByRole("combobox") as HTMLInputElement;
      // Should display range in local timezone
      expect(input.value).toContain("Jan");
      expect(input.value).toContain("2025");
      expect(input.value).toContain("–"); // Range separator
    });

    it("calls onChange with Instant range when user selects dates", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DateTimeRangePicker onChange={onChange} />);

      // Open picker
      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      // Select start date (10th)
      await user.click(getDay(dialog, 10));
      // Select end date (15th)
      await user.click(getDay(dialog, 15));

      // Apply
      await user.click(within(dialog).getByRole("button", { name: /apply/i }));

      expect(onChange).toHaveBeenCalled();
      const result = onChange.mock.calls[0]?.[0];
      expect(result).toBeDefined();
      expect(result).toHaveProperty("from");
      expect(result).toHaveProperty("to");
      if (result?.from) {
        expect(result.from).toBeInstanceOf(Temporal.Instant);
      }
      if (result?.to) {
        expect(result.to).toBeInstanceOf(Temporal.Instant);
      }
    });

    it("preset ranges return Instant values", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DateTimeRangePicker onChange={onChange} showPresets />);

      await user.click(screen.getByRole("combobox"));
      const dialog = screen.getByRole("dialog");

      // Click "Last 24 hours" preset
      await user.click(within(dialog).getByRole("button", { name: /last 24 hours/i }));

      expect(onChange).toHaveBeenCalled();
      const result = onChange.mock.calls[0]?.[0];
      expect(result).toBeDefined();
      expect(result?.from).toBeDefined();
      expect(result?.to).toBeDefined();
      expect(result?.from).toBeInstanceOf(Temporal.Instant);
      expect(result?.to).toBeInstanceOf(Temporal.Instant);
    });
  });
});
