import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useDebouncedState } from "../useDebouncedState";

describe("useDebouncedState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedState("hello", 300));
    expect(result.current).toBe("hello");
  });

  test("updates to the new value after the delay", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedState(value, 300), { initialProps: { value: "hello" } });
    rerender({ value: "world" });
    expect(result.current).toBe("hello");
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("world");
  });

  test("resets delay when value changes before delay elapses", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedState(value, 300), { initialProps: { value: "a" } });
    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    // "b" hasn't fired yet, change to "c"
    rerender({ value: "c" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    // 200ms after "c" -- not enough, "b"'s timer was cleared
    expect(result.current).toBe("a");
    act(() => {
      vi.advanceTimersByTime(100);
    });
    // 300ms after "c" -- now it fires
    expect(result.current).toBe("c");
  });

  test("final value is the last value set after all timers resolve", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedState(value, 100), { initialProps: { value: "first" } });
    rerender({ value: "second" });
    rerender({ value: "third" });
    rerender({ value: "fourth" });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("fourth");
  });

  test("does not update before the delay has elapsed", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedState(value, 500), { initialProps: { value: "start" } });
    rerender({ value: "updated" });
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe("start");
  });

  test("works with numeric values", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedState(value, 200), { initialProps: { value: 0 } });
    rerender({ value: 42 });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe(42);
  });
});
