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

  const id = useId();

  const customComponent = isFunction(args) ? args : null;
  const props = isPlainObject(args) ? args : ({} as ToastPropsWithDuration);
  const { duration = DEFAULT_DURATION, ...toastPropsRaw } = props;

  const closeToast = useCallback(() => {
    dispatch({ type: "remove", id, transition: { duration: 300 } });
  }, [dispatch, id]);

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

    dispatch({
      type: "push",
      item: {
        id,
        component: component ?? Toast,
        onClose: closeToast,
        standalone: false, // OverlayContext handles positioning
        ...toastProps,
      } as ToastStackItem,
    });

    // Auto-dismiss if duration is set
    if (autoDismiss > 0) {
      setTimeout(closeToast, autoDismiss);
    }
  }, [dispatch, id, closeToast]);

  return {
    openToast,
    closeToast,
  };
};
