import { Temporal } from "@sixthshift/temporal";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DateTimePicker } from "./DateTimePicker";

const meta: Meta<typeof DateTimePicker> = {
  title: "Components/Inputs/DateTimePicker",
  component: DateTimePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof DateTimePicker>;

// =============================================================================
// Basic Stories
// =============================================================================

export const Default: Story = {
  render: () => <DateTimePicker placeholder="Select date and time..." />,
};

export const WithDefaultValue: Story = {
  render: () => {
    const dateTime = Temporal.Instant.from("2025-01-15T14:30:00Z");
    return <DateTimePicker defaultValue={dateTime} />;
  },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState<Temporal.Instant | undefined>(Temporal.Instant.from("2025-01-15T14:30:00Z"));

    return (
      <div className="flex flex-col gap-4">
        <DateTimePicker value={value} onChange={setValue} />
        <div className="text-fg-subtle text-sm">Selected: {value?.toString() ?? "none"}</div>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => <DateTimePicker isDisabled placeholder="Disabled" />,
};

export const Invalid: Story = {
  render: () => <DateTimePicker isInvalid placeholder="Invalid state" />,
};

export const NotClearable: Story = {
  render: () => {
    const dateTime = Temporal.Instant.from("2025-01-15T14:30:00Z");
    return <DateTimePicker defaultValue={dateTime} clearable={false} />;
  },
};

// =============================================================================
// Time Format Stories
// =============================================================================

export const Format12Hour: Story = {
  render: () => {
    const dateTime = Temporal.Instant.from("2025-01-15T14:30:00Z");
    return <DateTimePicker defaultValue={dateTime} clockFormat="12h" placeholder="12-hour format (with AM/PM)" />;
  },
};

export const Format24Hour: Story = {
  render: () => {
    const dateTime = Temporal.Instant.from("2025-01-15T14:30:00Z");
    return <DateTimePicker defaultValue={dateTime} clockFormat="24h" placeholder="24-hour format" />;
  },
};

export const WithSeconds: Story = {
  render: () => {
    const dateTime = Temporal.Instant.from("2025-01-15T14:30:45Z");
    return <DateTimePicker defaultValue={dateTime} showSeconds placeholder="With seconds column" />;
  },
};

export const WithSeconds24Hour: Story = {
  render: () => {
    const dateTime = Temporal.Instant.from("2025-01-15T14:30:45Z");
    return <DateTimePicker defaultValue={dateTime} clockFormat="24h" showSeconds placeholder="24h with seconds" />;
  },
};

export const MinuteStep15: Story = {
  render: () => <DateTimePicker minuteStep={15} placeholder="15-minute intervals (00, 15, 30, 45)" />,
};

export const MinuteStep30: Story = {
  render: () => <DateTimePicker minuteStep={30} placeholder="30-minute intervals (00, 30)" />,
};

// =============================================================================
// Constraint Stories
// =============================================================================

export const WithMinMaxDate: Story = {
  render: () => {
    const today = Temporal.Now.plainDateISO();
    const minDate = today.subtract({ days: 7 });
    const maxDate = today.add({ days: 30 });

    return <DateTimePicker minDate={minDate} maxDate={maxDate} placeholder="Limited to past 7 days and next 30 days" />;
  },
};

export const WithMinMaxTime: Story = {
  render: () => {
    const minTime = Temporal.PlainTime.from("09:00:00");
    const maxTime = Temporal.PlainTime.from("17:00:00");

    return <DateTimePicker minTime={minTime} maxTime={maxTime} placeholder="Business hours only (9 AM - 5 PM)" />;
  },
};

export const WithDisabledWeekends: Story = {
  render: () => <DateTimePicker disabledDates={(date) => date.dayOfWeek === 6 || date.dayOfWeek === 7} placeholder="Weekdays only" />,
};

export const FutureDatesOnly: Story = {
  render: () => {
    const today = Temporal.Now.plainDateISO();
    return <DateTimePicker minDate={today} placeholder="Future dates only" />;
  },
};

export const BusinessHoursWeekdaysOnly: Story = {
  render: () => {
    const minTime = Temporal.PlainTime.from("09:00:00");
    const maxTime = Temporal.PlainTime.from("17:00:00");
    const isWeekend = (date: Temporal.PlainDate) => date.dayOfWeek === 6 || date.dayOfWeek === 7;

    return <DateTimePicker minTime={minTime} maxTime={maxTime} disabledDates={isWeekend} minuteStep={30} placeholder="Business hours, weekdays only" />;
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
          <DateTimePicker name="eventDateTime" defaultValue={Temporal.Instant.from("2025-01-15T14:30:00Z")} />
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
  render: () => <DateTimePicker weekStartsOn={1} placeholder="Week starts Monday" />,
};

export const AlignStart: Story = {
  render: () => <DateTimePicker align="start" placeholder="Popup aligns to start" />,
};

export const CustomPlaceholder: Story = {
  render: () => <DateTimePicker placeholder="When should the meeting start?" />,
};

// =============================================================================
// Use Case Stories
// =============================================================================

export const AppointmentScheduler: Story = {
  render: function AppointmentSchedulerStory() {
    const [value, setValue] = useState<Temporal.Instant | undefined>();

    // Business hours: 9 AM - 5 PM, 30-minute slots, weekdays only
    const minTime = Temporal.PlainTime.from("09:00:00");
    const maxTime = Temporal.PlainTime.from("17:00:00");
    const isWeekend = (date: Temporal.PlainDate) => date.dayOfWeek === 6 || date.dayOfWeek === 7;
    const today = Temporal.Now.plainDateISO();

    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-medium text-sm">Schedule Appointment</div>
          <div className="text-fg-subtle text-xs">Available Monday-Friday, 9 AM - 5 PM</div>
        </div>
        <DateTimePicker
          value={value}
          onChange={setValue}
          minDate={today}
          minTime={minTime}
          maxTime={maxTime}
          disabledDates={isWeekend}
          minuteStep={30}
          placeholder="Select appointment time..."
        />
        {value && (
          <div className="rounded-md bg-bg-subtle p-3 text-sm">
            <div className="font-medium">Appointment scheduled for:</div>
            <div className="text-fg-subtle">
              {value.toLocaleString("en-US", {
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
    const [value, setValue] = useState<Temporal.Instant | undefined>(
      Temporal.Now.instant().add({ hours: 1 }).round({ smallestUnit: "minute", roundingMode: "floor" })
    );

    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-medium text-sm">Set Reminder</div>
          <div className="text-fg-subtle text-xs">Choose when you want to be notified</div>
        </div>
        <DateTimePicker value={value} onChange={setValue} minDate={Temporal.Now.plainDateISO()} minuteStep={5} placeholder="Reminder time..." />
        {value && (
          <div className="text-fg-subtle text-xs">
            Reminder will be sent at {value.toLocaleString("en-US", { hour: "numeric", minute: "2-digit" })} on{" "}
            {value.toLocaleString("en-US", { month: "short", day: "numeric" })}
          </div>
        )}
      </div>
    );
  },
};

export const DeadlineTracker: Story = {
  render: function DeadlineTrackerStory() {
    const [value, setValue] = useState<Temporal.Instant | undefined>();

    const today = Temporal.Now.plainDateISO();
    const maxDate = today.add({ months: 3 }); // Deadlines within 3 months

    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-medium text-sm">Project Deadline</div>
          <div className="text-fg-subtle text-xs">Set the due date and time for this task</div>
        </div>
        <DateTimePicker value={value} onChange={setValue} minDate={today} maxDate={maxDate} clockFormat="24h" placeholder="Set deadline..." />
        {value && (
          <div className="rounded-md border border-border-normal p-3">
            <div className="font-medium text-fg-subtle text-xs">Due in:</div>
            <div className="font-medium text-sm">
              {(() => {
                const now = Temporal.Now.instant();
                const duration = now.until(value);
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
    const [departureTime, setDepartureTime] = useState<Temporal.Instant | undefined>();

    const today = Temporal.Now.plainDateISO();
    const maxDate = today.add({ years: 1 }); // Can book up to 1 year ahead

    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-medium text-sm">Flight Departure</div>
          <div className="text-fg-subtle text-xs">Select your departure date and time</div>
        </div>
        <DateTimePicker
          value={departureTime}
          onChange={setDepartureTime}
          minDate={today}
          maxDate={maxDate}
          clockFormat="24h"
          placeholder="Departure date & time..."
        />
        {departureTime && (
          <div className="rounded-md bg-bg-brand-subtle p-3">
            <div className="text-fg-subtle text-xs">Departure</div>
            <div className="font-medium">
              {departureTime.toLocaleString("en-US", {
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
    const [startTime, setStartTime] = useState<Temporal.Instant | undefined>();
    const [duration, setDuration] = useState<number>(60); // minutes

    const minTime = Temporal.PlainTime.from("08:00:00");
    const maxTime = Temporal.PlainTime.from("18:00:00");
    const isWeekend = (date: Temporal.PlainDate) => date.dayOfWeek === 6 || date.dayOfWeek === 7;

    const endTime = startTime?.add({ minutes: duration });

    return (
      <div className="flex flex-col gap-4">
        <div className="font-medium text-sm">Schedule Meeting</div>

        <div className="flex flex-col gap-2">
          <span className="text-fg-subtle text-xs">Start Time</span>
          <DateTimePicker
            value={startTime}
            onChange={setStartTime}
            minDate={Temporal.Now.plainDateISO()}
            minTime={minTime}
            maxTime={maxTime}
            disabledDates={isWeekend}
            minuteStep={15}
            placeholder="Meeting start time..."
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
                <span className="text-fg-subtle">Start:</span> {startTime.toLocaleString("en-US", { hour: "numeric", minute: "2-digit" })}
              </div>
              <div>
                <span className="text-fg-subtle">End:</span> {endTime.toLocaleString("en-US", { hour: "numeric", minute: "2-digit" })}
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
    const [value, setValue] = useState<Temporal.Instant | undefined>(Temporal.Now.instant().round({ smallestUnit: "minute" }));

    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-medium text-sm">Log Work Time</div>
          <div className="text-fg-subtle text-xs">Record when you completed this task</div>
        </div>
        <DateTimePicker
          value={value}
          onChange={setValue}
          maxDate={Temporal.Now.plainDateISO()}
          clockFormat="24h"
          showSeconds
          placeholder="Completion time..."
        />
        {value && (
          <div className="text-fg-subtle text-xs">
            Logged:{" "}
            {value.toLocaleString("en-US", {
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
