/**
 * Duration utilities
 *
 * Functions for creating and converting Duration objects
 */

import { Temporal } from "@js-temporal/polyfill";

/**
 * Create a duration from hours
 */
export function hours(n: number): Temporal.Duration {
  return Temporal.Duration.from({ hours: n });
}

/**
 * Create a duration from minutes
 */
export function minutes(n: number): Temporal.Duration {
  return Temporal.Duration.from({ minutes: n });
}

/**
 * Create a duration from days
 */
export function days(n: number): Temporal.Duration {
  return Temporal.Duration.from({ days: n });
}

/**
 * Create a duration from weeks
 */
export function weeks(n: number): Temporal.Duration {
  return Temporal.Duration.from({ weeks: n });
}

/**
 * Get the total milliseconds of a duration
 */
export function toMilliseconds(duration: Temporal.Duration): number {
  return duration.total({ unit: "milliseconds" });
}

/**
 * Get the total seconds of a duration
 */
export function toSeconds(duration: Temporal.Duration): number {
  return duration.total({ unit: "seconds" });
}

/**
 * Get the total minutes of a duration
 */
export function toMinutes(duration: Temporal.Duration): number {
  return duration.total({ unit: "minutes" });
}

/**
 * Get the total hours of a duration
 */
export function toHours(duration: Temporal.Duration): number {
  return duration.total({ unit: "hours" });
}
