import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Temporal } from "../../temporal";
import { TimePicker } from "./TimePicker";

const meta: Meta<typeof TimePicker> = {
  title: "Components/Inputs/TimePicker",
  component: TimePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

// =============================================================================
// Basic Stories
// =============================================================================

export const Default: Story = {
  render: () => <TimePicker placeholder="Select a time" />,
};

export const WithDefaultValue: Story = {
  render: () => <TimePicker defaultValue={Temporal.PlainTime.from("14:30")} />,
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState<Temporal.PlainTime | undefined>(Temporal.PlainTime.from("09:00"));

    return (
      <div className="flex flex-col gap-4">
        <TimePicker value={value} onChange={setValue} />
        <div className="text-fg-subtle text-sm">Selected: {value?.toString() ?? "none"}</div>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => <TimePicker isDisabled placeholder="Disabled" />,
};

export const Invalid: Story = {
  render: () => <TimePicker isInvalid placeholder="Invalid state" />,
};

// =============================================================================
// Clock Format Stories
// =============================================================================

export const TwelveHourFormat: Story = {
  render: () => <TimePicker clockFormat="12h" defaultValue={Temporal.PlainTime.from("14:30")} placeholder="12-hour format" />,
};

export const TwentyFourHourFormat: Story = {
  render: () => <TimePicker clockFormat="24h" defaultValue={Temporal.PlainTime.from("14:30")} placeholder="24-hour format" />,
};

// =============================================================================
// Minute Step Stories
// =============================================================================

export const FiveMinuteSteps: Story = {
  render: () => <TimePicker minuteStep={5} defaultValue={Temporal.PlainTime.from("14:30")} placeholder="5-minute steps" />,
};

export const FifteenMinuteSteps: Story = {
  render: () => <TimePicker minuteStep={15} defaultValue={Temporal.PlainTime.from("14:30")} placeholder="15-minute steps" />,
};

export const ThirtyMinuteSteps: Story = {
  render: () => <TimePicker minuteStep={30} defaultValue={Temporal.PlainTime.from("14:00")} placeholder="30-minute steps" />,
};

// =============================================================================
// With Seconds
// =============================================================================

export const WithSeconds: Story = {
  render: () => <TimePicker format="HH:mm:ss" defaultValue={Temporal.PlainTime.from("14:30:45")} placeholder="With seconds" />,
};

export const WithSecondsTwentyFourHour: Story = {
  render: () => <TimePicker format="HH:mm:ss" clockFormat="24h" defaultValue={Temporal.PlainTime.from("14:30:45")} placeholder="24h with seconds" />,
};

// =============================================================================
// With Constraints
// =============================================================================

export const WithMinTime: Story = {
  render: () => <TimePicker minTime={Temporal.PlainTime.from("09:00")} placeholder="Min: 9:00 AM" />,
};

export const WithMaxTime: Story = {
  render: () => <TimePicker maxTime={Temporal.PlainTime.from("17:00")} placeholder="Max: 5:00 PM" />,
};

export const BusinessHours: Story = {
  render: () => (
    <TimePicker minTime={Temporal.PlainTime.from("09:00")} maxTime={Temporal.PlainTime.from("17:00")} minuteStep={15} placeholder="Business hours only" />
  ),
};

// =============================================================================
// With Presets
// =============================================================================

export const WithPresets: Story = {
  render: () => (
    <TimePicker
      placeholder="Select a time"
      presets={[
        { label: "Morning", value: Temporal.PlainTime.from("09:00") },
        { label: "Noon", value: Temporal.PlainTime.from("12:00") },
        { label: "Afternoon", value: Temporal.PlainTime.from("14:00") },
        { label: "Evening", value: Temporal.PlainTime.from("18:00") },
      ]}
    />
  ),
};

export const MeetingScheduler: Story = {
  render: function MeetingSchedulerStory() {
    const [value, setValue] = useState<Temporal.PlainTime | undefined>();

    return (
      <div className="flex flex-col gap-4">
        <TimePicker
          value={value}
          onChange={setValue}
          minuteStep={30}
          minTime={Temporal.PlainTime.from("08:00")}
          maxTime={Temporal.PlainTime.from("18:00")}
          placeholder="Schedule a meeting"
          presets={[
            { label: "Start of day", value: Temporal.PlainTime.from("08:00") },
            { label: "Morning", value: Temporal.PlainTime.from("10:00") },
            { label: "Lunch", value: Temporal.PlainTime.from("12:00") },
            { label: "Afternoon", value: Temporal.PlainTime.from("14:00") },
            { label: "End of day", value: Temporal.PlainTime.from("17:00") },
          ]}
        />
        <div className="text-fg-subtle text-sm">Meeting time: {value?.toString() ?? "not set"}</div>
      </div>
    );
  },
};

// =============================================================================
// Form Integration
// =============================================================================

export const InForm: Story = {
  render: function InFormStory() {
    const [submitted, setSubmitted] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      setSubmitted(formData.get("appointmentTime") as string);
    };

    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="appointmentTime" className="font-medium text-sm">
            Appointment Time
          </label>
          <TimePicker name="appointmentTime" defaultValue={Temporal.PlainTime.from("10:30")} />
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
// Combined with DatePicker
// =============================================================================

export const DateTimeExample: Story = {
  render: function DateTimeExampleStory() {
    const [date, setDate] = useState<Temporal.PlainDate | undefined>(Temporal.PlainDate.from("2025-01-15"));
    const [time, setTime] = useState<Temporal.PlainTime | undefined>(Temporal.PlainTime.from("14:30"));

    // Dynamically import DatePicker to show combination
    const DatePicker = require("../DatePicker").DatePicker;

    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="datetime-date" className="font-medium text-sm">
              Date
            </label>
            <DatePicker id="datetime-date" value={date} onChange={setDate} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="datetime-time" className="font-medium text-sm">
              Time
            </label>
            <TimePicker value={time} onChange={setTime} />
          </div>
        </div>
        <div className="text-fg-subtle text-sm">DateTime: {date && time ? `${date.toString()}T${time.toString()}` : "not set"}</div>
      </div>
    );
  },
};

// =============================================================================
// Custom Width
// =============================================================================

export const CustomWidth: Story = {
  render: () => <TimePicker className="w-40" placeholder="Narrow" />,
};

export const FullWidth: Story = {
  render: () => (
    <div className="w-80">
      <TimePicker className="w-full" placeholder="Full width" />
    </div>
  ),
};
