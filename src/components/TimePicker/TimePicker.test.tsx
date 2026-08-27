/// <reference types="@testing-library/jest-dom" />

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { TimePicker } from "./TimePicker";
import type { TimePresetOption } from "./timepicker.types";

// Mock scrollTo for JSDOM
beforeAll(() => {
  Element.prototype.scrollTo = vi.fn();
});

/**
 * The trigger is a segmented field, so there is no one element that both opens
 * the popover and carries the value: the clock button opens it, and the segments
 * hold the value.
 */
function openPicker(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  return user.click(screen.getByRole("button", { name: "Open time picker" }));
}

/** What the segments read, e.g. `"02:30 PM"`. */
function fieldValue(): string {
  return screen.getByRole("group", { name: "Time" }).textContent ?? "";
}

function segment(name: "Hour" | "Minute" | "Second" | "AM/PM"): HTMLElement {
  return screen.getByRole("spinbutton", { name });
}

describe("TimePicker", () => {
  describe("ISO string boundary", () => {
    it("accepts an ISO time as the value prop", () => {
      const time = "14:30";
      render(<TimePicker value={time} />);

      expect(fieldValue()).toBe("02:30 PM");
    });

    it("calls onChange with a canonical ISO time when a time is selected", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      // Use 24h format to avoid AM/PM complexity
      render(<TimePicker onChange={handleChange} clockFormat="24h" />);

      // Open the picker
      await openPicker(user);

      const dialog = screen.getByRole("dialog");

      // Select hour 03
      const columns = within(dialog).getAllByRole("listbox");
      expect(columns.length).toBeGreaterThanOrEqual(2);
      await user.click(within(columns[0]!).getByRole("option", { name: "03" }));

      // Select minute 45
      await user.click(within(columns[1]!).getByRole("option", { name: "45" }));

      // Click Apply
      await user.click(within(dialog).getByRole("button", { name: "Apply" }));

      // Should have been called with a canonical ISO time string
      expect(handleChange).toHaveBeenCalledTimes(1);
      const calledWith = handleChange.mock.calls[0]![0];
      expect(typeof calledWith).toBe("string");
      expect(calledWith).toBe("03:45:00");
    });

    it("calls onChange with undefined when time is cleared", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const time = "14:30";

      render(<TimePicker value={time} onChange={handleChange} />);

      // Click the clear button
      await user.click(screen.getByRole("button", { name: /clear/i }));

      expect(handleChange).toHaveBeenCalledWith(undefined);
    });

    it("respects an ISO minTime", async () => {
      const user = userEvent.setup();
      const minTime = "09:00";
      const handleChange = vi.fn();

      render(<TimePicker minTime={minTime} onChange={handleChange} clockFormat="24h" />);

      // Open the picker
      await openPicker(user);

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

    it("respects an ISO maxTime", async () => {
      const user = userEvent.setup();
      const maxTime = "17:00";
      const handleChange = vi.fn();

      render(<TimePicker maxTime={maxTime} onChange={handleChange} clockFormat="24h" />);

      // Open the picker
      await openPicker(user);

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

    it("displays a formatted time in 24h format", () => {
      const time = "14:30:45";
      render(<TimePicker value={time} clockFormat="24h" />);

      expect(fieldValue()).toBe("14:30");
    });

    it("displays a formatted time in 12h format", () => {
      const time = "14:30";
      render(<TimePicker value={time} clockFormat="12h" />);

      expect(fieldValue()).toBe("02:30 PM");
    });
  });

  describe("typeable segments", () => {
    it("types a 12-hour time, meridiem and all", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<TimePicker onChange={handleChange} />);

      await user.click(segment("Hour"));
      await user.keyboard("0230p");

      expect(fieldValue()).toBe("02:30 PM");
      expect(handleChange).toHaveBeenCalledWith("14:30:00");
    });

    it("types a 24-hour time", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<TimePicker clockFormat="24h" onChange={handleChange} />);

      await user.click(segment("Hour"));
      await user.keyboard("1430");

      expect(fieldValue()).toBe("14:30");
      expect(handleChange).toHaveBeenCalledWith("14:30:00");
    });

    it("rolls an hour that cannot take a second digit into the minute", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<TimePicker clockFormat="24h" onChange={handleChange} />);

      // There is no 30th hour, so the 4 starts the minute rather than replacing
      // the 3.
      await user.click(segment("Hour"));
      await user.keyboard("345");

      expect(fieldValue()).toBe("03:45");
      expect(handleChange).toHaveBeenCalledWith("03:45:00");
    });

    it("toggles AM/PM with the arrow keys and announces the word", async () => {
      const user = userEvent.setup();
      render(<TimePicker defaultValue="09:30" />);

      const period = segment("AM/PM");
      expect(period).toHaveAttribute("aria-valuetext", "AM");

      await user.click(period);
      await user.keyboard("{ArrowUp}");
      expect(period).toHaveAttribute("aria-valuetext", "PM");
      expect(fieldValue()).toBe("09:30 PM");
    });

    it("types seconds when the format asks for them", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<TimePicker format="HH:mm:ss" clockFormat="24h" onChange={handleChange} />);

      await user.click(segment("Hour"));
      await user.keyboard("103015");

      expect(fieldValue()).toBe("10:30:15");
      expect(handleChange).toHaveBeenCalledWith("10:30:15");
    });

    it("reads a pasted time, meridiem included", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<TimePicker clockFormat="24h" onChange={handleChange} />);

      await user.click(segment("Hour"));
      await user.paste("9:30 PM");

      // Pasted into a 24-hour field, so it lands on 21:30.
      expect(fieldValue()).toBe("21:30");
      expect(handleChange).toHaveBeenCalledWith("21:30:00");
    });

    it("opens the columns on Alt+ArrowDown and moves focus into the hour", async () => {
      const user = userEvent.setup();
      render(<TimePicker defaultValue="09:30" clockFormat="24h" />);

      await user.click(segment("Hour"));
      await user.keyboard("{Alt>}{ArrowDown}{/Alt}");

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog.contains(document.activeElement)).toBe(true);
      expect(document.activeElement).toHaveRole("option");
    });

    it("focuses a segment when the field is clicked anywhere", async () => {
      const user = userEvent.setup();
      render(<TimePicker clockFormat="24h" />);

      await user.click(screen.getByRole("group", { name: "Time" }));
      expect(document.activeElement).toBe(segment("Hour"));

      await user.keyboard("1430");
      expect(fieldValue()).toBe("14:30");
    });

    it("flags a typed time the columns would refuse", async () => {
      const user = userEvent.setup();
      render(<TimePicker clockFormat="24h" maxTime="17:00" />);

      await user.click(segment("Hour"));
      await user.keyboard("2230");

      expect(screen.getByRole("group", { name: "Time" })).toHaveAttribute("aria-invalid", "true");
    });

    it("clears the value when a segment is emptied", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<TimePicker defaultValue="14:30" clockFormat="24h" onChange={handleChange} />);

      await user.click(segment("Minute"));
      await user.keyboard("{Backspace}");

      expect(fieldValue()).toBe("14:mm");
      expect(handleChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe("presets", () => {
    it("accepts ISO preset values and reports the choice as ISO", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const morning = "09:00";
      const afternoon = "14:00";

      const presets: TimePresetOption[] = [
        { label: "Morning", value: morning },
        { label: "Afternoon", value: afternoon },
      ];

      render(<TimePicker presets={presets} onChange={handleChange} />);

      await openPicker(user);

      const dialog = screen.getByRole("dialog");
      await user.click(within(dialog).getByRole("button", { name: "Afternoon" }));
      await user.click(within(dialog).getByRole("button", { name: "Apply" }));

      expect(handleChange).toHaveBeenCalledTimes(1);
      const calledWith = handleChange.mock.calls[0]![0];
      expect(typeof calledWith).toBe("string");
      expect(calledWith).toBe("14:00:00");
    });
  });

  describe("seconds support", () => {
    it("preserves seconds when format is HH:mm:ss", () => {
      const time = "14:30:45";
      render(<TimePicker value={time} format="HH:mm:ss" clockFormat="24h" />);

      expect(fieldValue()).toBe("14:30:45");
    });

    it("emits an ISO time with seconds when format is HH:mm:ss", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<TimePicker format="HH:mm:ss" clockFormat="24h" onChange={handleChange} />);

      await openPicker(user);

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
      expect(typeof calledWith).toBe("string");
      expect(calledWith).toBe("10:30:15");
    });
  });
});

describe("TimePicker — ref forwarding", () => {
  it("forwards ref to the trigger wrapper element", () => {
    const ref = vi.fn();
    render(<TimePicker ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
