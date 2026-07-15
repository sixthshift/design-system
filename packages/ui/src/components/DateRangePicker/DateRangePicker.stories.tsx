import { Temporal } from "@sixthshift/temporal";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DateRangePicker } from "./DateRangePicker";
import type { DateRangeValue } from "./daterangepicker.types";

const meta: Meta<typeof DateRangePicker> = {
  title: "Components/Inputs/DateRangePicker",
  component: DateRangePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof DateRangePicker>;

// =============================================================================
// Basic Stories
// =============================================================================

export const Default: Story = {
  render: () => <DateRangePicker placeholder="Select date range..." />,
};

export const WithDefaultValue: Story = {
  render: () => {
    const from = Temporal.PlainDate.from("2025-01-10");
    const to = Temporal.PlainDate.from("2025-01-20");
    return <DateRangePicker defaultValue={{ from, to }} />;
  },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState<DateRangeValue>({
      from: Temporal.PlainDate.from("2025-01-10"),
      to: Temporal.PlainDate.from("2025-01-20"),
    });

    return (
      <div className="flex flex-col gap-4">
        <DateRangePicker value={value} onChange={(v) => setValue(v ?? { from: undefined, to: undefined })} />
        <div className="text-fg-subtle text-sm">
          Selected: {value?.from?.toString() ?? "none"} – {value?.to?.toString() ?? "none"}
        </div>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => <DateRangePicker isDisabled placeholder="Disabled" />,
};

export const Invalid: Story = {
  render: () => <DateRangePicker isInvalid placeholder="Invalid state" />,
};

export const NotClearable: Story = {
  render: () => {
    const from = Temporal.PlainDate.from("2025-01-10");
    const to = Temporal.PlainDate.from("2025-01-20");
    return <DateRangePicker defaultValue={{ from, to }} clearable={false} />;
  },
};

// =============================================================================
// Preset Stories
// =============================================================================

export const WithDefaultPresets: Story = {
  render: () => <DateRangePicker placeholder="Select date range (with default presets)" />,
};

export const WithCustomPresets: Story = {
  render: function WithCustomPresetsStory() {
    const customPresets = [
      {
        label: "Next 7 days",
        value: () => {
          const today = Temporal.Now.plainDateISO();
          const nextWeek = today.add({ days: 7 });
          return { from: today, to: nextWeek };
        },
      },
      {
        label: "Next 30 days",
        value: () => {
          const today = Temporal.Now.plainDateISO();
          const nextMonth = today.add({ days: 30 });
          return { from: today, to: nextMonth };
        },
      },
      {
        label: "This quarter",
        value: () => {
          const today = Temporal.Now.plainDateISO();
          const month = today.month;
          const quarterStartMonth = Math.floor((month - 1) / 3) * 3 + 1;
          const quarterStart = today.with({ month: quarterStartMonth, day: 1 });
          const quarterEnd = quarterStart.add({ months: 3 }).subtract({ days: 1 });
          return { from: quarterStart, to: quarterEnd };
        },
      },
      {
        label: "This year",
        value: () => {
          const today = Temporal.Now.plainDateISO();
          const yearStart = today.with({ month: 1, day: 1 });
          const yearEnd = today.with({ month: 12, day: 31 });
          return { from: yearStart, to: yearEnd };
        },
      },
    ];

    return <DateRangePicker presets={customPresets} placeholder="Select date range (custom presets)" />;
  },
};

export const WithoutPresets: Story = {
  render: () => <DateRangePicker showPresets={false} placeholder="No preset sidebar" />,
};

// =============================================================================
// Constraint Stories
// =============================================================================

export const WithMinMaxDates: Story = {
  render: () => {
    const today = Temporal.Now.plainDateISO();
    const minDate = today.subtract({ days: 7 });
    const maxDate = today.add({ days: 30 });

    return <DateRangePicker minDate={minDate} maxDate={maxDate} placeholder="Limited to past 7 days and next 30 days" />;
  },
};

export const WithDisabledWeekends: Story = {
  render: () => <DateRangePicker disabled={(date) => date.dayOfWeek === 6 || date.dayOfWeek === 7} placeholder="Weekdays only" />,
};

export const PastDatesOnly: Story = {
  render: () => {
    const today = Temporal.Now.plainDateISO();
    return <DateRangePicker maxDate={today} placeholder="Past dates only" />;
  },
};

export const FutureDatesOnly: Story = {
  render: () => {
    const today = Temporal.Now.plainDateISO();
    return <DateRangePicker minDate={today} placeholder="Future dates only" />;
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
              from: Temporal.PlainDate.from("2025-01-10"),
              to: Temporal.PlainDate.from("2025-01-20"),
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
  render: () => <DateRangePicker weekStartsOn={1} placeholder="Week starts Monday" />,
};

export const AlignStart: Story = {
  render: () => <DateRangePicker align="start" placeholder="Popup aligns to start" />,
};

export const CustomPlaceholder: Story = {
  render: () => <DateRangePicker placeholder="When should the event run?" />,
};

// =============================================================================
// Use Case Stories
// =============================================================================

export const ActivityLogFilter: Story = {
  render: function ActivityLogFilterStory() {
    const [value, setValue] = useState<DateRangeValue>({
      from: Temporal.Now.plainDateISO().subtract({ days: 7 }),
      to: Temporal.Now.plainDateISO(),
    });

    return (
      <div className="flex flex-col gap-4">
        <div className="font-medium text-sm">Filter Activity Log</div>
        <DateRangePicker value={value} onChange={(v) => setValue(v ?? { from: undefined, to: undefined })} placeholder="Filter by date..." />
        <div className="text-fg-subtle text-sm">
          Showing activity from {value?.from?.toString() ?? "..."} to {value?.to?.toString() ?? "..."}
        </div>
      </div>
    );
  },
};

export const ReportDateRange: Story = {
  render: function ReportDateRangeStory() {
    const [value, setValue] = useState<DateRangeValue>({
      from: Temporal.Now.plainDateISO().with({ day: 1 }),
      to: Temporal.Now.plainDateISO(),
    });

    const customPresets = [
      {
        label: "This week",
        value: () => {
          const today = Temporal.Now.plainDateISO();
          const weekStart = today.subtract({ days: today.dayOfWeek });
          return { from: weekStart, to: today };
        },
      },
      {
        label: "This month",
        value: () => {
          const today = Temporal.Now.plainDateISO();
          const monthStart = today.with({ day: 1 });
          return { from: monthStart, to: today };
        },
      },
      {
        label: "Last month",
        value: () => {
          const today = Temporal.Now.plainDateISO();
          const lastMonthStart = today.subtract({ months: 1 }).with({ day: 1 });
          const lastMonthEnd = today.with({ day: 1 }).subtract({ days: 1 });
          return { from: lastMonthStart, to: lastMonthEnd };
        },
      },
      {
        label: "Last 3 months",
        value: () => {
          const today = Temporal.Now.plainDateISO();
          const threeMonthsAgo = today.subtract({ months: 3 });
          return { from: threeMonthsAgo, to: today };
        },
      },
    ];

    return (
      <div className="flex flex-col gap-4">
        <div className="font-medium text-sm">Generate Report</div>
        <DateRangePicker
          value={value}
          onChange={(v) => setValue(v ?? { from: undefined, to: undefined })}
          presets={customPresets}
          placeholder="Select report period..."
        />
        <button type="button" className="rounded-md bg-bg-brand px-4 py-2 font-medium text-fg-on-brand text-sm">
          Generate Report
        </button>
      </div>
    );
  },
};

export const BookingDateRange: Story = {
  render: function BookingDateRangeStory() {
    const today = Temporal.Now.plainDateISO();
    const maxDate = today.add({ months: 6 }); // Can only book 6 months ahead

    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-medium text-sm">Accommodation Booking</div>
          <div className="text-fg-subtle text-xs">Select check-in and check-out dates</div>
        </div>
        <DateRangePicker minDate={today} maxDate={maxDate} showPresets={false} placeholder="Check-in → Check-out" />
        <div className="text-fg-subtle text-xs">Bookings available up to 6 months in advance</div>
      </div>
    );
  },
};
