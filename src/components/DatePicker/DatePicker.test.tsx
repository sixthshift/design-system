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

/**
 * Single mode's trigger is a segmented field, so there is no one element that
 * both opens the popover and carries the value: the calendar button opens it,
 * and the segments hold the value. Range and multiple modes still render the
 * read-only `combobox` input, and their tests still use it.
 */
function openCalendar(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  return user.click(screen.getByRole("button", { name: "Open calendar" }));
}

/** What the segments read, e.g. `"01/15/2025"`. */
function fieldValue(): string {
  return screen.getByRole("group", { name: "Date" }).textContent ?? "";
}

function segment(name: "Day" | "Month" | "Year"): HTMLElement {
  return screen.getByRole("spinbutton", { name });
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

      expect(fieldValue()).toBe("01/15/2025");
    });

    it("calls onChange with a canonical ISO date string when a date is selected", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DatePicker onChange={handleChange} />);

      await openCalendar(user);

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

      await openCalendar(user);
      const dialog = screen.getByRole("dialog");

      expect(getDay(dialog, 5)).toBeDisabled();
      expect(getDay(dialog, 15)).not.toBeDisabled();
    });

    it("respects an ISO maxDate", async () => {
      const user = userEvent.setup();
      render(<DatePicker maxDate={isoDay(20)} />);

      await openCalendar(user);
      const dialog = screen.getByRole("dialog");

      expect(getDay(dialog, 25)).toBeDisabled();
      expect(getDay(dialog, 15)).not.toBeDisabled();
    });

    it("handles range mode with ISO from/to", () => {
      render(<DatePicker mode="range" value={{ from: "2025-01-10", to: "2025-01-20" }} onChange={() => {}} />);

      // Two fields, one per end.
      expect(screen.getByRole("group", { name: "Start date" }).textContent).toBe("01/10/2025");
      expect(screen.getByRole("group", { name: "End date" }).textContent).toBe("01/20/2025");
    });

    it("reports a range selection as ISO strings", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<DatePicker mode="range" onChange={handleChange} />);

      await user.click(screen.getByRole("button", { name: "Open calendar for start date" }));
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

    it("shows a December date in the segments", () => {
      render(<DatePicker value="2025-12-25" />);
      expect(fieldValue()).toBe("12/25/2025");
    });

    it("accepts a defaultValue as an ISO string in uncontrolled mode", () => {
      render(<DatePicker defaultValue="2025-03-07" />);
      expect(fieldValue()).toBe("03/07/2025");
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

      await openCalendar(user);
      expect(getDay(screen.getByRole("dialog"), 15)).toBeDisabled();
    });

    it("accepts an array of ISO dates", async () => {
      const user = userEvent.setup();
      render(<DatePicker disabled={[isoDay(10), isoDay(15)]} />);

      await openCalendar(user);
      const dialog = screen.getByRole("dialog");

      expect(getDay(dialog, 10)).toBeDisabled();
      expect(getDay(dialog, 15)).toBeDisabled();
      expect(getDay(dialog, 12)).not.toBeDisabled();
    });

    it("accepts { before } and { after }", async () => {
      const user = userEvent.setup();
      const { unmount } = render(<DatePicker disabled={{ before: isoDay(10) }} />);
      await openCalendar(user);
      expect(getDay(screen.getByRole("dialog"), 9)).toBeDisabled();
      expect(getDay(screen.getByRole("dialog"), 10)).not.toBeDisabled();
      unmount();

      render(<DatePicker disabled={{ after: isoDay(20) }} />);
      await openCalendar(user);
      expect(getDay(screen.getByRole("dialog"), 21)).toBeDisabled();
      expect(getDay(screen.getByRole("dialog"), 20)).not.toBeDisabled();
    });

    it("disables weekends declaratively via { dayOfWeek }", async () => {
      const user = userEvent.setup();
      // Pin to a month whose weekend days are known: Feb 2025 starts on a Saturday,
      // so the 1st and 2nd are Sat/Sun and the 3rd is a Monday.
      render(<DatePicker value="2025-02-10" disabled={{ dayOfWeek: ["sat", "sun"] }} />);

      await openCalendar(user);
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

      await openCalendar(user);
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

      await openCalendar(user);
      const dialog = screen.getByRole("dialog");
      await user.click(within(dialog).getByRole("button", { name: "Tomorrow" }));
      await user.click(within(dialog).getByRole("button", { name: "Apply" }));

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange.mock.calls[0]?.[0]).toBe(tomorrow);
    });
  });
});

describe("DatePicker — typeable segments", () => {
  it("commits a date typed across all three segments", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<DatePicker onChange={handleChange} />);

    await user.click(segment("Month"));
    await user.keyboard("08272026");

    expect(fieldValue()).toBe("08/27/2026");
    expect(handleChange).toHaveBeenCalledWith("2026-08-27");
  });

  it("flags a typed date the calendar would refuse", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<DatePicker maxDate="2026-01-10" onChange={handleChange} />);

    await user.click(segment("Month"));
    await user.keyboard("01202026");

    // Reported, so the caller's own validation sees the attempt — and flagged,
    // so the user can see why it will not be accepted.
    expect(handleChange).toHaveBeenCalledWith("2026-01-20");
    expect(screen.getByRole("group", { name: "Date" })).toHaveAttribute("aria-invalid", "true");
  });

  it("focuses a segment when the field is clicked anywhere, not just on the digits", async () => {
    const user = userEvent.setup();
    render(<DatePicker />);

    // The digits are ~100px of a 260px-wide field. Clicking the empty part has
    // to focus something, or typing silently does nothing — which is what a
    // person reads as "it does not work".
    await user.click(screen.getByRole("group", { name: "Date" }));
    expect(document.activeElement).toBe(segment("Month"));

    await user.keyboard("152026");
    expect(fieldValue()).toBe("01/05/2026");
  });

  it("rolls a digit that cannot extend a segment into the next one", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<DatePicker onChange={handleChange} />);

    // January the 5th, typed the way a person types it: no padding, no tabbing.
    // The 5 cannot extend "1" into a month, so it becomes the day rather than
    // replacing January with May.
    await user.click(segment("Month"));
    await user.keyboard("152026");

    expect(fieldValue()).toBe("01/05/2026");
    expect(handleChange).toHaveBeenCalledWith("2026-01-05");
  });

  it("treats a separator as done-with-this-segment", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<DatePicker onChange={handleChange} />);

    await user.click(segment("Month"));
    await user.keyboard("1/5/2026");

    expect(handleChange).toHaveBeenCalledWith("2026-01-05");
  });

  it("shows digits as typed rather than padding mid-number", async () => {
    const user = userEvent.setup();
    render(<DatePicker />);

    await user.click(segment("Month"));
    await user.keyboard("1225202");

    // A year in progress reads 202, not 0202.
    expect(fieldValue()).toBe("12/25/202");
  });

  it("does not announce a year while it is still being typed", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<DatePicker onChange={handleChange} />);

    await user.click(segment("Month"));
    await user.keyboard("1225202");

    // 0002-12-25 and 0020-12-25 are keystrokes, not dates.
    expect(handleChange).not.toHaveBeenCalled();

    await user.keyboard("6");
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith("2026-12-25");
  });

  it("flushes a half-typed number when the field loses focus", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <>
        <DatePicker defaultValue="2026-12-25" onChange={handleChange} />
        <button type="button">elsewhere</button>
      </>
    );

    await user.click(segment("Year"));
    await user.keyboard("202");
    expect(handleChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "elsewhere" }));
    expect(handleChange).toHaveBeenCalledWith("0202-12-25");
  });

  it("undoes one digit of a number being typed", async () => {
    const user = userEvent.setup();
    render(<DatePicker />);

    await user.click(segment("Month"));
    await user.keyboard("1225202{Backspace}6");

    // The Backspace took the 2 off "202", so the 6 lands on "20".
    expect(fieldValue()).toBe("12/25/206");
  });

  it("steps back to the previous segment when Backspace finds an empty one", async () => {
    const user = userEvent.setup();
    render(<DatePicker />);

    await user.click(segment("Month"));
    await user.keyboard("8");
    expect(document.activeElement).toBe(segment("Day"));

    // The day is empty, so the first Backspace moves back to the month it
    // advanced past — the only way to reach it without a mouse.
    await user.keyboard("{Backspace}");
    expect(document.activeElement).toBe(segment("Month"));
    expect(fieldValue()).toBe("08/dd/yyyy");

    await user.keyboard("{Backspace}");
    expect(fieldValue()).toBe("mm/dd/yyyy");
  });

  it("advances as soon as a segment cannot take another digit", async () => {
    const user = userEvent.setup();
    render(<DatePicker />);

    await user.click(segment("Month"));
    // 8 can only be August — there is no 80th month — so focus moves on.
    await user.keyboard("8");

    expect(segment("Month")).toHaveAttribute("aria-valuenow", "8");
    expect(document.activeElement).toBe(segment("Day"));
  });

  it("reads the same digits differently under a different segment order", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<DatePicker segmentOrder="dmy" onChange={handleChange} />);

    await user.click(segment("Day"));
    await user.keyboard("27082026");

    expect(handleChange).toHaveBeenCalledWith("2026-08-27");
  });

  it("does not report a partially typed date", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<DatePicker onChange={handleChange} />);

    await user.click(segment("Month"));
    await user.keyboard("0827");

    expect(fieldValue()).toBe("08/27/yyyy");
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("clamps the day to the length of the typed month, in the field as well as the value", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<DatePicker onChange={handleChange} />);

    await user.click(segment("Month"));
    await user.keyboard("02312026");

    expect(handleChange).toHaveBeenCalledWith("2026-02-28");
    // The field has to follow the value, or it reads 02/31 while the value says
    // the 28th.
    expect(fieldValue()).toBe("02/28/2026");
  });

  it("steps a segment with the arrow keys, starting from today when empty", async () => {
    const user = userEvent.setup();
    render(<DatePicker />);

    const currentMonth = Number(todayISO().slice(5, 7));

    await user.click(segment("Month"));
    await user.keyboard("{ArrowUp}");
    expect(segment("Month")).toHaveAttribute("aria-valuenow", String(currentMonth));

    await user.keyboard("{ArrowDown}");
    const expected = currentMonth === 1 ? 12 : currentMonth - 1;
    expect(segment("Month")).toHaveAttribute("aria-valuenow", String(expected));
  });

  it("clears the value when a segment is emptied", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<DatePicker defaultValue="2025-01-15" onChange={handleChange} />);

    await user.click(segment("Day"));
    await user.keyboard("{Backspace}");

    expect(fieldValue()).toBe("01/dd/2025");
    expect(handleChange).toHaveBeenCalledWith(undefined);
  });

  it("opens the calendar on Alt+ArrowDown and moves focus into the grid", async () => {
    const user = userEvent.setup();
    render(<DatePicker value="2025-01-15" onChange={() => {}} />);

    await user.click(segment("Month"));
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}");

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).toHaveAttribute("data-date");
  });

  it("shows a day picked in the grid in the segments before it is applied", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<DatePicker onChange={handleChange} />);

    await openCalendar(user);
    await user.click(getDay(screen.getByRole("dialog"), 15));

    // The draft is visible in the field, but nothing has been committed yet.
    expect(fieldValue()).toBe(isoDay(15).replace(/(\d{4})-(\d{2})-(\d{2})/, "$2/$3/$1"));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("applies the open draft on Enter in a segment", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<DatePicker onChange={handleChange} />);

    await openCalendar(user);
    await user.click(getDay(screen.getByRole("dialog"), 15));
    await user.click(segment("Month"));
    await user.keyboard("{Enter}");

    expect(handleChange).toHaveBeenCalledWith(isoDay(15));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("fills every segment from a pasted ISO date", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<DatePicker onChange={handleChange} />);

    await user.click(segment("Month"));
    await user.paste("2026-08-27");

    expect(fieldValue()).toBe("08/27/2026");
    expect(handleChange).toHaveBeenCalledWith("2026-08-27");
  });

  it("leaves the segments alone when disabled", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<DatePicker isDisabled onChange={handleChange} />);

    await user.click(segment("Month"));
    await user.keyboard("08272026");

    expect(fieldValue()).toBe("mm/dd/yyyy");
    expect(handleChange).not.toHaveBeenCalled();
  });
});

describe("DatePicker — range mode fields", () => {
  const startField = () => screen.getByRole("group", { name: "Start date" });
  const endField = () => screen.getByRole("group", { name: "End date" });

  it("types both ends independently", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<DatePicker mode="range" onChange={handleChange} />);

    await user.click(startField());
    await user.keyboard("152026");
    await user.click(endField());
    // A separator, because `114…` would read as November the 4th — which is the
    // rule working, not a bug.
    await user.keyboard("1/14/2026");

    expect(startField().textContent).toBe("01/05/2026");
    expect(endField().textContent).toBe("01/14/2026");
    expect(handleChange).toHaveBeenLastCalledWith({ from: "2026-01-05", to: "2026-01-14" });
  });

  it("gives each end its own clear button", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<DatePicker mode="range" defaultValue={{ from: "2026-01-05", to: "2026-01-14" }} onChange={handleChange} />);

    await user.click(screen.getByRole("button", { name: "Clear end date" }));

    expect(handleChange).toHaveBeenCalledWith({ from: "2026-01-05", to: undefined });
    expect(startField().textContent).toBe("01/05/2026");
    expect(endField().textContent).toBe("mm/dd/yyyy");
  });

  it("fills both halves from a range picked in the grid", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<DatePicker mode="range" onChange={handleChange} />);

    await user.click(screen.getByRole("button", { name: "Open calendar for start date" }));
    const dialog = screen.getByRole("dialog");
    await user.click(getDay(dialog, 10));
    await user.click(getDay(dialog, 20));

    // The draft is visible in both fields before Apply commits it.
    const [, month] = /^(\d{2})/.exec(startField().textContent ?? "") ?? [];
    expect(startField().textContent).toBe(`${month}/10/${isoDay(10).slice(0, 4)}`);
    expect(endField().textContent).toBe(`${month}/20/${isoDay(20).slice(0, 4)}`);
    expect(handleChange).not.toHaveBeenCalled();
  });
});

describe("DatePicker — ref forwarding", () => {
  it("forwards ref to the trigger wrapper element", () => {
    const ref = vi.fn();
    render(<DatePicker ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
