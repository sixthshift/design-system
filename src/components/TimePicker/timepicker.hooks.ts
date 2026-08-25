import { formatTimePadded, Temporal } from "../../temporal";
import type { ClockFormat, ParsedTime, TimeFormat, TimePeriod } from "./timepicker.types";

// =============================================================================
// Temporal ↔ ParsedTime Conversion
// =============================================================================

/**
 * Convert Temporal.PlainTime to ParsedTime
 */
export function temporalToParsed(time: Temporal.PlainTime): ParsedTime {
  return {
    hour: time.hour,
    minute: time.minute,
    second: time.second,
  };
}

/**
 * Convert ParsedTime to Temporal.PlainTime
 */
export function parsedToTemporal(parsed: ParsedTime): Temporal.PlainTime {
  return Temporal.PlainTime.from({
    hour: parsed.hour,
    minute: parsed.minute,
    second: parsed.second,
  });
}

/**
 * Convert Temporal.PlainTime to ISO string (for form submission)
 */
export function temporalTimeToISO(time: Temporal.PlainTime, format: TimeFormat = "HH:mm"): string {
  if (format === "HH:mm:ss") {
    return time.toString().slice(0, 8); // "HH:mm:ss"
  }
  return time.toString().slice(0, 5); // "HH:mm"
}

// =============================================================================
// Time Formatting
// =============================================================================

/**
 * Format Temporal.PlainTime for display
 */
export function formatTimeDisplay(time: Temporal.PlainTime, clockFormat: ClockFormat = "12h", format: TimeFormat = "HH:mm"): string {
  if (clockFormat === "12h") {
    return formatTimePadded(time);
  }
  // 24h format
  if (format === "HH:mm:ss") {
    return time.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }
  return time.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// =============================================================================
// Time Comparison
// =============================================================================

/**
 * Check if time a is before time b
 */
export function isTimeBefore(a: Temporal.PlainTime, b: Temporal.PlainTime): boolean {
  return Temporal.PlainTime.compare(a, b) < 0;
}

/**
 * Check if time a is after time b
 */
export function isTimeAfter(a: Temporal.PlainTime, b: Temporal.PlainTime): boolean {
  return Temporal.PlainTime.compare(a, b) > 0;
}

/**
 * Check if a time is within min/max bounds
 */
export function isTimeDisabled(time: Temporal.PlainTime, minTime?: Temporal.PlainTime, maxTime?: Temporal.PlainTime): boolean {
  if (minTime && isTimeBefore(time, minTime)) {
    return true;
  }
  if (maxTime && isTimeAfter(time, maxTime)) {
    return true;
  }
  return false;
}

// =============================================================================
// 12-Hour / 24-Hour Conversion
// =============================================================================

/**
 * Convert 24-hour hour to 12-hour format
 */
export function to12Hour(hour24: number): { hour12: number; period: TimePeriod } {
  if (hour24 === 0) {
    return { hour12: 12, period: "AM" };
  }
  if (hour24 < 12) {
    return { hour12: hour24, period: "AM" };
  }
  if (hour24 === 12) {
    return { hour12: 12, period: "PM" };
  }
  return { hour12: hour24 - 12, period: "PM" };
}

/**
 * Convert 12-hour format to 24-hour hour
 */
export function to24Hour(hour12: number, period: TimePeriod): number {
  if (period === "AM") {
    return hour12 === 12 ? 0 : hour12;
  }
  return hour12 === 12 ? 12 : hour12 + 12;
}

// =============================================================================
// Time Generation
// =============================================================================

/**
 * Generate array of hours for display
 */
export function generateHours(clockFormat: ClockFormat): number[] {
  if (clockFormat === "12h") {
    return [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  }
  return Array.from({ length: 24 }, (_, i) => i);
}

/**
 * Generate array of minutes based on step
 */
export function generateMinutes(step: number = 1): number[] {
  const minutes: number[] = [];
  for (let m = 0; m < 60; m += step) {
    minutes.push(m);
  }
  return minutes;
}

/**
 * Generate array of seconds
 */
export function generateSeconds(): number[] {
  return Array.from({ length: 60 }, (_, i) => i);
}

/**
 * Get current time as Temporal.PlainTime, rounded to minute precision
 * to avoid nanosecond drift causing unnecessary re-renders
 */
export function getCurrentTime(): Temporal.PlainTime {
  return Temporal.Now.plainTimeISO().round({ smallestUnit: "minute", roundingMode: "floor" });
}

/**
 * Round time to nearest step
 */
export function roundToStep(minute: number, step: number): number {
  return Math.round(minute / step) * step;
}
