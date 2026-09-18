import { describe, expect, it, vi } from "vitest";
import { createToastStore, DEFAULT_MAX_TOASTS, DEFAULT_TOAST_DURATION, defaultToastDuration } from "./toastStore";

/** Ids in open order, so assertions can name them. */
function counter(): () => string {
  let n = 0;
  return () => `t${++n}`;
}

describe("defaultToastDuration", () => {
  it("failures stay until dismissed; everything else expires", () => {
    expect(defaultToastDuration("danger")).toBe(0);
    for (const intent of ["neutral", "success", "warning", undefined] as const) expect(defaultToastDuration(intent)).toBe(DEFAULT_TOAST_DURATION);
  });
});

describe("createToastStore", () => {
  it("open appends, resolves the duration, notifies, and hands back a handle", () => {
    const store = createToastStore({ newId: counter() });
    const listener = vi.fn();
    store.subscribe(listener);

    const handle = store.open({ intent: "success", title: "Saved" });
    expect(handle.id).toBe("t1");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.snapshot()).toEqual([{ id: "t1", options: { intent: "success", title: "Saved" }, duration: DEFAULT_TOAST_DURATION, closing: false }]);

    store.open({ intent: "danger", title: "Failed" });
    store.open({ title: "Quick", duration: 10 });
    expect(store.snapshot().map((record) => record.duration)).toEqual([DEFAULT_TOAST_DURATION, 0, 10]);
  });

  it("the snapshot is reference-stable between changes, and empty is one shared value", () => {
    const store = createToastStore();
    const empty = store.snapshot();
    expect(store.snapshot()).toBe(empty);
    const { id } = store.open({ title: "A" });
    const once = store.snapshot();
    expect(store.snapshot()).toBe(once);
    store.remove(id);
    expect(store.snapshot()).toBe(empty);
  });

  it("past max the oldest is dropped at once", () => {
    const store = createToastStore({ newId: counter() });
    for (let n = 0; n < DEFAULT_MAX_TOASTS + 2; n++) store.open({ title: `A${n}` });
    expect(store.snapshot()).toHaveLength(DEFAULT_MAX_TOASTS);
    expect(store.snapshot()[0]?.id).toBe("t3");

    const two = createToastStore({ max: 2 });
    for (let n = 0; n < 5; n++) two.open({ title: `A${n}` });
    expect(two.snapshot().map((record) => record.options.title)).toEqual(["A3", "A4"]);
  });

  it("close marks a toast closing once; remove drops it; unknown ids change nothing and notify no one", () => {
    const store = createToastStore({ newId: counter() });
    const a = store.open({ title: "A" });
    store.open({ title: "B" });
    const listener = vi.fn();
    store.subscribe(listener);

    a.close();
    expect(store.snapshot().map((record) => [record.id, record.closing])).toEqual([
      ["t1", true],
      ["t2", false],
    ]);
    expect(listener).toHaveBeenCalledTimes(1);

    store.close("t1");
    store.close("nope");
    store.remove("nope");
    expect(listener).toHaveBeenCalledTimes(1);

    store.remove("t1");
    expect(store.snapshot().map((record) => record.id)).toEqual(["t2"]);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("clear begins every exit, and does nothing when there is nothing left to begin", () => {
    const store = createToastStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.clear();
    expect(listener).not.toHaveBeenCalled();

    store.open({ title: "A" });
    store.open({ title: "B" });
    store.clear();
    expect(store.snapshot().every((record) => record.closing)).toBe(true);
    expect(listener).toHaveBeenCalledTimes(3);

    store.clear();
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it("unsubscribe stops the listener", () => {
    const store = createToastStore();
    const listener = vi.fn();
    store.subscribe(listener)();
    store.open({ title: "A" });
    expect(listener).not.toHaveBeenCalled();
  });
});
