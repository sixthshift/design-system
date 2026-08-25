import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";
import { useDeviceFormFactor } from "../useDeviceFormFactor";

function setWindowWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    value: width,
    writable: true,
    configurable: true,
  });
  window.dispatchEvent(new Event("resize"));
}

describe("useDeviceFormFactor", () => {
  beforeEach(() => {
    // Reset to a known desktop width
    Object.defineProperty(window, "innerWidth", {
      value: 1024,
      writable: true,
      configurable: true,
    });
  });

  test("returns desktop for window width >= 1024", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 1440,
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useDeviceFormFactor());
    expect(result.current).toBe("desktop");
  });

  test("returns tablet for window width 640-1023", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 800,
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useDeviceFormFactor());
    expect(result.current).toBe("tablet");
  });

  test("returns mobile for window width < 640", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 400,
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useDeviceFormFactor());
    expect(result.current).toBe("mobile");
  });

  test("updates when window is resized", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 1440,
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useDeviceFormFactor());
    expect(result.current).toBe("desktop");

    act(() => {
      setWindowWidth(500);
    });
    expect(result.current).toBe("mobile");
  });

  test("returns desktop at exactly 1024px boundary", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 1024,
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useDeviceFormFactor());
    expect(result.current).toBe("desktop");
  });

  test("returns tablet at exactly 640px boundary", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 640,
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useDeviceFormFactor());
    expect(result.current).toBe("tablet");
  });
});
