/// <reference types="@testing-library/jest-dom" />

/**
 * Tests for the public, ISO-typed Calendar.
 *
 * Behaviour of the grid itself is covered by CalendarView.test.tsx. What is
 * tested here is only the boundary: that ISO strings go in, ISO strings come
 * out, and nothing Temporal-shaped is ever handed to a consumer callback.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Temporal } from "../../date-time";
import { Calendar } from "./Calendar";

const FIXED_TODAY = Temporal.PlainDate.from("2024-02-29");

vi.mock("../../date-time", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../date-time")>();
  return { ...actual, today: () => FIXED_TODAY };
});

const FEB_2024 = "2024-02-01";

function getDay(container: HTMLElement, date: string): HTMLElement {
  const el = container.querySelector(`[data-date="${date}"]`);
  if (!el) throw new Error(`Day button for ${date} not found`);
  return el as HTMLElement;
}

// =============================================================================
// Inbound: ISO strings render the right grid
// =============================================================================

describe("Calendar — accepting ISO strings", () => {
  it("renders the month named by an ISO date", () => {
    render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
    expect(screen.getByRole("grid", { name: "February 2024" })).toBeInTheDocument();
  });

  it("ignores the day component of `month`", () => {
    render(<Calendar mode="single" value={undefined} onSelect={() => {}} month="2024-02-17" onMonthChange={() => {}} />);
    expect(screen.getByRole("grid", { name: "February 2024" })).toBeInTheDocument();
  });

  it("marks an ISO value as selected", () => {
    const { container } = render(<Calendar mode="single" value="2024-02-14" onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
    expect(getDay(container, "2024-02-14").closest("td")).toHaveAttribute("aria-selected", "true");
  });

  it("marks both ends and the interior of an ISO range", () => {
    const { container } = render(
      <Calendar mode="range" value={{ from: "2024-02-10", to: "2024-02-12" }} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />
    );
    for (const date of ["2024-02-10", "2024-02-11", "2024-02-12"]) {
      expect(getDay(container, date).closest("td"), date).toHaveAttribute("aria-selected", "true");
    }
    expect(getDay(container, "2024-02-13").closest("td")).toHaveAttribute("aria-selected", "false");
  });

  it("marks every date in a multiple-mode array", () => {
    const { container } = render(
      <Calendar mode="multiple" value={["2024-02-05", "2024-02-20"]} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />
    );
    expect(getDay(container, "2024-02-05").closest("td")).toHaveAttribute("aria-selected", "true");
    expect(getDay(container, "2024-02-20").closest("td")).toHaveAttribute("aria-selected", "true");
    expect(getDay(container, "2024-02-06").closest("td")).toHaveAttribute("aria-selected", "false");
  });
});

// =============================================================================
// Outbound: callbacks receive ISO strings, never Temporal
// =============================================================================

describe("Calendar — emitting ISO strings", () => {
  it("reports a single selection as a canonical ISO date", async () => {
    const onSelect = vi.fn();
    const { container } = render(<Calendar mode="single" value={undefined} onSelect={onSelect} month={FEB_2024} onMonthChange={() => {}} />);

    await userEvent.click(getDay(container, "2024-02-14"));

    expect(onSelect).toHaveBeenCalledWith("2024-02-14");
    expect(typeof onSelect.mock.calls[0]?.[0]).toBe("string");
  });

  it("reports deselection as undefined", async () => {
    const onSelect = vi.fn();
    const { container } = render(<Calendar mode="single" value="2024-02-14" onSelect={onSelect} month={FEB_2024} onMonthChange={() => {}} />);

    await userEvent.click(getDay(container, "2024-02-14"));

    expect(onSelect).toHaveBeenCalledWith(undefined);
  });

  it("reports a range as ISO strings on both ends", async () => {
    const onSelect = vi.fn();
    const { container } = render(<Calendar mode="range" value={undefined} onSelect={onSelect} month={FEB_2024} onMonthChange={() => {}} />);

    await userEvent.click(getDay(container, "2024-02-10"));
    expect(onSelect).toHaveBeenLastCalledWith({ from: "2024-02-10", to: undefined });
  });

  it("reports a completed range as ISO strings", async () => {
    const onSelect = vi.fn();
    const { container } = render(
      <Calendar mode="range" value={{ from: "2024-02-10", to: undefined }} onSelect={onSelect} month={FEB_2024} onMonthChange={() => {}} />
    );

    await userEvent.click(getDay(container, "2024-02-15"));
    expect(onSelect).toHaveBeenLastCalledWith({ from: "2024-02-10", to: "2024-02-15" });
  });

  it("reports multiple selections as an array of ISO strings", async () => {
    const onSelect = vi.fn();
    const { container } = render(<Calendar mode="multiple" value={["2024-02-05"]} onSelect={onSelect} month={FEB_2024} onMonthChange={() => {}} />);

    await userEvent.click(getDay(container, "2024-02-20"));
    expect(onSelect).toHaveBeenLastCalledWith(["2024-02-05", "2024-02-20"]);
  });

  it("reports a month change as an ISO date", async () => {
    const onMonthChange = vi.fn();
    render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={onMonthChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Next month" }));

    expect(onMonthChange).toHaveBeenCalledWith("2024-03-01");
    expect(typeof onMonthChange.mock.calls[0]?.[0]).toBe("string");
  });
});

// =============================================================================
// Bounds and disabled dates
// =============================================================================

describe("Calendar — ISO bounds", () => {
  it("disables dates before minDate", () => {
    const { container } = render(
      <Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} minDate="2024-02-10" />
    );
    expect(getDay(container, "2024-02-09")).toBeDisabled();
    expect(getDay(container, "2024-02-10")).not.toBeDisabled();
  });

  it("disables dates after maxDate", () => {
    const { container } = render(
      <Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} maxDate="2024-02-20" />
    );
    expect(getDay(container, "2024-02-20")).not.toBeDisabled();
    expect(getDay(container, "2024-02-21")).toBeDisabled();
  });
});

describe("Calendar — the disabled prop", () => {
  const renderWith = (disabled: React.ComponentProps<typeof Calendar>["disabled"]) =>
    render(<Calendar mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} disabled={disabled} />);

  it("accepts a single ISO date", () => {
    const { container } = renderWith("2024-02-14");
    expect(getDay(container, "2024-02-14")).toBeDisabled();
    expect(getDay(container, "2024-02-15")).not.toBeDisabled();
  });

  it("accepts an array of ISO dates", () => {
    const { container } = renderWith(["2024-02-14", "2024-02-15"]);
    expect(getDay(container, "2024-02-14")).toBeDisabled();
    expect(getDay(container, "2024-02-15")).toBeDisabled();
    expect(getDay(container, "2024-02-16")).not.toBeDisabled();
  });

  it("accepts { before }", () => {
    const { container } = renderWith({ before: "2024-02-10" });
    expect(getDay(container, "2024-02-09")).toBeDisabled();
    expect(getDay(container, "2024-02-10")).not.toBeDisabled();
  });

  it("accepts { after }", () => {
    const { container } = renderWith({ after: "2024-02-20" });
    expect(getDay(container, "2024-02-20")).not.toBeDisabled();
    expect(getDay(container, "2024-02-21")).toBeDisabled();
  });

  it("accepts an inclusive { from, to } span", () => {
    const { container } = renderWith({ from: "2024-02-10", to: "2024-02-12" });
    expect(getDay(container, "2024-02-09")).not.toBeDisabled();
    expect(getDay(container, "2024-02-10")).toBeDisabled();
    expect(getDay(container, "2024-02-12")).toBeDisabled();
    expect(getDay(container, "2024-02-13")).not.toBeDisabled();
  });

  it("accepts { dayOfWeek } by name — the case that used to need a predicate", () => {
    // Feb 2024: the 3rd, 10th, 17th, 24th are Saturdays; the 4th, 11th, 18th, 25th Sundays.
    const { container } = renderWith({ dayOfWeek: ["sat", "sun"] });
    for (const date of ["2024-02-03", "2024-02-04", "2024-02-10", "2024-02-11"]) {
      expect(getDay(container, date), date).toBeDisabled();
    }
    for (const date of ["2024-02-05", "2024-02-06", "2024-02-09"]) {
      expect(getDay(container, date), date).not.toBeDisabled();
    }
  });

  it("hands a predicate canonical ISO strings, not Temporal objects", () => {
    const seen: unknown[] = [];
    const { container } = renderWith((date) => {
      seen.push(date);
      return date === "2024-02-14";
    });

    expect(getDay(container, "2024-02-14")).toBeDisabled();
    expect(getDay(container, "2024-02-15")).not.toBeDisabled();
    expect(seen.every((entry) => typeof entry === "string")).toBe(true);
    expect(seen).toContain("2024-02-14");
  });

  it("accepts a mixed list of matchers", () => {
    const { container } = renderWith([{ before: "2024-02-05" }, { dayOfWeek: ["sun"] }]);
    expect(getDay(container, "2024-02-04")).toBeDisabled(); // before, and a Sunday
    expect(getDay(container, "2024-02-11")).toBeDisabled(); // Sunday
    expect(getDay(container, "2024-02-06")).not.toBeDisabled();
  });
});

// =============================================================================
// Presets
// =============================================================================

describe("Calendar — ISO presets", () => {
  it("applies a single-mode preset as an ISO date", async () => {
    const onSelect = vi.fn();
    render(
      <Calendar
        mode="single"
        value={undefined}
        onSelect={onSelect}
        month={FEB_2024}
        onMonthChange={() => {}}
        presets={[{ label: "Valentine's", value: "2024-02-14" }]}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Valentine's" }));
    expect(onSelect).toHaveBeenCalledWith("2024-02-14");
  });

  it("applies a range preset as an ISO range", async () => {
    const onSelect = vi.fn();
    render(
      <Calendar
        mode="range"
        value={undefined}
        onSelect={onSelect}
        month={FEB_2024}
        onMonthChange={() => {}}
        presets={[{ label: "First week", value: { from: "2024-02-01", to: "2024-02-07" } }]}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "First week" }));
    expect(onSelect).toHaveBeenCalledWith({ from: "2024-02-01", to: "2024-02-07" });
  });

  it("marks the active preset when the value matches", () => {
    render(
      <Calendar
        mode="single"
        value="2024-02-14"
        onSelect={() => {}}
        month={FEB_2024}
        onMonthChange={() => {}}
        presets={[{ label: "Valentine's", value: "2024-02-14" }]}
      />
    );
    expect(screen.getByRole("button", { name: "Valentine's" }).className).toContain("bg-bg-brand-subtle");
  });
});

// =============================================================================
// Input tolerance
// =============================================================================

describe("Calendar — non-canonical input", () => {
  it("throws on a datetime where a date belongs, rather than truncating it", () => {
    // Suppress React's error logging for the expected throw.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <Calendar
          mode="single"
          value={undefined}
          onSelect={() => {}}
          // @ts-expect-error — the template literal type rejects this at compile
          // time; the runtime guard is what protects a value arriving as `string`.
          month="2024-02-01T10:00:00"
          onMonthChange={() => {}}
        />
      )
    ).toThrow();
    spy.mockRestore();
  });
});

describe("Calendar — ref forwarding", () => {
  it("forwards ref to the root element", () => {
    const ref = vi.fn();
    render(<Calendar ref={ref} mode="single" value={undefined} onSelect={() => {}} month={FEB_2024} onMonthChange={() => {}} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
