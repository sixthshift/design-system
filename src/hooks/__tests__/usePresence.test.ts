import { act, renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { usePresence } from "../usePresence";

describe("usePresence", () => {
  test("starts in hidden state with isMounted false", () => {
    const { result } = renderHook(() => usePresence());
    expect(result.current.state).toBe("hidden");
    expect(result.current.isMounted).toBe(false);
    expect(result.current.isVisible).toBe(false);
  });

  test("show transitions state to entering and isMounted to true", () => {
    const { result } = renderHook(() => usePresence());

    act(() => {
      result.current.show();
    });

    expect(result.current.state).toBe("entering");
    expect(result.current.isMounted).toBe(true);
  });

  test("hide transitions state to exiting", () => {
    const { result } = renderHook(() => usePresence());

    act(() => {
      result.current.show();
    });

    act(() => {
      result.current.hide();
    });

    expect(result.current.state).toBe("exiting");
  });

  test("isVisible is true during entering and visible states", () => {
    const { result } = renderHook(() => usePresence());
    const el = document.createElement("div");

    // hidden -> isVisible false
    expect(result.current.isVisible).toBe(false);

    // entering -> isVisible true
    act(() => {
      result.current.show();
    });
    expect(result.current.isVisible).toBe(true);

    // visible -> isVisible true
    act(() => {
      result.current.ref(el);
    });
    act(() => {
      el.dispatchEvent(new Event("animationend"));
    });
    expect(result.current.state).toBe("visible");
    expect(result.current.isVisible).toBe(true);

    // exiting -> isVisible false
    act(() => {
      result.current.hide();
    });
    expect(result.current.isVisible).toBe(false);
  });

  test("isMounted is true during entering, visible, and exiting states", () => {
    const { result } = renderHook(() => usePresence());
    const el = document.createElement("div");

    // hidden -> isMounted false
    expect(result.current.isMounted).toBe(false);

    // entering -> isMounted true
    act(() => {
      result.current.show();
    });
    expect(result.current.isMounted).toBe(true);

    // visible -> isMounted true
    act(() => {
      result.current.ref(el);
    });
    act(() => {
      el.dispatchEvent(new Event("animationend"));
    });
    expect(result.current.state).toBe("visible");
    expect(result.current.isMounted).toBe(true);

    // exiting -> isMounted true
    act(() => {
      result.current.hide();
    });
    expect(result.current.state).toBe("exiting");
    expect(result.current.isMounted).toBe(true);
  });

  test("transitions from entering to visible on animationend", () => {
    const { result } = renderHook(() => usePresence());
    const el = document.createElement("div");

    act(() => {
      result.current.show();
    });
    act(() => {
      result.current.ref(el);
    });

    expect(result.current.state).toBe("entering");

    act(() => {
      el.dispatchEvent(new Event("animationend"));
    });

    expect(result.current.state).toBe("visible");
  });

  test("hide callback is invoked after exiting animation completes", () => {
    const { result } = renderHook(() => usePresence());
    const el = document.createElement("div");
    let callbackInvoked = false;

    act(() => {
      result.current.show();
    });
    act(() => {
      result.current.ref(el);
    });
    act(() => {
      el.dispatchEvent(new Event("animationend"));
    });

    expect(result.current.state).toBe("visible");

    act(() => {
      result.current.hide(() => {
        callbackInvoked = true;
      });
    });

    expect(result.current.state).toBe("exiting");
    expect(callbackInvoked).toBe(false);

    act(() => {
      el.dispatchEvent(new Event("animationend"));
    });

    expect(result.current.state).toBe("hidden");
    expect(callbackInvoked).toBe(true);
  });
});
