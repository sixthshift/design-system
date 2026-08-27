import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { addDaysISO, addMinutesISO, addMonthsISO, fromISOInstant, type ISOInstant, nowISO, todayISO, toISOInstant } from "../../date-time";
import { DateTimePicker } from "./DateTimePicker";

const meta: Meta<typeof DateTimePicker> = {
  title: "Components/DateTimePicker",
  component: DateTimePicker,
  tags: ["autodocs"],
  parameters: {
    // Published as `./datetime-picker`, which kebab-casing the component name does not produce.
    importPath: "datetime-picker",
    layout: "centered",
    docs: { subtitle: "Calendar and time columns combined, for picking a single instant" },
  },
};

export default meta;
type Story = StoryObj<typeof DateTimePicker>;

// =============================================================================
// Basic Stories
// =============================================================================

/**
 * Type or pick — the same instant, two ways in.
 *
 * One field for both halves, so `1520260330p` fills the whole thing: January
 * 5th 2026 at 3:30pm. The grid and the columns follow what is typed, and what
 * is picked shows up in the segments.
 */
export const TypeOrPick: Story = {
  render: function TypeOrPickStory() {
    const [observed, setObserved] = useState<ISOInstant | undefined>();

    return (
      <div className="flex flex-col gap-4">
        <DateTimePicker onChange={setObserved} />
        <div className="text-fg-subtle text-sm">Value: {observed ?? "none — a half-typed instant is not a value"}</div>
      </div>
    );
  },
};

export const Default: Story = {
  render: () => <DateTimePicker />,
};

export const WithDefaultValue: Story = {
  render: () => {
    const dateTime = "2025-01-15T14:30:00Z";
    return <DateTimePicker defaultValue={dateTime} />;
  },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState<ISOInstant | undefined>("2025-01-15T14:30:00Z");

    return (
      <div className="flex flex-col gap-4">
        <DateTimePicker value={value} onChange={setValue} />
        <div className="text-fg-subtle text-sm">Selected: {value ?? "none"}</div>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => <DateTimePicker isDisabled />,
};

export const Invalid: Story = {
  render: () => <DateTimePicker isInvalid />,
};

export const NotClearable: Story = {
  render: () => {
    const dateTime = "2025-01-15T14:30:00Z";
    return <DateTimePicker defaultValue={dateTime} clearable={false} />;
  },
};

// =============================================================================
// Time Format Stories
// =============================================================================

export const Format12Hour: Story = {
  render: () => {
    const dateTime = "2025-01-15T14:30:00Z";
    return <DateTimePicker defaultValue={dateTime} clockFormat="12h" />;
  },
};

export const Format24Hour: Story = {
  render: () => {
    const dateTime = "2025-01-15T14:30:00Z";
    return <DateTimePicker defaultValue={dateTime} clockFormat="24h" />;
  },
};

export const WithSeconds: Story = {
  render: () => {
    const dateTime = "2025-01-15T14:30:45Z";
    return <DateTimePicker defaultValue={dateTime} showSeconds />;
  },
};

export const WithSeconds24Hour: Story = {
  render: () => {
    const dateTime = "2025-01-15T14:30:45Z";
    return <DateTimePicker defaultValue={dateTime} clockFormat="24h" showSeconds />;
  },
};

export const MinuteStep15: Story = {
  render: () => <DateTimePicker minuteStep={15} />,
};

export const MinuteStep30: Story = {
  render: () => <DateTimePicker minuteStep={30} />,
};

// =============================================================================
// Constraint Stories
// =============================================================================

export const WithMinMaxDate: Story = {
  render: () => {
    const today = todayISO();
    const minDate = addDaysISO(today, -7);
    const maxDate = addDaysISO(today, 30);

    return <DateTimePicker minDate={minDate} maxDate={maxDate} />;
  },
};

export const WithMinMaxTime: Story = {
  render: () => {
    const minTime = "09:00:00";
    const maxTime = "17:00:00";

    return <DateTimePicker minTime={minTime} maxTime={maxTime} />;
  },
};

export const WithDisabledWeekends: Story = {
  render: () => <DateTimePicker disabledDates={{ dayOfWeek: ["sat", "sun"] }} />,
};

export const FutureDatesOnly: Story = {
  render: () => {
    const today = todayISO();
    return <DateTimePicker minDate={today} />;
  },
};

export const BusinessHoursWeekdaysOnly: Story = {
  render: () => {
    const minTime = "09:00:00";
    const maxTime = "17:00:00";
    const isWeekend = { dayOfWeek: ["sat", "sun"] } as const;

    return <DateTimePicker minTime={minTime} maxTime={maxTime} disabledDates={isWeekend} minuteStep={30} />;
  },
};

// =============================================================================
// Form Integration Stories
// =============================================================================

export const InForm: Story = {
  render: function InFormStory() {
    const [submitted, setSubmitted] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      setSubmitted(formData.get("eventDateTime") as string);
    };

    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="eventDateTime" className="font-medium text-sm">
            Event Date & Time
          </label>
          <DateTimePicker name="eventDateTime" defaultValue={"2025-01-15T14:30:00Z"} />
        </div>
        <button type="submit" className="rounded-md bg-bg-brand px-4 py-2 font-medium text-fg-on-brand text-sm">
          Submit
        </button>
        {submitted && <div className="text-fg-subtle text-sm">Submitted value: {submitted}</div>}
      </form>
    );
  },
};

// =============================================================================
// Configuration Stories
// =============================================================================

export const MondayStart: Story = {
  render: () => <DateTimePicker weekStartsOn={1} />,
};

export const AlignStart: Story = {
  render: () => <DateTimePicker align="start" />,
};

export const CustomPlaceholder: Story = {
  render: () => <DateTimePicker />,
};

// =============================================================================
// Use Case Stories
// =============================================================================

export const AppointmentScheduler: Story = {
  render: function AppointmentSchedulerStory() {
    const [value, setValue] = useState<ISOInstant | undefined>();

    // Business hours: 9 AM - 5 PM, 30-minute slots, weekdays only
    const minTime = "09:00:00";
    const maxTime = "17:00:00";
    const isWeekend = { dayOfWeek: ["sat", "sun"] } as const;
    const today = todayISO();

    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-medium text-sm">Schedule Appointment</div>
          <div className="text-fg-subtle text-xs">Available Monday-Friday, 9 AM - 5 PM</div>
        </div>
        <DateTimePicker value={value} onChange={setValue} minDate={today} minTime={minTime} maxTime={maxTime} disabledDates={isWeekend} minuteStep={30} />
        {value && (
          <div className="rounded-md bg-bg-subtle p-3 text-sm">
            <div className="font-medium">Appointment scheduled for:</div>
            <div className="text-fg-subtle">
              {fromISOInstant(value).toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>
          </div>
        )}
      </div>
    );
  },
};

export const EventReminder: Story = {
  render: function EventReminderStory() {
    const [value, setValue] = useState<ISOInstant | undefined>(
      toISOInstant(fromISOInstant(nowISO()).add({ hours: 1 }).round({ smallestUnit: "minute", roundingMode: "floor" }))
    );

    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-medium text-sm">Set Reminder</div>
          <div className="text-fg-subtle text-xs">Choose when you want to be notified</div>
        </div>
        <DateTimePicker value={value} onChange={setValue} minDate={todayISO()} minuteStep={5} />
        {value && (
          <div className="text-fg-subtle text-xs">
            Reminder will be sent at {fromISOInstant(value).toLocaleString("en-US", { hour: "numeric", minute: "2-digit" })} on{" "}
            {fromISOInstant(value).toLocaleString("en-US", { month: "short", day: "numeric" })}
          </div>
        )}
      </div>
    );
  },
};

export const DeadlineTracker: Story = {
  render: function DeadlineTrackerStory() {
    const [value, setValue] = useState<ISOInstant | undefined>();

    const today = todayISO();
    const maxDate = addMonthsISO(today, 3); // Deadlines within 3 months

    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-medium text-sm">Project Deadline</div>
          <div className="text-fg-subtle text-xs">Set the due date and time for this task</div>
        </div>
        <DateTimePicker value={value} onChange={setValue} minDate={today} maxDate={maxDate} clockFormat="24h" />
        {value && (
          <div className="rounded-md border border-border-normal p-3">
            <div className="font-medium text-fg-subtle text-xs">Due in:</div>
            <div className="font-medium text-sm">
              {(() => {
                const now = fromISOInstant(nowISO());
                const duration = now.until(fromISOInstant(value));
                const totalHours = Math.floor(duration.total("hours"));
                const days = Math.floor(totalHours / 24);
                const hours = totalHours % 24;
                return `${days} days, ${hours} hours`;
              })()}
            </div>
          </div>
        )}
      </div>
    );
  },
};

export const FlightBooking: Story = {
  render: function FlightBookingStory() {
    const [departureTime, setDepartureTime] = useState<ISOInstant | undefined>();

    const today = todayISO();
    const maxDate = addMonthsISO(today, 12); // Can book up to 1 year ahead

    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-medium text-sm">Flight Departure</div>
          <div className="text-fg-subtle text-xs">Select your departure date and time</div>
        </div>
        <DateTimePicker value={departureTime} onChange={setDepartureTime} minDate={today} maxDate={maxDate} clockFormat="24h" />
        {departureTime && (
          <div className="rounded-md bg-bg-brand-subtle p-3">
            <div className="text-fg-subtle text-xs">Departure</div>
            <div className="font-medium">
              {fromISOInstant(departureTime).toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </div>
          </div>
        )}
      </div>
    );
  },
};

export const MeetingScheduler: Story = {
  render: function MeetingSchedulerStory() {
    const [startTime, setStartTime] = useState<ISOInstant | undefined>();
    const [duration, setDuration] = useState<number>(60); // minutes

    const minTime = "08:00:00";
    const maxTime = "18:00:00";
    const isWeekend = { dayOfWeek: ["sat", "sun"] } as const;

    const endTime = startTime ? addMinutesISO(startTime, duration) : undefined;

    return (
      <div className="flex flex-col gap-4">
        <div className="font-medium text-sm">Schedule Meeting</div>

        <div className="flex flex-col gap-2">
          <span className="text-fg-subtle text-xs">Start Time</span>
          <DateTimePicker
            value={startTime}
            onChange={setStartTime}
            minDate={todayISO()}
            minTime={minTime}
            maxTime={maxTime}
            disabledDates={isWeekend}
            minuteStep={15}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="meeting-duration" className="text-fg-subtle text-xs">
            Duration
          </label>
          <select
            id="meeting-duration"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="rounded-md border border-border-normal bg-bg-normal px-3 py-2 text-sm"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
            <option value={120}>2 hours</option>
          </select>
        </div>

        {startTime && endTime && (
          <div className="rounded-md border border-border-brand bg-bg-brand-subtle p-3">
            <div className="font-medium text-fg-brand text-xs">Meeting Details</div>
            <div className="mt-2 flex flex-col gap-1 text-sm">
              <div>
                <span className="text-fg-subtle">Start:</span> {fromISOInstant(startTime).toLocaleString("en-US", { hour: "numeric", minute: "2-digit" })}
              </div>
              <div>
                <span className="text-fg-subtle">End:</span> {fromISOInstant(endTime).toLocaleString("en-US", { hour: "numeric", minute: "2-digit" })}
              </div>
              <div>
                <span className="text-fg-subtle">Duration:</span> {duration} minutes
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
};

export const TimeLogEntry: Story = {
  render: function TimeLogEntryStory() {
    const [value, setValue] = useState<ISOInstant | undefined>(toISOInstant(fromISOInstant(nowISO()).round({ smallestUnit: "minute" })));

    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-medium text-sm">Log Work Time</div>
          <div className="text-fg-subtle text-xs">Record when you completed this task</div>
        </div>
        <DateTimePicker value={value} onChange={setValue} maxDate={todayISO()} clockFormat="24h" showSeconds />
        {value && (
          <div className="text-fg-subtle text-xs">
            Logged:{" "}
            {fromISOInstant(value).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })}
          </div>
        )}
      </div>
    );
  },
};
