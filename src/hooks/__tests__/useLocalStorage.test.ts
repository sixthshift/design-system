import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";
import { useLocalStorage } from "../useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("returns defaultValue when key does not exist in localStorage", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    expect(result.current[0]).toBe("default");
  });

  test("returns stored value when key exists in localStorage", () => {
    localStorage.setItem("test-key", JSON.stringify("stored-value"));
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    expect(result.current[0]).toBe("stored-value");
  });

  test("setValue persists to localStorage", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));

    act(() => {
      result.current[1]("new-value");
    });

    expect(result.current[0]).toBe("new-value");
    expect(JSON.parse(localStorage.getItem("test-key")!)).toBe("new-value");
  });

  test("setValue with updater function uses previous value", () => {
    const { result } = renderHook(() => useLocalStorage("counter", 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1]((prev) => prev + 10);
    });

    expect(result.current[0]).toBe(11);
  });

  test("handles JSON serialization and deserialization for objects", () => {
    const defaultObj = { name: "test", items: [1, 2, 3] };
    const { result } = renderHook(() => useLocalStorage("obj-key", defaultObj));

    expect(result.current[0]).toEqual(defaultObj);

    const newObj = { name: "updated", items: [4, 5] };
    act(() => {
      result.current[1](newObj);
    });

    expect(result.current[0]).toEqual(newObj);
    expect(JSON.parse(localStorage.getItem("obj-key")!)).toEqual(newObj);
  });

  test("returns defaultValue when localStorage has invalid JSON", () => {
    localStorage.setItem("bad-key", "not-valid-json{{{");
    const { result } = renderHook(() => useLocalStorage("bad-key", "fallback"));
    expect(result.current[0]).toBe("fallback");
  });
});
