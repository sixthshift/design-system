import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { expect, userEvent, within } from "storybook/test";
import {
  addDaysISO,
  addMonthsISO,
  type DisabledDates as DisabledDatesProp,
  endOfWeekISO,
  type ISODate,
  type ISODateRange,
  isWeekendISO,
  startOfWeekISO,
  todayISO,
} from "../../date-time";
import { Calendar } from "./Calendar";
import type { PresetOption } from "./calendar.types";

const meta: Meta<typeof Calendar> = {
  title: "Components/Calendar",
  component: Calendar,
  parameters: {
    layout: "padded",
    docs: { subtitle: "Inline month grid for single, range, or multiple date selection" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Calendar>;

// ============================================================================
// Single Mode - Basic
// ============================================================================

/**
 * The day grid is a single tab stop, and arrow keys move real DOM focus.
 *
 * Roving `tabIndex` is entirely about where focus lands, which is the thing a
 * simulated DOM is least reliable about.
 */
export const KeyboardPlay: Story = {
  name: "Keyboard Play",
  render: function KeyboardPlayStory() {
    const [value, setValue] = React.useState<ISODate | undefined>(todayISO());
    const [month, setMonth] = React.useState(todayISO());
    return <Calendar mode="single" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} />;
  },
  play: async ({ canvasElement }) => {
    const grid = within(canvasElement).getByRole("grid");
    const tabStop = grid.querySelector<HTMLButtonElement>('[tabindex="0"]')!;
    await expect(grid.querySelectorAll('[tabindex="0"]')).toHaveLength(1);

    tabStop.focus();
    const from = tabStop.getAttribute("data-date");
    await userEvent.keyboard("{ArrowRight}");

    const focused = document.activeElement as HTMLElement;
    await expect(focused).toHaveAttribute("data-date");
    await expect(focused.getAttribute("data-date")).not.toBe(from);
  },
};

export const SingleMode: Story = {
  name: "Single Mode",
  render: function SingleModeStory() {
    const [value, setValue] = React.useState<ISODate | undefined>(todayISO());
    const [month, setMonth] = React.useState(todayISO());

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">Selected: {value ?? "None"}</div>
        <Calendar mode="single" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} />
      </div>
    );
  },
};

export const SingleModeUncontrolled: Story = {
  name: "Single Mode - Uncontrolled",
  render: function SingleModeUncontrolledStory() {
    const [value, setValue] = React.useState<ISODate | undefined>(undefined);
    const [month, setMonth] = React.useState(todayISO());

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">Selected: {value ?? "None"}</div>
        <Calendar mode="single" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} />
      </div>
    );
  },
};

export const SingleModeWithToday: Story = {
  name: "Single Mode - With Today Button",
  render: function SingleModeWithTodayStory() {
    const [value, setValue] = React.useState<ISODate | undefined>(todayISO());
    const [month, setMonth] = React.useState(todayISO());

    return <Calendar mode="single" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} showFooter showToday />;
  },
};

export const SingleModeWithActions: Story = {
  name: "Single Mode - With Actions",
  render: function SingleModeWithActionsStory() {
    const [value, setValue] = React.useState<ISODate | undefined>(todayISO());
    const [month, setMonth] = React.useState(todayISO());
    const [log, setLog] = React.useState<string[]>([]);

    return (
      <div className="space-y-3">
        <Calendar
          mode="single"
          value={value}
          onSelect={setValue}
          month={month}
          onMonthChange={setMonth}
          showFooter
          showToday
          onApply={() => setLog((prev) => [...prev, `Applied: ${value ?? "None"}`])}
          onCancel={() => {
            setValue(undefined);
            setLog((prev) => [...prev, "Cancelled"]);
          }}
        />
        {log.length > 0 && (
          <div className="rounded border border-border-normal p-2 text-sm">
            <strong>Action log:</strong>
            <ul className="mt-1 list-inside list-disc">
              {log.map((item, i) => (
                <li key={`${item}-${i}`}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
};

// ============================================================================
// Range Mode
// ============================================================================

export const RangeMode: Story = {
  name: "Range Mode",
  render: function RangeModeStory() {
    const [value, setValue] = React.useState<ISODateRange | undefined>(undefined);
    const [month, setMonth] = React.useState(todayISO());

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">
          Range: {value?.from ?? "None"} to {value?.to ?? "None"}
        </div>
        <Calendar mode="range" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} />
      </div>
    );
  },
};

export const RangeModeWithInitialValue: Story = {
  name: "Range Mode - With Initial Value",
  render: function RangeModeWithInitialValueStory() {
    const [value, setValue] = React.useState<ISODateRange | undefined>({
      from: todayISO(),
      to: addDaysISO(todayISO(), 7),
    });
    const [month, setMonth] = React.useState(todayISO());

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">
          Range: {value?.from ?? "None"} to {value?.to ?? "None"}
        </div>
        <Calendar mode="range" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} />
      </div>
    );
  },
};

export const RangeModeWithActions: Story = {
  name: "Range Mode - With Actions",
  render: function RangeModeWithActionsStory() {
    const [value, setValue] = React.useState<ISODateRange | undefined>(undefined);
    const [month, setMonth] = React.useState(todayISO());
    const [committed, setCommitted] = React.useState<ISODateRange | undefined>(undefined);

    return (
      <div className="space-y-3">
        <div className="text-fg-subtle text-sm">
          <div>
            Current selection: {value?.from ?? "None"} to {value?.to ?? "None"}
          </div>
          <div>
            Committed: {committed?.from ?? "None"} to {committed?.to ?? "None"}
          </div>
        </div>
        <Calendar
          mode="range"
          value={value}
          onSelect={setValue}
          month={month}
          onMonthChange={setMonth}
          showFooter
          onApply={() => setCommitted(value)}
          onCancel={() => {
            setValue(committed);
          }}
        />
      </div>
    );
  },
};

// ============================================================================
// Multiple Mode
// ============================================================================

export const MultipleMode: Story = {
  name: "Multiple Mode",
  render: function MultipleModeStory() {
    const [value, setValue] = React.useState<ISODate[]>([todayISO(), addDaysISO(todayISO(), 3), addDaysISO(todayISO(), 7)]);
    const [month, setMonth] = React.useState(todayISO());

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">Selected: {value.length === 0 ? "None" : value.join(", ")}</div>
        <Calendar mode="multiple" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} />
      </div>
    );
  },
};

export const MultipleModeWithMax: Story = {
  name: "Multiple Mode - With Max Limit",
  render: function MultipleModeWithMaxStory() {
    const [value, setValue] = React.useState<ISODate[]>([]);
    const [month, setMonth] = React.useState(todayISO());
    const max = 5;

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">
          Selected ({value.length}/{max}): {value.length === 0 ? "None" : value.join(", ")}
        </div>
        <Calendar mode="multiple" value={value} onSelect={setValue} max={max} month={month} onMonthChange={setMonth} showFooter showToday />
      </div>
    );
  },
};

// ============================================================================
// Disabled Dates
// ============================================================================

export const DisabledDates: Story = {
  name: "Disabled Dates - Specific",
  render: function DisabledDatesStory() {
    const [value, setValue] = React.useState<ISODate | undefined>(undefined);
    const [month, setMonth] = React.useState(todayISO());

    const disabled = [addDaysISO(todayISO(), 1), addDaysISO(todayISO(), 3), addDaysISO(todayISO(), 5), addDaysISO(todayISO(), 10)];

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">Some specific dates are disabled (1, 3, 5, and 10 days from today)</div>
        <Calendar mode="single" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} disabled={disabled} />
      </div>
    );
  },
};

export const DisabledBefore: Story = {
  name: "Disabled Dates - Before Today",
  render: function DisabledBeforeStory() {
    const [value, setValue] = React.useState<ISODate | undefined>(undefined);
    const [month, setMonth] = React.useState(todayISO());

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">All dates before today are disabled</div>
        <Calendar mode="single" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} disabled={{ before: todayISO() }} />
      </div>
    );
  },
};

export const DisabledAfter: Story = {
  name: "Disabled Dates - After Limit",
  render: function DisabledAfterStory() {
    const [value, setValue] = React.useState<ISODate | undefined>(undefined);
    const [month, setMonth] = React.useState(todayISO());
    const limit = addDaysISO(todayISO(), 14);

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">All dates after 14 days from today are disabled</div>
        <Calendar mode="single" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} disabled={{ after: limit }} />
      </div>
    );
  },
};

export const DisabledRange: Story = {
  name: "Disabled Dates - Range",
  render: function DisabledRangeStory() {
    const [value, setValue] = React.useState<ISODate | undefined>(undefined);
    const [month, setMonth] = React.useState(todayISO());

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">Dates from 5-10 days from today are disabled</div>
        <Calendar
          mode="single"
          value={value}
          onSelect={setValue}
          month={month}
          onMonthChange={setMonth}
          disabled={{ from: addDaysISO(todayISO(), 5), to: addDaysISO(todayISO(), 10) }}
        />
      </div>
    );
  },
};

export const DisabledFunction: Story = {
  name: "Disabled Dates - Function (Weekends)",
  render: function DisabledFunctionStory() {
    const [value, setValue] = React.useState<ISODate | undefined>(undefined);
    const [month, setMonth] = React.useState(todayISO());

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">Weekends are disabled</div>
        <Calendar mode="single" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} disabled={{ dayOfWeek: ["sat", "sun"] }} />
      </div>
    );
  },
};

export const DisabledMultiple: Story = {
  name: "Disabled Dates - Multiple Matchers",
  render: function DisabledMultipleStory() {
    const [value, setValue] = React.useState<ISODate | undefined>(undefined);
    const [month, setMonth] = React.useState(todayISO());

    const disabled: DisabledDatesProp[] = [
      { dayOfWeek: ["sat", "sun"] },
      { before: todayISO() },
      addDaysISO(todayISO(), 15), // Specific date
    ];

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">Weekends, past dates, and 15 days from today are all disabled</div>
        <Calendar mode="single" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} disabled={disabled} />
      </div>
    );
  },
};

// ============================================================================
// Min/Max Dates
// ============================================================================

export const MinMaxDates: Story = {
  name: "Min/Max Dates",
  render: function MinMaxDatesStory() {
    const [value, setValue] = React.useState<ISODate | undefined>(undefined);
    const [month, setMonth] = React.useState(todayISO());
    const minDate = addDaysISO(todayISO(), -7);
    const maxDate = addDaysISO(todayISO(), 30);

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">
          Only dates from {minDate} to {maxDate} are selectable
        </div>
        <Calendar mode="single" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} minDate={minDate} maxDate={maxDate} />
      </div>
    );
  },
};

// ============================================================================
// Presets
// ============================================================================

export const SingleModePresets: Story = {
  name: "Single Mode - With Presets",
  render: function SingleModePresetsStory() {
    const [value, setValue] = React.useState<ISODate | undefined>(undefined);
    const [month, setMonth] = React.useState(todayISO());

    const presets: PresetOption<ISODate>[] = [
      { label: "Today", value: todayISO() },
      { label: "Tomorrow", value: addDaysISO(todayISO(), 1) },
      { label: "In 3 days", value: addDaysISO(todayISO(), 3) },
      { label: "Next week", value: addDaysISO(todayISO(), 7) },
      { label: "Next month", value: addMonthsISO(todayISO(), 1) },
    ];

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">Selected: {value ?? "None"}</div>
        <Calendar mode="single" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} presets={presets} />
      </div>
    );
  },
};

export const RangeModePresets: Story = {
  name: "Range Mode - With Presets",
  render: function RangeModePresetsStory() {
    const [value, setValue] = React.useState<ISODateRange | undefined>(undefined);
    const [month, setMonth] = React.useState(todayISO());

    const presets: PresetOption<ISODateRange>[] = [
      {
        label: "Today",
        value: { from: todayISO(), to: todayISO() },
      },
      {
        label: "This week",
        value: { from: startOfWeekISO(todayISO(), 0), to: endOfWeekISO(todayISO(), 0) },
      },
      {
        label: "Next 7 days",
        value: { from: todayISO(), to: addDaysISO(todayISO(), 6) },
      },
      {
        label: "Next 14 days",
        value: { from: todayISO(), to: addDaysISO(todayISO(), 13) },
      },
      {
        label: "Next 30 days",
        value: { from: todayISO(), to: addDaysISO(todayISO(), 29) },
      },
      {
        label: "Last 7 days",
        value: { from: addDaysISO(todayISO(), -6), to: todayISO() },
      },
    ];

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">
          Range: {value?.from ?? "None"} to {value?.to ?? "None"}
        </div>
        <Calendar mode="range" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} presets={presets} />
      </div>
    );
  },
};

export const MultipleModePresets: Story = {
  name: "Multiple Mode - With Presets",
  render: function MultipleModePresetsStory() {
    const [value, setValue] = React.useState<ISODate[]>([]);
    const [month, setMonth] = React.useState(todayISO());

    const presets: PresetOption<ISODate[]>[] = [
      {
        label: "Next 5 weekdays",
        value: Array.from({ length: 10 }, (_, i) => addDaysISO(todayISO(), i + 1))
          .filter((date) => !isWeekendISO(date))
          .slice(0, 5),
      },
      {
        label: "Next weekend",
        value: Array.from({ length: 10 }, (_, i) => addDaysISO(todayISO(), i + 1))
          .filter(isWeekendISO)
          .slice(0, 2),
      },
      {
        label: "Next 3 days",
        value: [addDaysISO(todayISO(), 1), addDaysISO(todayISO(), 2), addDaysISO(todayISO(), 3)],
      },
    ];

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">
          Selected ({value.length}): {value.length === 0 ? "None" : value.join(", ")}
        </div>
        <Calendar mode="multiple" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} presets={presets} />
      </div>
    );
  },
};

// ============================================================================
// Week Start Configuration
// ============================================================================

export const WeekStartsSunday: Story = {
  name: "Week Starts on Sunday",
  render: function WeekStartsSundayStory() {
    const [value, setValue] = React.useState<ISODate | undefined>(undefined);
    const [month, setMonth] = React.useState(todayISO());

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">Week starts on Sunday (default)</div>
        <Calendar mode="single" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} weekStartsOn={0} />
      </div>
    );
  },
};

export const WeekStartsMonday: Story = {
  name: "Week Starts on Monday",
  render: function WeekStartsMondayStory() {
    const [value, setValue] = React.useState<ISODate | undefined>(undefined);
    const [month, setMonth] = React.useState(todayISO());

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">Week starts on Monday</div>
        <Calendar mode="single" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} weekStartsOn={1} />
      </div>
    );
  },
};

export const WeekStartsSaturday: Story = {
  name: "Week Starts on Saturday",
  render: function WeekStartsSaturdayStory() {
    const [value, setValue] = React.useState<ISODate | undefined>(undefined);
    const [month, setMonth] = React.useState(todayISO());

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">Week starts on Saturday</div>
        <Calendar mode="single" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} weekStartsOn={6} />
      </div>
    );
  },
};

// ============================================================================
// Complex Examples
// ============================================================================

export const RangeModeComplete: Story = {
  name: "Range Mode - Complete Example",
  render: function RangeModeCompleteStory() {
    const [value, setValue] = React.useState<ISODateRange | undefined>({
      from: todayISO(),
      to: addDaysISO(todayISO(), 7),
    });
    const [month, setMonth] = React.useState(todayISO());
    const [committed, setCommitted] = React.useState<ISODateRange | undefined>(value);

    const presets: PresetOption<ISODateRange>[] = [
      { label: "This week", value: { from: startOfWeekISO(todayISO(), 1), to: endOfWeekISO(todayISO(), 1) } },
      { label: "Next 7 days", value: { from: todayISO(), to: addDaysISO(todayISO(), 6) } },
      { label: "Next 14 days", value: { from: todayISO(), to: addDaysISO(todayISO(), 13) } },
      { label: "Next 30 days", value: { from: todayISO(), to: addDaysISO(todayISO(), 29) } },
    ];

    return (
      <div className="space-y-3">
        <div className="space-y-1 text-fg-subtle text-sm">
          <div>
            Current: {value?.from ?? "None"} to {value?.to ?? "None"}
          </div>
          <div>
            Committed: {committed?.from ?? "None"} to {committed?.to ?? "None"}
          </div>
        </div>
        <Calendar
          mode="range"
          value={value}
          onSelect={setValue}
          month={month}
          onMonthChange={setMonth}
          minDate={todayISO()}
          maxDate={addMonthsISO(todayISO(), 3)}
          presets={presets}
          showFooter
          onApply={() => setCommitted(value)}
          onCancel={() => setValue(committed)}
          weekStartsOn={1}
        />
      </div>
    );
  },
};

export const MultipleModeComplete: Story = {
  name: "Multiple Mode - Complete Example",
  render: function MultipleModeCompleteStory() {
    const [value, setValue] = React.useState<ISODate[]>([todayISO(), addDaysISO(todayISO(), 2), addDaysISO(todayISO(), 4)]);
    const [month, setMonth] = React.useState(todayISO());
    const max = 10;

    const presets: PresetOption<ISODate[]>[] = [
      {
        label: "Next 3 weekdays",
        value: Array.from({ length: 20 }, (_, i) => addDaysISO(todayISO(), i + 1))
          .filter((date) => !isWeekendISO(date))
          .slice(0, 3),
      },
      {
        label: "Next 5 weekdays",
        value: Array.from({ length: 20 }, (_, i) => addDaysISO(todayISO(), i + 1))
          .filter((date) => !isWeekendISO(date))
          .slice(0, 5),
      },
    ];

    return (
      <div className="space-y-3">
        <div className="text-fg-subtle text-sm">
          <div>
            Selected ({value.length}/{max}):
          </div>
          <div className="mt-1">{value.length === 0 ? "None" : value.join(", ")}</div>
        </div>
        <Calendar
          mode="multiple"
          value={value}
          onSelect={setValue}
          max={max}
          month={month}
          onMonthChange={setMonth}
          minDate={todayISO()}
          disabled={{ dayOfWeek: ["sat", "sun"] }}
          presets={presets}
          showFooter
          showToday
          onApply={() => alert(`Applied ${value.length} dates`)}
          onCancel={() => setValue([])}
          weekStartsOn={1}
        />
      </div>
    );
  },
};

// ============================================================================
// Edge Cases
// ============================================================================

export const EmptyState: Story = {
  name: "Empty State",
  render: function EmptyStateStory() {
    const [value, setValue] = React.useState<ISODate | undefined>(undefined);
    const [month, setMonth] = React.useState(todayISO());

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">No date selected initially</div>
        <Calendar mode="single" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} showFooter showToday />
      </div>
    );
  },
};

export const AllDatesDisabled: Story = {
  name: "All Dates Disabled",
  render: function AllDatesDisabledStory() {
    const [value, setValue] = React.useState<ISODate | undefined>(undefined);
    const [month, setMonth] = React.useState(todayISO());

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">All dates are disabled (min/max range is zero)</div>
        <Calendar
          mode="single"
          value={value}
          onSelect={setValue}
          month={month}
          onMonthChange={setMonth}
          minDate={todayISO()}
          maxDate={addDaysISO(todayISO(), -1)}
        />
      </div>
    );
  },
};
