"use client";

import type { StackItem } from "@sixthshift/design-system/hooks";
import { Toast, type ToastProps } from "@sixthshift/design-system/toast";
import { type FunctionComponent, useCallback, useEffect, useId, useRef } from "react";
import { useOverlayContext } from "../OverlayContext";

// Default auto-dismiss duration in milliseconds
const DEFAULT_DURATION = 5000;

// Native replacements for lodash functions
const isFunction = (value: unknown): value is FunctionComponent<ToastProps> => typeof value === "function";

const isPlainObject = (value: unknown): value is ToastPropsWithDuration => typeof value === "object" && value !== null && !Array.isArray(value);

type ToastPropsWithDuration = Omit<ToastProps, "onClose"> & {
  /** Auto-dismiss duration in ms. Set to 0 to disable. Default: 5000 */
  duration?: number;
};

/**
 * Toast stack item - extends base StackItem with component and additional props
 * that are passed through to the Toast component in OverlayContext
 */
type ToastStackItem = StackItem & {
  component: FunctionComponent<ToastProps>;
  onClose?: () => void;
} & Partial<Omit<ToastProps, "onClose">>;

export const useToast = (args: ToastPropsWithDuration | FunctionComponent<ToastProps>) => {
  const {
    toastStack: [, dispatch],
  } = useOverlayContext();

  // Each `openToast()` call mints its own id. The id used to be `useId()`
  // alone — stable per hook instance — so a second call while the first toast
  // was still mounted (or still mid-exit) deduped inside useStack and showed
  // nothing, and the first toast's auto-dismiss timer would close the second.
  const baseId = useId();
  const counterRef = useRef(0);

  const customComponent = isFunction(args) ? args : null;
  const props = isPlainObject(args) ? args : ({} as ToastPropsWithDuration);
  const { duration = DEFAULT_DURATION, ...toastPropsRaw } = props;

  // Live toasts from this hook instance, each with its pending auto-dismiss
  // timer (if any), so closing — manual or unmount — always cancels the timer.
  const openToastsRef = useRef(new Map<string, ReturnType<typeof setTimeout> | null>());

  const closeToastById = useCallback(
    (id: string) => {
      const timer = openToastsRef.current.get(id);
      if (timer) clearTimeout(timer);
      openToastsRef.current.delete(id);
      dispatch({ type: "remove", id, transition: { duration: 300 } });
    },
    [dispatch]
  );

  /** Closes every toast this hook instance has opened. */
  const closeToast = useCallback(() => {
    for (const id of [...openToastsRef.current.keys()]) closeToastById(id);
  }, [closeToastById]);

  useEffect(() => {
    const openToasts = openToastsRef.current;
    return () => {
      for (const timer of openToasts.values()) {
        if (timer) clearTimeout(timer);
      }
      openToasts.clear();
    };
  }, []);

  // `openToast` has to be both referentially stable — callers put it in effect
  // dependency arrays — and able to see the current props. A ref refreshed after
  // every render gives both.
  //
  // It previously memoised the props object against JSON.stringify(props) as a
  // cache key. JSON.stringify silently drops function-valued properties, so a
  // changed `onAction` whose serialisable fields were identical did not
  // invalidate the key, and `openToast` kept firing the stale closure.
  const latest = useRef({ customComponent, toastProps: toastPropsRaw, duration });
  useEffect(() => {
    latest.current = { customComponent, toastProps: toastPropsRaw, duration };
  });

  const openToast = useCallback(() => {
    const { customComponent: component, toastProps, duration: autoDismiss } = latest.current;
    const id = `${baseId}-${counterRef.current++}`;
    const close = () => closeToastById(id);

    dispatch({
      type: "push",
      item: {
        id,
        component: component ?? Toast,
        onClose: close,
        standalone: false, // OverlayContext handles positioning
        ...toastProps,
      } as ToastStackItem,
    });

    // Auto-dismiss if duration is set
    openToastsRef.current.set(id, autoDismiss > 0 ? setTimeout(close, autoDismiss) : null);

    return close;
  }, [dispatch, baseId, closeToastById]);

  return {
    openToast,
    closeToast,
  };
};
