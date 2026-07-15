/**
 * TimePicker types
 *
 * All time values use Temporal.PlainTime at the component boundary.
 * This provides type safety and semantic clarity about what kind of time is expected.
 */

import type { Temporal } from "@sixthshift/temporal";

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
  value: Temporal.PlainTime;
};

// =============================================================================
// Props
// =============================================================================

export type TimePickerProps = {
  /** Controlled value */
  value?: Temporal.PlainTime | undefined;

  /** Default value for uncontrolled mode */
  defaultValue?: Temporal.PlainTime | undefined;

  /** Called when time changes */
  onChange?: (time: Temporal.PlainTime | undefined) => void;

  /** Time format for the value (affects seconds visibility) */
  format?: TimeFormat;

  /** Clock display format */
  clockFormat?: ClockFormat;

  /** Minute step interval (default: 1) */
  minuteStep?: 1 | 5 | 10 | 15 | 30;

  /** Minimum selectable time */
  minTime?: Temporal.PlainTime;

  /** Maximum selectable time */
  maxTime?: Temporal.PlainTime;

  /** Preset options (shown in sidebar) */
  presets?: TimePresetOption[];

  /** Placeholder text */
  placeholder?: string;

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
