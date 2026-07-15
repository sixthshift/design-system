import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useControllableState } from "../useControllableState";

describe("useControllableState", () => {
  test("uses defaultValue when value is undefined (uncontrolled mode)", () => {
    const { result } = renderHook(() => useControllableState({ defaultValue: "initial" }));
    expect(result.current[0]).toBe("initial");
  });

  test("uses value when provided (controlled mode)", () => {
    const { result } = renderHook(() => useControllableState({ value: "controlled", defaultValue: "initial" }));
    expect(result.current[0]).toBe("controlled");
  });

  test("calls onChange when setValue is called in controlled mode", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState({
        value: "controlled",
        defaultValue: "initial",
        onChange,
      })
    );
    act(() => {
      result.current[1]("new-value");
    });
    expect(onChange).toHaveBeenCalledWith("new-value");
  });

  test("updates internal state in uncontrolled mode when setValue is called", () => {
    const { result } = renderHook(() => useControllableState({ defaultValue: "initial" }));
    act(() => {
      result.current[1]("updated");
    });
    expect(result.current[0]).toBe("updated");
  });

  test("does not update internal state when controlled (value prop drives state)", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState({
        value: "controlled",
        defaultValue: "initial",
        onChange,
      })
    );
    act(() => {
      result.current[1]("new-value");
    });
    // Value remains the controlled value, not the setValue argument
    expect(result.current[0]).toBe("controlled");
    // onChange was still called so the parent can update
    expect(onChange).toHaveBeenCalledWith("new-value");
  });

  test("calls onChange in uncontrolled mode when setValue is called", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: "initial", onChange }));
    act(() => {
      result.current[1]("updated");
    });
    expect(onChange).toHaveBeenCalledWith("updated");
    expect(result.current[0]).toBe("updated");
  });

  test("works with non-string types", () => {
    const { result } = renderHook(() => useControllableState({ defaultValue: 0 }));
    expect(result.current[0]).toBe(0);
    act(() => {
      result.current[1](42);
    });
    expect(result.current[0]).toBe(42);
  });
});
