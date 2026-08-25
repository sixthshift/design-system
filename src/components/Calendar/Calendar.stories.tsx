import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { endOfWeek, startOfWeek, type Temporal, today } from "../../date-time";
import { Calendar } from "./Calendar";
import type { DateRangeValue, PresetOption } from "./calendar.types";

const meta: Meta<typeof Calendar> = {
  title: "Components/Inputs/Calendar",
  component: Calendar,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Calendar>;

// ============================================================================
// Single Mode - Basic
// ============================================================================

export const SingleMode: Story = {
  name: "Single Mode",
  render: function SingleModeStory() {
    const [value, setValue] = React.useState<Temporal.PlainDate | undefined>(today());
    const [month, setMonth] = React.useState(today());

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">Selected: {value?.toString() ?? "None"}</div>
        <Calendar mode="single" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} />
      </div>
    );
  },
};

export const SingleModeUncontrolled: Story = {
  name: "Single Mode - Uncontrolled",
  render: function SingleModeUncontrolledStory() {
    const [value, setValue] = React.useState<Temporal.PlainDate | undefined>(undefined);
    const [month, setMonth] = React.useState(today());

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">Selected: {value?.toString() ?? "None"}</div>
        <Calendar mode="single" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} />
      </div>
    );
  },
};

export const SingleModeWithToday: Story = {
  name: "Single Mode - With Today Button",
  render: function SingleModeWithTodayStory() {
    const [value, setValue] = React.useState<Temporal.PlainDate | undefined>(today());
    const [month, setMonth] = React.useState(today());

    return <Calendar mode="single" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} showFooter showToday />;
  },
};

export const SingleModeWithActions: Story = {
  name: "Single Mode - With Actions",
  render: function SingleModeWithActionsStory() {
    const [value, setValue] = React.useState<Temporal.PlainDate | undefined>(today());
    const [month, setMonth] = React.useState(today());
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
          onApply={() => setLog((prev) => [...prev, `Applied: ${value?.toString() ?? "None"}`])}
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
    const [value, setValue] = React.useState<DateRangeValue | undefined>(undefined);
    const [month, setMonth] = React.useState(today());

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">
          Range: {value?.from?.toString() ?? "None"} to {value?.to?.toString() ?? "None"}
        </div>
        <Calendar mode="range" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} />
      </div>
    );
  },
};

export const RangeModeWithInitialValue: Story = {
  name: "Range Mode - With Initial Value",
  render: function RangeModeWithInitialValueStory() {
    const [value, setValue] = React.useState<DateRangeValue | undefined>({
      from: today(),
      to: today().add({ days: 7 }),
    });
    const [month, setMonth] = React.useState(today());

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">
          Range: {value?.from?.toString() ?? "None"} to {value?.to?.toString() ?? "None"}
        </div>
        <Calendar mode="range" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} />
      </div>
    );
  },
};

export const RangeModeWithActions: Story = {
  name: "Range Mode - With Actions",
  render: function RangeModeWithActionsStory() {
    const [value, setValue] = React.useState<DateRangeValue | undefined>(undefined);
    const [month, setMonth] = React.useState(today());
    const [committed, setCommitted] = React.useState<DateRangeValue | undefined>(undefined);

    return (
      <div className="space-y-3">
        <div className="text-fg-subtle text-sm">
          <div>
            Current selection: {value?.from?.toString() ?? "None"} to {value?.to?.toString() ?? "None"}
          </div>
          <div>
            Committed: {committed?.from?.toString() ?? "None"} to {committed?.to?.toString() ?? "None"}
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
    const [value, setValue] = React.useState<Temporal.PlainDate[]>([today(), today().add({ days: 3 }), today().add({ days: 7 })]);
    const [month, setMonth] = React.useState(today());

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">Selected: {value.length === 0 ? "None" : value.map((d) => d.toString()).join(", ")}</div>
        <Calendar mode="multiple" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} />
      </div>
    );
  },
};

export const MultipleModeWithMax: Story = {
  name: "Multiple Mode - With Max Limit",
  render: function MultipleModeWithMaxStory() {
    const [value, setValue] = React.useState<Temporal.PlainDate[]>([]);
    const [month, setMonth] = React.useState(today());
    const max = 5;

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">
          Selected ({value.length}/{max}): {value.length === 0 ? "None" : value.map((d) => d.toString()).join(", ")}
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
    const [value, setValue] = React.useState<Temporal.PlainDate | undefined>(undefined);
    const [month, setMonth] = React.useState(today());

    const disabled = [today().add({ days: 1 }), today().add({ days: 3 }), today().add({ days: 5 }), today().add({ days: 10 })];

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
    const [value, setValue] = React.useState<Temporal.PlainDate | undefined>(undefined);
    const [month, setMonth] = React.useState(today());

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">All dates before today are disabled</div>
        <Calendar mode="single" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} disabled={{ before: today() }} />
      </div>
    );
  },
};

export const DisabledAfter: Story = {
  name: "Disabled Dates - After Limit",
  render: function DisabledAfterStory() {
    const [value, setValue] = React.useState<Temporal.PlainDate | undefined>(undefined);
    const [month, setMonth] = React.useState(today());
    const limit = today().add({ days: 14 });

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
    const [value, setValue] = React.useState<Temporal.PlainDate | undefined>(undefined);
    const [month, setMonth] = React.useState(today());

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">Dates from 5-10 days from today are disabled</div>
        <Calendar
          mode="single"
          value={value}
          onSelect={setValue}
          month={month}
          onMonthChange={setMonth}
          disabled={{ from: today().add({ days: 5 }), to: today().add({ days: 10 }) }}
        />
      </div>
    );
  },
};

export const DisabledFunction: Story = {
  name: "Disabled Dates - Function (Weekends)",
  render: function DisabledFunctionStory() {
    const [value, setValue] = React.useState<Temporal.PlainDate | undefined>(undefined);
    const [month, setMonth] = React.useState(today());

    const isWeekend = (date: Temporal.PlainDate) => {
      const dayOfWeek = date.dayOfWeek;
      return dayOfWeek === 6 || dayOfWeek === 7; // Saturday or Sunday
    };

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">Weekends are disabled</div>
        <Calendar mode="single" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} disabled={isWeekend} />
      </div>
    );
  },
};

export const DisabledMultiple: Story = {
  name: "Disabled Dates - Multiple Matchers",
  render: function DisabledMultipleStory() {
    const [value, setValue] = React.useState<Temporal.PlainDate | undefined>(undefined);
    const [month, setMonth] = React.useState(today());

    const isWeekend = (date: Temporal.PlainDate) => {
      const dayOfWeek = date.dayOfWeek;
      return dayOfWeek === 6 || dayOfWeek === 7;
    };

    const disabled = [
      isWeekend,
      { before: today() },
      today().add({ days: 15 }), // Specific date
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
    const [value, setValue] = React.useState<Temporal.PlainDate | undefined>(undefined);
    const [month, setMonth] = React.useState(today());
    const minDate = today().subtract({ days: 7 });
    const maxDate = today().add({ days: 30 });

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">
          Only dates from {minDate.toString()} to {maxDate.toString()} are selectable
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
    const [value, setValue] = React.useState<Temporal.PlainDate | undefined>(undefined);
    const [month, setMonth] = React.useState(today());

    const presets: PresetOption<Temporal.PlainDate>[] = [
      { label: "Today", value: today() },
      { label: "Tomorrow", value: today().add({ days: 1 }) },
      { label: "In 3 days", value: today().add({ days: 3 }) },
      { label: "Next week", value: today().add({ weeks: 1 }) },
      { label: "Next month", value: today().add({ months: 1 }) },
    ];

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">Selected: {value?.toString() ?? "None"}</div>
        <Calendar mode="single" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} presets={presets} />
      </div>
    );
  },
};

export const RangeModePresets: Story = {
  name: "Range Mode - With Presets",
  render: function RangeModePresetsStory() {
    const [value, setValue] = React.useState<DateRangeValue | undefined>(undefined);
    const [month, setMonth] = React.useState(today());

    const presets: PresetOption<DateRangeValue>[] = [
      {
        label: "Today",
        value: { from: today(), to: today() },
      },
      {
        label: "This week",
        value: { from: startOfWeek(today(), 0), to: endOfWeek(today(), 0) },
      },
      {
        label: "Next 7 days",
        value: { from: today(), to: today().add({ days: 6 }) },
      },
      {
        label: "Next 14 days",
        value: { from: today(), to: today().add({ days: 13 }) },
      },
      {
        label: "Next 30 days",
        value: { from: today(), to: today().add({ days: 29 }) },
      },
      {
        label: "Last 7 days",
        value: { from: today().subtract({ days: 6 }), to: today() },
      },
    ];

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">
          Range: {value?.from?.toString() ?? "None"} to {value?.to?.toString() ?? "None"}
        </div>
        <Calendar mode="range" value={value} onSelect={setValue} month={month} onMonthChange={setMonth} presets={presets} />
      </div>
    );
  },
};

export const MultipleModePresets: Story = {
  name: "Multiple Mode - With Presets",
  render: function MultipleModePresetsStory() {
    const [value, setValue] = React.useState<Temporal.PlainDate[]>([]);
    const [month, setMonth] = React.useState(today());

    const isWeekday = (date: Temporal.PlainDate) => {
      const dayOfWeek = date.dayOfWeek;
      return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday through Friday
    };

    const presets: PresetOption<Temporal.PlainDate[]>[] = [
      {
        label: "Next 5 weekdays",
        value: Array.from({ length: 10 }, (_, i) => today().add({ days: i + 1 }))
          .filter(isWeekday)
          .slice(0, 5),
      },
      {
        label: "Next weekend",
        value: Array.from({ length: 10 }, (_, i) => today().add({ days: i + 1 }))
          .filter((d) => d.dayOfWeek === 6 || d.dayOfWeek === 7)
          .slice(0, 2),
      },
      {
        label: "Next 3 days",
        value: [today().add({ days: 1 }), today().add({ days: 2 }), today().add({ days: 3 })],
      },
    ];

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">
          Selected ({value.length}): {value.length === 0 ? "None" : value.map((d) => d.toString()).join(", ")}
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
    const [value, setValue] = React.useState<Temporal.PlainDate | undefined>(undefined);
    const [month, setMonth] = React.useState(today());

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
    const [value, setValue] = React.useState<Temporal.PlainDate | undefined>(undefined);
    const [month, setMonth] = React.useState(today());

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
    const [value, setValue] = React.useState<Temporal.PlainDate | undefined>(undefined);
    const [month, setMonth] = React.useState(today());

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
    const [value, setValue] = React.useState<DateRangeValue | undefined>({
      from: today(),
      to: today().add({ days: 7 }),
    });
    const [month, setMonth] = React.useState(today());
    const [committed, setCommitted] = React.useState<DateRangeValue | undefined>(value);

    const presets: PresetOption<DateRangeValue>[] = [
      { label: "This week", value: { from: startOfWeek(today(), 1), to: endOfWeek(today(), 1) } },
      { label: "Next 7 days", value: { from: today(), to: today().add({ days: 6 }) } },
      { label: "Next 14 days", value: { from: today(), to: today().add({ days: 13 }) } },
      { label: "Next 30 days", value: { from: today(), to: today().add({ days: 29 }) } },
    ];

    return (
      <div className="space-y-3">
        <div className="space-y-1 text-fg-subtle text-sm">
          <div>
            Current: {value?.from?.toString() ?? "None"} to {value?.to?.toString() ?? "None"}
          </div>
          <div>
            Committed: {committed?.from?.toString() ?? "None"} to {committed?.to?.toString() ?? "None"}
          </div>
        </div>
        <Calendar
          mode="range"
          value={value}
          onSelect={setValue}
          month={month}
          onMonthChange={setMonth}
          minDate={today()}
          maxDate={today().add({ months: 3 })}
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
    const [value, setValue] = React.useState<Temporal.PlainDate[]>([today(), today().add({ days: 2 }), today().add({ days: 4 })]);
    const [month, setMonth] = React.useState(today());
    const max = 10;

    const isWeekend = (date: Temporal.PlainDate) => {
      const dayOfWeek = date.dayOfWeek;
      return dayOfWeek === 6 || dayOfWeek === 7;
    };

    const presets: PresetOption<Temporal.PlainDate[]>[] = [
      {
        label: "Next 3 weekdays",
        value: Array.from({ length: 20 }, (_, i) => today().add({ days: i + 1 }))
          .filter((d) => !isWeekend(d))
          .slice(0, 3),
      },
      {
        label: "Next 5 weekdays",
        value: Array.from({ length: 20 }, (_, i) => today().add({ days: i + 1 }))
          .filter((d) => !isWeekend(d))
          .slice(0, 5),
      },
    ];

    return (
      <div className="space-y-3">
        <div className="text-fg-subtle text-sm">
          <div>
            Selected ({value.length}/{max}):
          </div>
          <div className="mt-1">{value.length === 0 ? "None" : value.map((d) => d.toString()).join(", ")}</div>
        </div>
        <Calendar
          mode="multiple"
          value={value}
          onSelect={setValue}
          max={max}
          month={month}
          onMonthChange={setMonth}
          minDate={today()}
          disabled={isWeekend}
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
    const [value, setValue] = React.useState<Temporal.PlainDate | undefined>(undefined);
    const [month, setMonth] = React.useState(today());

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
    const [value, setValue] = React.useState<Temporal.PlainDate | undefined>(undefined);
    const [month, setMonth] = React.useState(today());

    return (
      <div className="space-y-2">
        <div className="text-fg-subtle text-sm">All dates are disabled (min/max range is zero)</div>
        <Calendar
          mode="single"
          value={value}
          onSelect={setValue}
          month={month}
          onMonthChange={setMonth}
          minDate={today()}
          maxDate={today().subtract({ days: 1 })}
        />
      </div>
    );
  },
};
