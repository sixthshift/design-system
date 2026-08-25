/**
 * Tests for elapsed.ts - Elapsed-time helpers
 */

import { describe, expect, test } from "vitest";
import { elapsedMs, epochMs, now, parseInstant, Temporal } from "../index";

describe("elapsedMs", () => {
  test("returns a non-negative integer when called with current instant", () => {
    const start = now();
    const result = elapsedMs(start);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(result)).toBe(true);
  });

  test("returns ~0 ms when start is captured immediately before measurement", () => {
    const start = now();
    expect(elapsedMs(start)).toBeLessThan(50);
  });

  test("clamps negative deltas to 0 when start is in the future", () => {
    const future = now().add({ seconds: 60 });
    expect(elapsedMs(future)).toBe(0);
  });

  test("returns rounded ms diff for a known-past start (~1s)", async () => {
    const start = now();
    await new Promise((resolve) => setTimeout(resolve, 50));
    const result = elapsedMs(start);
    expect(result).toBeGreaterThanOrEqual(45);
    expect(result).toBeLessThan(500);
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe("epochMs", () => {
  test("returns epoch milliseconds for an Instant", () => {
    const instant = parseInstant("2026-05-22T12:00:00.000Z");
    expect(epochMs(instant)).toBe(Date.UTC(2026, 4, 22, 12, 0, 0, 0));
  });

  test("returns 0 for the epoch", () => {
    const instant = Temporal.Instant.fromEpochMilliseconds(0);
    expect(epochMs(instant)).toBe(0);
  });

  test("preserves millisecond precision", () => {
    const instant = parseInstant("2026-05-22T12:00:00.123Z");
    expect(epochMs(instant)).toBe(Date.UTC(2026, 4, 22, 12, 0, 0, 123));
  });
});
