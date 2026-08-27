import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { addDaysISO, addHoursISO, fromISOInstant, type ISOInstantRange, nowISO, Temporal, todayISO, toISOInstant } from "../../date-time";
import { DateTimeRangePicker } from "./DateTimeRangePicker";

const meta: Meta<typeof DateTimeRangePicker> = {
  title: "Components/Inputs/DateTimeRangePicker",
  component: DateTimeRangePicker,
  tags: ["autodocs"],
  parameters: {
    // Published as `./datetime-range-picker`, which kebab-casing the component name does not produce.
    importPath: "datetime-range-picker",
    layout: "centered",
    docs: { subtitle: "Range calendar with separate start and end time columns" },
  },
};

export default meta;
type Story = StoryObj<typeof DateTimeRangePicker>;

// =============================================================================
// Basic Stories
// =============================================================================

export const Default: Story = {
  render: () => <DateTimeRangePicker placeholder="Select datetime range..." />,
};

export const WithDefaultValue: Story = {
  render: () => {
    const from = "2025-01-15T14:30:00Z";
    const to = "2025-01-20T16:45:00Z";
    return <DateTimeRangePicker defaultValue={{ from, to }} />;
  },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState<ISOInstantRange | undefined>({
      from: "2025-01-15T14:30:00Z",
      to: "2025-01-20T16:45:00Z",
    });

    return (
      <div className="flex flex-col gap-4">
        <DateTimeRangePicker value={value} onChange={setValue} />
        <div className="text-fg-subtle text-sm">
          From: {value?.from ?? "none"}
          <br />
          To: {value?.to ?? "none"}
        </div>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => <DateTimeRangePicker isDisabled placeholder="Disabled" />,
};

export const Invalid: Story = {
  render: () => <DateTimeRangePicker isInvalid placeholder="Invalid state" />,
};

export const NotClearable: Story = {
  render: () => {
    const from = "2025-01-15T14:30:00Z";
    const to = "2025-01-20T16:45:00Z";
    return <DateTimeRangePicker defaultValue={{ from, to }} clearable={false} />;
  },
};

// =============================================================================
// Time Format Stories
// =============================================================================

export const Format12Hour: Story = {
  render: () => {
    const from = "2025-01-15T14:30:00Z";
    const to = "2025-01-20T16:45:00Z";
    return <DateTimeRangePicker defaultValue={{ from, to }} clockFormat="12h" placeholder="12-hour format (with AM/PM)" />;
  },
};

export const Format24Hour: Story = {
  render: () => {
    const from = "2025-01-15T14:30:00Z";
    const to = "2025-01-20T16:45:00Z";
    return <DateTimeRangePicker defaultValue={{ from, to }} clockFormat="24h" placeholder="24-hour format" />;
  },
};

export const WithSeconds: Story = {
  render: () => {
    const from = "2025-01-15T14:30:45Z";
    const to = "2025-01-20T16:45:30Z";
    return <DateTimeRangePicker defaultValue={{ from, to }} showSeconds placeholder="With seconds column" />;
  },
};

export const WithSeconds24Hour: Story = {
  render: () => {
    const from = "2025-01-15T14:30:45Z";
    const to = "2025-01-20T16:45:30Z";
    return <DateTimeRangePicker defaultValue={{ from, to }} clockFormat="24h" showSeconds placeholder="24h with seconds" />;
  },
};

export const MinuteStep15: Story = {
  render: () => <DateTimeRangePicker minuteStep={15} placeholder="15-minute intervals (00, 15, 30, 45)" />,
};

export const MinuteStep30: Story = {
  render: () => <DateTimeRangePicker minuteStep={30} placeholder="30-minute intervals (00, 30)" />,
};

// =============================================================================
// Constraint Stories
// =============================================================================

export const WithMinMaxDate: Story = {
  render: () => {
    const today = todayISO();
    const minDate = addDaysISO(today, -7);
    const maxDate = addDaysISO(today, 30);

    return <DateTimeRangePicker minDate={minDate} maxDate={maxDate} placeholder="Limited to past 7 days and next 30 days" />;
  },
};

export const WithMinMaxTime: Story = {
  render: () => {
    const minTime = "09:00:00";
    const maxTime = "17:00:00";

    return <DateTimeRangePicker minTime={minTime} maxTime={maxTime} placeholder="Business hours only (9 AM - 5 PM)" />;
  },
};

export const WithDisabledWeekends: Story = {
  render: () => <DateTimeRangePicker disabledDates={{ dayOfWeek: ["sat", "sun"] }} placeholder="Weekdays only" />,
};

export const FutureDatesOnly: Story = {
  render: () => {
    const today = todayISO();
    return <DateTimeRangePicker minDate={today} placeholder="Future dates only" />;
  },
};

export const BusinessHoursWeekdaysOnly: Story = {
  render: () => {
    const minTime = "09:00:00";
    const maxTime = "17:00:00";
    const isWeekend = { dayOfWeek: ["sat", "sun"] } as const;

    return <DateTimeRangePicker minTime={minTime} maxTime={maxTime} disabledDates={isWeekend} minuteStep={30} placeholder="Business hours, weekdays only" />;
  },
};

// =============================================================================
// Preset Stories
// =============================================================================

export const WithDefaultPresets: Story = {
  render: () => <DateTimeRangePicker placeholder="Click to see default presets" />,
};

export const WithCustomPresets: Story = {
  render: () => {
    const customPresets = [
      {
        label: "Next 24 hours",
        value: () => {
          const now = nowISO();
          const tomorrow = addHoursISO(now, 24);
          return { from: now, to: tomorrow };
        },
      },
      {
        label: "This week",
        value: () => {
          // Week-start-in-local-timezone needs zoned arithmetic, so this one
          // reaches for the engine and serialises on the way back out.
          const now = fromISOInstant(nowISO());
          const tz = Temporal.Now.timeZoneId();
          const plainDate = now.toZonedDateTimeISO(tz).toPlainDate();
          const startOfWeek = plainDate
            .subtract({ days: plainDate.dayOfWeek })
            .toPlainDateTime(Temporal.PlainTime.from("00:00:00"))
            .toZonedDateTime(tz)
            .toInstant();
          return { from: toISOInstant(startOfWeek), to: toISOInstant(now) };
        },
      },
      {
        label: "Last 90 days",
        value: () => {
          const now = nowISO();
          const ninetyDaysAgo = addHoursISO(now, -(90 * 24));
          return { from: ninetyDaysAgo, to: now };
        },
      },
    ];

    return <DateTimeRangePicker presets={customPresets} placeholder="Custom presets" />;
  },
};

export const WithoutPresets: Story = {
  render: () => <DateTimeRangePicker showPresets={false} placeholder="No presets sidebar" />,
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
        from: formData.get("eventRangeFrom") as string,
        to: formData.get("eventRangeTo") as string,
      });
    };

    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="eventRange" className="font-medium text-sm">
            Event Date & Time Range
          </label>
          <DateTimeRangePicker
            name="eventRange"
            defaultValue={{
              from: "2025-01-15T14:30:00Z",
              to: "2025-01-20T16:45:00Z",
            }}
          />
        </div>
        <button type="submit" className="rounded-md bg-bg-brand px-4 py-2 font-medium text-fg-on-brand text-sm">
          Submit
        </button>
        {submitted && (
          <div className="text-fg-subtle text-sm">
            Submitted from: {submitted.from}
            <br />
            Submitted to: {submitted.to}
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
  render: () => <DateTimeRangePicker weekStartsOn={1} placeholder="Week starts Monday" />,
};

export const AlignStart: Story = {
  render: () => <DateTimeRangePicker align="start" placeholder="Popup aligns to start" />,
};

export const CustomPlaceholder: Story = {
  render: () => <DateTimeRangePicker placeholder="When should the event run?" />,
};

// =============================================================================
// Use Case Stories
// =============================================================================

export const ActivityLogFilter: Story = {
  render: function ActivityLogFilterStory() {
    const [value, setValue] = useState<ISOInstantRange | undefined>(undefined);

    // Presets for activity log filtering
    const activityPresets = [
      {
        label: "Last hour",
        value: () => {
          const now = nowISO();
          const hourAgo = addHoursISO(now, -1);
          return { from: hourAgo, to: now };
        },
      },
      {
        label: "Last 24 hours",
        value: () => {
          const now = nowISO();
          const dayAgo = addHoursISO(now, -24);
          return { from: dayAgo, to: now };
        },
      },
      {
        label: "Last 7 days",
        value: () => {
          const now = nowISO();
          const weekAgo = addHoursISO(now, -(7 * 24));
          return { from: weekAgo, to: now };
        },
      },
      {
        label: "Last 30 days",
        value: () => {
          const now = nowISO();
          const monthAgo = addHoursISO(now, -(30 * 24));
          return { from: monthAgo, to: now };
        },
      },
    ];

    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-medium text-sm">Filter Activity Log</div>
          <div className="text-fg-subtle text-xs">Select a time range to filter events</div>
        </div>
        <DateTimeRangePicker value={value} onChange={setValue} presets={activityPresets} placeholder="Select time range..." />
        {value?.from && value?.to && (
          <div className="rounded-md bg-bg-subtle p-3 text-sm">
            <div className="font-medium">Filtering events:</div>
            <div className="text-fg-subtle">
              From {fromISOInstant(value.from).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} to{" "}
              {fromISOInstant(value.to).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
            </div>
          </div>
        )}
      </div>
    );
  },
};

export const ReportDateRange: Story = {
  render: function ReportDateRangeStory() {
    const [value, setValue] = useState<ISOInstantRange | undefined>(undefined);

    const today = todayISO();
    const maxDate = today; // Can't generate reports for future dates

    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-medium text-sm">Generate Report</div>
          <div className="text-fg-subtle text-xs">Select the date and time range for your report</div>
        </div>
        <DateTimeRangePicker value={value} onChange={setValue} maxDate={maxDate} clockFormat="24h" placeholder="Report period..." />
        {value?.from && value?.to && (
          <div className="rounded-md border border-border-brand bg-bg-brand-subtle p-3">
            <div className="font-medium text-fg-brand text-xs">Report Period</div>
            <div className="mt-2 text-sm">
              {(() => {
                const duration = fromISOInstant(value.from).until(fromISOInstant(value.to));
                const days = Math.floor(duration.total("days"));
                const hours = Math.floor(duration.total("hours")) % 24;
                return `${days} days, ${hours} hours`;
              })()}
            </div>
          </div>
        )}
      </div>
    );
  },
};

export const TimeTracking: Story = {
  render: function TimeTrackingStory() {
    const [value, setValue] = useState<ISOInstantRange | undefined>(undefined);

    const today = todayISO();

    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-medium text-sm">Log Work Session</div>
          <div className="text-fg-subtle text-xs">Record when you started and finished working</div>
        </div>
        <DateTimeRangePicker
          value={value}
          onChange={setValue}
          maxDate={today}
          clockFormat="24h"
          showSeconds
          minuteStep={1}
          placeholder="Work session time..."
        />
        {value?.from && value?.to && (
          <div className="rounded-md bg-bg-subtle p-3">
            <div className="text-fg-subtle text-xs">Total time worked</div>
            <div className="font-medium text-lg">
              {(() => {
                const duration = fromISOInstant(value.from).until(fromISOInstant(value.to));
                const hours = Math.floor(duration.total("hours"));
                const minutes = Math.floor(duration.total("minutes")) % 60;
                return `${hours}h ${minutes}m`;
              })()}
            </div>
          </div>
        )}
      </div>
    );
  },
};

export const EventScheduler: Story = {
  render: function EventSchedulerStory() {
    const [value, setValue] = useState<ISOInstantRange | undefined>(undefined);

    const today = todayISO();
    const minTime = "08:00:00";
    const maxTime = "22:00:00";
    const isWeekend = { dayOfWeek: ["sat", "sun"] } as const;

    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-medium text-sm">Schedule Event</div>
          <div className="text-fg-subtle text-xs">Events can only be scheduled during venue hours (8 AM - 10 PM, weekdays)</div>
        </div>
        <DateTimeRangePicker
          value={value}
          onChange={setValue}
          minDate={today}
          minTime={minTime}
          maxTime={maxTime}
          disabledDates={isWeekend}
          minuteStep={30}
          placeholder="Event start & end time..."
        />
        {value?.from && value?.to && (
          <div className="rounded-md border border-border-normal p-3">
            <div className="font-medium text-fg-subtle text-xs">Event Duration</div>
            <div className="mt-1 flex flex-col gap-1 text-sm">
              <div>
                <span className="text-fg-subtle">Starts:</span>{" "}
                {fromISOInstant(value.from).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </div>
              <div>
                <span className="text-fg-subtle">Ends:</span>{" "}
                {fromISOInstant(value.to).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </div>
              <div>
                <span className="text-fg-subtle">Duration:</span> {(() => {
                  const duration = fromISOInstant(value.from).until(fromISOInstant(value.to));
                  const hours = Math.floor(duration.total("hours"));
                  const minutes = Math.floor(duration.total("minutes")) % 60;
                  return `${hours}h ${minutes}m`;
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
};

export const MaintenanceWindow: Story = {
  render: function MaintenanceWindowStory() {
    const [value, setValue] = useState<ISOInstantRange | undefined>(undefined);

    const today = todayISO();
    const maxDate = addDaysISO(today, 90); // Schedule maintenance within 90 days

    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-medium text-sm">Schedule Maintenance Window</div>
          <div className="text-fg-subtle text-xs">Plan system downtime for updates and maintenance</div>
        </div>
        <DateTimeRangePicker value={value} onChange={setValue} minDate={today} maxDate={maxDate} clockFormat="24h" placeholder="Maintenance window..." />
        {value?.from && value?.to && (
          <div className="rounded-md border border-border-danger bg-bg-danger-subtle p-3">
            <div className="font-medium text-fg-danger text-xs">⚠️ Scheduled Downtime</div>
            <div className="mt-2 text-sm">
              <div>
                {fromISOInstant(value.from).toLocaleString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}{" "}
                -{" "}
                {fromISOInstant(value.to).toLocaleString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </div>
              <div className="mt-1 text-fg-subtle text-xs">
                Duration: {(() => {
                  const duration = fromISOInstant(value.from).until(fromISOInstant(value.to));
                  const hours = Math.floor(duration.total("hours"));
                  const minutes = Math.floor(duration.total("minutes")) % 60;
                  return `${hours}h ${minutes}m`;
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
};

export const AvailabilitySelector: Story = {
  render: function AvailabilitySelectorStory() {
    const [value, setValue] = useState<ISOInstantRange | undefined>(undefined);

    const today = todayISO();
    const minTime = "09:00:00";
    const maxTime = "17:00:00";

    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-medium text-sm">Set Your Availability</div>
          <div className="text-fg-subtle text-xs">Let others know when you're available for meetings</div>
        </div>
        <DateTimeRangePicker
          value={value}
          onChange={setValue}
          minDate={today}
          minTime={minTime}
          maxTime={maxTime}
          minuteStep={30}
          placeholder="Available from..."
        />
        {value?.from && value?.to && (
          <div className="rounded-md bg-bg-success-subtle p-3">
            <div className="font-medium text-fg-success text-xs">✓ Available</div>
            <div className="mt-2 text-sm">
              {fromISOInstant(value.from).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} -{" "}
              {fromISOInstant(value.to).toLocaleString("en-US", { hour: "numeric", minute: "2-digit" })}
            </div>
          </div>
        )}
      </div>
    );
  },
};
