import { act, renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { useCollapsible } from "../useCollapsible";

describe("useCollapsible", () => {
  test("starts expanded by default", () => {
    const { result } = renderHook(() => useCollapsible());
    expect(result.current.expanded).toBe(true);
  });

  test("starts collapsed when defaultExpanded is false", () => {
    const { result } = renderHook(() => useCollapsible(false));
    expect(result.current.expanded).toBe(false);
  });

  test("toggle flips expanded state from true to false", () => {
    const { result } = renderHook(() => useCollapsible());
    act(() => {
      result.current.toggle();
    });
    expect(result.current.expanded).toBe(false);
  });

  test("toggle flips expanded state from false to true", () => {
    const { result } = renderHook(() => useCollapsible(false));
    act(() => {
      result.current.toggle();
    });
    expect(result.current.expanded).toBe(true);
  });

  test("collapse sets expanded to false", () => {
    const { result } = renderHook(() => useCollapsible());
    act(() => {
      result.current.collapse();
    });
    expect(result.current.expanded).toBe(false);
  });

  test("expand sets expanded to true", () => {
    const { result } = renderHook(() => useCollapsible(false));
    act(() => {
      result.current.expand();
    });
    expect(result.current.expanded).toBe(true);
  });

  test("collapse is idempotent when already collapsed", () => {
    const { result } = renderHook(() => useCollapsible(false));
    act(() => {
      result.current.collapse();
    });
    expect(result.current.expanded).toBe(false);
    act(() => {
      result.current.collapse();
    });
    expect(result.current.expanded).toBe(false);
  });

  test("expand is idempotent when already expanded", () => {
    const { result } = renderHook(() => useCollapsible());
    act(() => {
      result.current.expand();
    });
    expect(result.current.expanded).toBe(true);
    act(() => {
      result.current.expand();
    });
    expect(result.current.expanded).toBe(true);
  });
});
