/**
 * TimePicker types.
 *
 * All time values at the public boundary are ISO 8601 time strings. `"09:30"`
 * and `"09:30:00"` are both accepted as input; `onChange` always emits the
 * canonical `HH:MM:SS` form.
 */

import type { ISOTime } from "../../date-time";

// =============================================================================
// Value Types
// =============================================================================

/**
 * Time value format for display and serialization
 * - "HH:mm" for minute precision (default)
 * - "HH:mm:ss" for second precision
 */
export type TimeFormat = "HH:mm" | "HH:mm:ss";

/**
 * Clock format for display
 * - "12h" shows AM/PM selector
 * - "24h" shows 00-23 hours
 */
export type ClockFormat = "12h" | "24h";

// =============================================================================
// Preset Options
// =============================================================================

export type TimePresetOption = {
  label: string;
  value: ISOTime;
};

// =============================================================================
// Props
// =============================================================================

export type TimePickerProps = {
  /** Controlled value */
  value?: ISOTime | undefined;

  /** Default value for uncontrolled mode */
  defaultValue?: ISOTime | undefined;

  /** Called when time changes. Always canonical `HH:MM:SS`. */
  onChange?: (time: ISOTime | undefined) => void;

  /** Time format for the value (affects seconds visibility) */
  format?: TimeFormat;

  /** Clock display format */
  clockFormat?: ClockFormat;

  /** Minute step interval (default: 1) */
  minuteStep?: 1 | 5 | 10 | 15 | 30;

  /** Earliest selectable time, inclusive */
  minTime?: ISOTime;

  /** Latest selectable time, inclusive */
  maxTime?: ISOTime;

  /** Preset options (shown in sidebar) */
  presets?: TimePresetOption[];

  /** Input name for form submission */
  name?: string;

  /** Whether the picker is disabled */
  isDisabled?: boolean;

  /** Error state */
  isInvalid?: boolean;

  /** Additional class name for the trigger input */
  className?: string;
};

// =============================================================================
// Internal Types
// =============================================================================

/**
 * Parsed time value for internal use
 */
export type ParsedTime = {
  hour: number; // 0-23
  minute: number; // 0-59
  second: number; // 0-59
};

/**
 * AM/PM period
 */
export type TimePeriod = "AM" | "PM";
