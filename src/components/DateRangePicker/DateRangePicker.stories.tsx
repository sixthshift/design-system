import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  addDaysISO,
  addMonthsISO,
  endOfYearISO,
  fromISODate,
  type ISODateRange,
  startOfMonthISO,
  startOfWeekISO,
  startOfYearISO,
  todayISO,
  toISODate,
} from "../../date-time";
import { DateRangePicker } from "./DateRangePicker";

const meta: Meta<typeof DateRangePicker> = {
  title: "Components/DateRangePicker",
  component: DateRangePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: { subtitle: "DatePicker in range mode, with common range presets" },
  },
};

export default meta;
type Story = StoryObj<typeof DateRangePicker>;

// =============================================================================
// Basic Stories
// =============================================================================

/**
 * Type either end — they are two independent fields sharing one calendar.
 *
 * `152026` in the start field is January 5th 2026; the end field is typed the
 * same way, and each has its own clear button. The popover opens under whichever
 * half you are in.
 */
export const TypeOrPick: Story = {
  render: function TypeOrPickStory() {
    const [observed, setObserved] = useState<ISODateRange | undefined>();

    return (
      <div className="flex flex-col gap-4">
        <DateRangePicker onChange={setObserved} />
        <div className="text-fg-subtle text-sm">
          Value: {observed?.from ?? "—"} → {observed?.to ?? "—"}
        </div>
      </div>
    );
  },
};

export const Default: Story = {
  render: () => <DateRangePicker />,
};

export const WithDefaultValue: Story = {
  render: () => {
    const from = "2025-01-10";
    const to = "2025-01-20";
    return <DateRangePicker defaultValue={{ from, to }} />;
  },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState<ISODateRange>({
      from: "2025-01-10",
      to: "2025-01-20",
    });

    return (
      <div className="flex flex-col gap-4">
        <DateRangePicker value={value} onChange={(v) => setValue(v ?? { from: undefined, to: undefined })} />
        <div className="text-fg-subtle text-sm">
          Selected: {value?.from ?? "none"} – {value?.to ?? "none"}
        </div>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => <DateRangePicker isDisabled />,
};

export const Invalid: Story = {
  render: () => <DateRangePicker isInvalid />,
};

export const NotClearable: Story = {
  render: () => {
    const from = "2025-01-10";
    const to = "2025-01-20";
    return <DateRangePicker defaultValue={{ from, to }} clearable={false} />;
  },
};

// =============================================================================
// Preset Stories
// =============================================================================

export const WithDefaultPresets: Story = {
  render: () => <DateRangePicker />,
};

export const WithCustomPresets: Story = {
  render: function WithCustomPresetsStory() {
    const customPresets = [
      {
        label: "Next 7 days",
        value: () => {
          const today = todayISO();
          const nextWeek = addDaysISO(today, 7);
          return { from: today, to: nextWeek };
        },
      },
      {
        label: "Next 30 days",
        value: () => {
          const today = todayISO();
          const nextMonth = addDaysISO(today, 30);
          return { from: today, to: nextMonth };
        },
      },
      {
        label: "This quarter",
        value: () => {
          // Quarter boundaries are past what the ISO helpers cover, so this
          // reaches for the date engine directly — the documented escape hatch
          // for arithmetic the ISO surface intentionally does not carry.
          const today = fromISODate(todayISO());
          const quarterStartMonth = Math.floor((today.month - 1) / 3) * 3 + 1;
          const quarterStart = toISODate(today.with({ month: quarterStartMonth, day: 1 }));
          const quarterEnd = addDaysISO(addMonthsISO(quarterStart, 3), -1);
          return { from: quarterStart, to: quarterEnd };
        },
      },
      {
        label: "This year",
        value: () => {
          const today = todayISO();
          const yearStart = startOfYearISO(today);
          const yearEnd = endOfYearISO(today);
          return { from: yearStart, to: yearEnd };
        },
      },
    ];

    return <DateRangePicker presets={customPresets} />;
  },
};

export const WithoutPresets: Story = {
  render: () => <DateRangePicker showPresets={false} />,
};

// =============================================================================
// Constraint Stories
// =============================================================================

export const WithMinMaxDates: Story = {
  render: () => {
    const today = todayISO();
    const minDate = addDaysISO(today, -7);
    const maxDate = addDaysISO(today, 30);

    return <DateRangePicker minDate={minDate} maxDate={maxDate} />;
  },
};

export const WithDisabledWeekends: Story = {
  render: () => <DateRangePicker disabled={{ dayOfWeek: ["sat", "sun"] }} />,
};

export const PastDatesOnly: Story = {
  render: () => {
    const today = todayISO();
    return <DateRangePicker maxDate={today} />;
  },
};

export const FutureDatesOnly: Story = {
  render: () => {
    const today = todayISO();
    return <DateRangePicker minDate={today} />;
  },
};

// =============================================================================
// Form Integration Stories
// =============================================================================

export const InForm: Story = {
  render: function InFormStory() {
    const [submitted, setSubmitted] = useState<{ from: string | null; to: string | null } | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      setSubmitted({
        from: formData.get("dateRange.from") as string | null,
        to: formData.get("dateRange.to") as string | null,
      });
    };

    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="dateRange" className="font-medium text-sm">
            Event Date Range
          </label>
          <DateRangePicker
            name="dateRange"
            defaultValue={{
              from: "2025-01-10",
              to: "2025-01-20",
            }}
          />
        </div>
        <button type="submit" className="rounded-md bg-bg-brand px-4 py-2 font-medium text-fg-on-brand text-sm">
          Submit
        </button>
        {submitted && (
          <div className="text-fg-subtle text-sm">
            Submitted values:
            <br />
            From: {submitted.from ?? "none"}
            <br />
            To: {submitted.to ?? "none"}
          </div>
        )}
      </form>
    );
  },
};

// =============================================================================
// Configuration Stories
// =============================================================================

export const MondayStart: Story = {
  render: () => <DateRangePicker weekStartsOn={1} />,
};

export const AlignStart: Story = {
  render: () => <DateRangePicker align="start" />,
};

export const CustomPlaceholder: Story = {
  render: () => <DateRangePicker />,
};

// =============================================================================
// Use Case Stories
// =============================================================================

export const ActivityLogFilter: Story = {
  render: function ActivityLogFilterStory() {
    const [value, setValue] = useState<ISODateRange>({
      from: addDaysISO(todayISO(), -7),
      to: todayISO(),
    });

    return (
      <div className="flex flex-col gap-4">
        <div className="font-medium text-sm">Filter Activity Log</div>
        <DateRangePicker value={value} onChange={(v) => setValue(v ?? { from: undefined, to: undefined })} />
        <div className="text-fg-subtle text-sm">
          Showing activity from {value?.from ?? "..."} to {value?.to ?? "..."}
        </div>
      </div>
    );
  },
};

export const ReportDateRange: Story = {
  render: function ReportDateRangeStory() {
    const [value, setValue] = useState<ISODateRange>({
      from: startOfMonthISO(todayISO()),
      to: todayISO(),
    });

    const customPresets = [
      {
        label: "This week",
        value: () => {
          const today = todayISO();
          const weekStart = startOfWeekISO(today, 0);
          return { from: weekStart, to: today };
        },
      },
      {
        label: "This month",
        value: () => {
          const today = todayISO();
          const monthStart = startOfMonthISO(today);
          return { from: monthStart, to: today };
        },
      },
      {
        label: "Last month",
        value: () => {
          const today = todayISO();
          const lastMonthStart = startOfMonthISO(addMonthsISO(today, -1));
          const lastMonthEnd = addDaysISO(startOfMonthISO(today), -1);
          return { from: lastMonthStart, to: lastMonthEnd };
        },
      },
      {
        label: "Last 3 months",
        value: () => {
          const today = todayISO();
          const threeMonthsAgo = addMonthsISO(today, -3);
          return { from: threeMonthsAgo, to: today };
        },
      },
    ];

    return (
      <div className="flex flex-col gap-4">
        <div className="font-medium text-sm">Generate Report</div>
        <DateRangePicker value={value} onChange={(v) => setValue(v ?? { from: undefined, to: undefined })} presets={customPresets} />
        <button type="button" className="rounded-md bg-bg-brand px-4 py-2 font-medium text-fg-on-brand text-sm">
          Generate Report
        </button>
      </div>
    );
  },
};

export const BookingDateRange: Story = {
  render: function BookingDateRangeStory() {
    const today = todayISO();
    const maxDate = addMonthsISO(today, 6); // Can only book 6 months ahead

    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-medium text-sm">Accommodation Booking</div>
          <div className="text-fg-subtle text-xs">Select check-in and check-out dates</div>
        </div>
        <DateRangePicker minDate={today} maxDate={maxDate} showPresets={false} />
        <div className="text-fg-subtle text-xs">Bookings available up to 6 months in advance</div>
      </div>
    );
  },
};
