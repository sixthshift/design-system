import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { addDaysISO, addMonthsISO, endOfMonthISO, type ISODate, type ISODateRange, startOfMonthISO, todayISO } from "../../date-time";
import { DatePicker } from "./DatePicker";

const meta: Meta<typeof DatePicker> = {
  title: "Components/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: { subtitle: "A typeable date field and a calendar popover, as one control" },
  },
  argTypes: {
    segmentOrder: {
      control: "select",
      options: ["mdy", "dmy", "ymd"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

// =============================================================================
// Single Mode Stories
// =============================================================================

export const Default: Story = {
  render: () => <DatePicker />,
};

/**
 * Type or pick — the same value, two ways in.
 *
 * The segments are three spinbuttons, so a date can be entered from the
 * keyboard with no parsing and no ambiguity: digits fill the focused segment
 * and advance when it cannot take another, arrows step it, `Backspace` clears
 * it, and `Alt+ArrowDown` opens the grid at the month being typed. Whichever
 * you use, the other follows.
 */
export const TypeOrPick: Story = {
  render: function TypeOrPickStory() {
    // Uncontrolled, with the value merely observed. A controlled picker whose
    // state starts `undefined` mounts uncontrolled and flips on the first
    // change — see the warning in `useControllableState` — and clearing it then
    // flips it back, stranding the last value on screen. `Controlled` below
    // starts from a real date, which is the shape that works.
    const [observed, setObserved] = useState<ISODate | undefined>();

    return (
      <div className="flex flex-col gap-4">
        <DatePicker onChange={setObserved} />
        <div className="text-fg-subtle text-sm">Value: {observed ?? "none — a half-typed date is not a value"}</div>
      </div>
    );
  },
};

/**
 * `segmentOrder` is explicit, never sniffed from the runtime locale: `08/09` is
 * a different date in `mdy` than in `dmy`, and the segment labels make which
 * one unmistakable to a screen reader either way.
 */
export const SegmentOrder: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(["mdy", "dmy", "ymd"] as const).map((order) => (
        <div key={order} className="flex items-center gap-3">
          <span className="w-10 font-mono text-fg-subtle text-xs">{order}</span>
          <DatePicker segmentOrder={order} defaultValue="2026-08-27" />
        </div>
      ))}
    </div>
  ),
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
  render: () => <DatePicker isDisabled />,
};

export const WithMinMaxDates: Story = {
  render: () => {
    const today = todayISO();
    const minDate = addDaysISO(today, -7);
    const maxDate = addDaysISO(today, 30);

    return <DatePicker minDate={minDate} maxDate={maxDate} />;
  },
};

export const WithDisabledWeekends: Story = {
  render: () => <DatePicker disabled={{ dayOfWeek: ["sat", "sun"] }} />,
};

export const Invalid: Story = {
  render: () => <DatePicker isInvalid />,
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
  render: () => <DatePicker weekStartsOn={1} />,
};

export const CustomPlaceholder: Story = {
  render: () => <DatePicker />,
};
