import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { addDaysISO, addMonthsISO, endOfMonthISO, type ISODate, type ISODateRange, startOfMonthISO, todayISO } from "../../date-time";
import { DatePicker } from "./DatePicker";

const meta: Meta<typeof DatePicker> = {
  title: "Components/Inputs/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

// =============================================================================
// Single Mode Stories
// =============================================================================

export const Default: Story = {
  render: () => <DatePicker placeholder="Select a date" />,
};

export const WithDefaultValue: Story = {
  render: () => <DatePicker defaultValue={"2025-01-15"} />,
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState<ISODate | undefined>("2025-01-15");

    return (
      <div className="flex flex-col gap-4">
        <DatePicker value={value} onChange={setValue} />
        <div className="text-fg-subtle text-sm">Selected: {value ?? "none"}</div>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => <DatePicker isDisabled placeholder="Disabled" />,
};

export const WithMinMaxDates: Story = {
  render: () => {
    const today = todayISO();
    const minDate = addDaysISO(today, -7);
    const maxDate = addDaysISO(today, 30);

    return <DatePicker minDate={minDate} maxDate={maxDate} placeholder="Pick a date (limited range)" />;
  },
};

export const WithDisabledWeekends: Story = {
  render: () => <DatePicker disabled={{ dayOfWeek: ["sat", "sun"] }} placeholder="No weekends" />,
};

export const Invalid: Story = {
  render: () => <DatePicker isInvalid placeholder="Invalid state" />,
};

export const NotClearable: Story = {
  render: () => <DatePicker defaultValue={"2025-01-15"} clearable={false} />,
};

// =============================================================================
// Range Mode Stories
// =============================================================================

export const RangeDefault: Story = {
  render: () => <DatePicker mode="range" placeholder="Select date range" />,
};

export const RangeControlled: Story = {
  render: function RangeControlledStory() {
    const [value, setValue] = useState<ISODateRange>({
      from: "2025-01-10",
      to: "2025-01-20",
    });

    return (
      <div className="flex flex-col gap-4">
        <DatePicker mode="range" value={value} onChange={(v) => setValue(v ?? { from: undefined, to: undefined })} />
        <div className="text-fg-subtle text-sm">
          Selected: {value?.from ?? "none"} – {value?.to ?? "none"}
        </div>
      </div>
    );
  },
};

export const RangeWithPresets: Story = {
  render: function RangeWithPresetsStory() {
    const today = todayISO();

    const presets = [
      {
        label: "Today",
        value: {
          from: today,
          to: today,
        },
      },
      {
        label: "Yesterday",
        value: {
          from: addDaysISO(today, -1),
          to: addDaysISO(today, -1),
        },
      },
      {
        label: "Last 7 days",
        value: {
          from: addDaysISO(today, -7),
          to: today,
        },
      },
      {
        label: "Last 30 days",
        value: {
          from: addDaysISO(today, -30),
          to: today,
        },
      },
      {
        label: "This month",
        value: {
          from: startOfMonthISO(today),
          to: endOfMonthISO(today),
        },
      },
      {
        label: "Last month",
        value: {
          from: startOfMonthISO(addMonthsISO(today, -1)),
          to: addDaysISO(startOfMonthISO(today), -1),
        },
      },
    ];

    return <DatePicker mode="range" placeholder="Select date range" presets={presets} />;
  },
};

// =============================================================================
// Multiple Mode Stories
// =============================================================================

export const MultipleDefault: Story = {
  render: () => <DatePicker mode="multiple" placeholder="Select multiple dates" />,
};

export const MultipleControlled: Story = {
  render: function MultipleControlledStory() {
    const [value, setValue] = useState<ISODate[]>(["2025-01-10", "2025-01-15", "2025-01-20"]);

    return (
      <div className="flex flex-col gap-4">
        <DatePicker mode="multiple" value={value} onChange={setValue} />
        <div className="text-fg-subtle text-sm">Selected: {value.join(", ") || "none"}</div>
      </div>
    );
  },
};

export const MultipleWithMax: Story = {
  render: function MultipleWithMaxStory() {
    const [value, setValue] = useState<ISODate[]>([]);

    return (
      <div className="flex flex-col gap-4">
        <DatePicker mode="multiple" max={3} value={value} onChange={setValue} placeholder="Select up to 3 dates" />
        <div className="text-fg-subtle text-sm">Selected {value.length}/3 dates</div>
      </div>
    );
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
      setSubmitted(formData.get("dueDate") as string);
    };

    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="dueDate" className="font-medium text-sm">
            Due Date
          </label>
          <DatePicker name="dueDate" defaultValue={"2025-01-15"} />
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
  render: () => <DatePicker weekStartsOn={1} placeholder="Week starts Monday" />,
};

export const CustomPlaceholder: Story = {
  render: () => <DatePicker placeholder="When should we meet?" />,
};
