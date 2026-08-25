import { act, renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { useStack } from "../useStack";

interface TestItem {
  id: string;
  label?: string;
}

describe("useStack", () => {
  test("starts with empty stack by default", () => {
    const { result } = renderHook(() => useStack<TestItem>());
    expect(result.current[0]).toEqual([]);
  });

  test("starts with initial stack when provided", () => {
    const initial: TestItem[] = [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
    ];
    const { result } = renderHook(() => useStack<TestItem>(initial));
    expect(result.current[0]).toEqual(initial);
  });

  test("push adds item to end of stack", () => {
    const { result } = renderHook(() => useStack<TestItem>());
    act(() => {
      result.current[1]({ type: "push", item: { id: "a", label: "A" } });
    });
    expect(result.current[0]).toEqual([{ id: "a", label: "A" }]);
  });

  test("push deduplicates by id and does not add existing item", () => {
    const { result } = renderHook(() => useStack<TestItem>([{ id: "a", label: "A" }]));
    act(() => {
      result.current[1]({
        type: "push",
        item: { id: "a", label: "Updated" },
      });
    });
    expect(result.current[0]).toEqual([{ id: "a", label: "A" }]);
    expect(result.current[0]).toHaveLength(1);
  });

  test("pop removes last item from stack", () => {
    const { result } = renderHook(() =>
      useStack<TestItem>([
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ])
    );
    act(() => {
      result.current[1]({ type: "pop" });
    });
    expect(result.current[0]).toEqual([{ id: "a", label: "A" }]);
  });

  test("remove removes item by id", () => {
    const { result } = renderHook(() =>
      useStack<TestItem>([
        { id: "a", label: "A" },
        { id: "b", label: "B" },
        { id: "c", label: "C" },
      ])
    );
    act(() => {
      result.current[1]({ type: "remove", id: "b" });
    });
    expect(result.current[0]).toEqual([
      { id: "a", label: "A" },
      { id: "c", label: "C" },
    ]);
  });

  test("update updates item properties by id", () => {
    const { result } = renderHook(() =>
      useStack<TestItem>([
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ])
    );
    act(() => {
      result.current[1]({
        type: "update",
        item: { id: "b", label: "Updated" },
      });
    });
    expect(result.current[0]).toEqual([
      { id: "a", label: "A" },
      { id: "b", label: "Updated" },
    ]);
  });

  test("clear removes all items", () => {
    const { result } = renderHook(() =>
      useStack<TestItem>([
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ])
    );
    act(() => {
      result.current[1]({ type: "clear" });
    });
    expect(result.current[0]).toEqual([]);
  });

  test("pop on empty stack does nothing", () => {
    const { result } = renderHook(() => useStack<TestItem>());
    act(() => {
      result.current[1]({ type: "pop" });
    });
    expect(result.current[0]).toEqual([]);
  });

  test("push multiple items builds stack in order", () => {
    const { result } = renderHook(() => useStack<TestItem>());
    act(() => {
      result.current[1]({ type: "push", item: { id: "a" } });
    });
    act(() => {
      result.current[1]({ type: "push", item: { id: "b" } });
    });
    act(() => {
      result.current[1]({ type: "push", item: { id: "c" } });
    });
    expect(result.current[0]).toEqual([{ id: "a" }, { id: "b" }, { id: "c" }]);
  });
});
