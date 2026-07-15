/**
 * Elapsed-time helpers
 *
 * Replaces the legacy `Date.now() - start` pattern with Temporal-native
 * equivalents. Native `Date` is banned codebase-wide — see ADR 0003 and
 * `docs/engineering/reference/conventions/logging-conventions.md`.
 */

import { Temporal } from "@js-temporal/polyfill";

export function elapsedMs(start: Temporal.Instant): number {
  const ms = Temporal.Now.instant().since(start).total({ unit: "milliseconds" });
  return Math.max(0, Math.round(ms));
}

export function epochMs(instant: Temporal.Instant): number {
  return Number(instant.epochMilliseconds);
}
