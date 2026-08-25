import type { StackItem } from "@sixthshift/design-system/hooks";
import { Toast, type ToastProps } from "@sixthshift/design-system/toast";
import { type FunctionComponent, useCallback, useId, useMemo } from "react";
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

  // Memoize toastProps to prevent unnecessary re-renders when props values haven't changed
  const toastPropsKey = (() => {
    try {
      return JSON.stringify(toastPropsRaw);
    } catch {
      // Props may contain non-serializable values (e.g. React elements with circular refs)
      return toastPropsRaw;
    }
  })();
  const toastProps = useMemo(() => toastPropsRaw, [toastPropsKey]);

  const closeToast = useCallback(() => {
    dispatch({ type: "remove", id, transition: { duration: 300 } });
  }, [dispatch, id]);

  const openToast = useCallback(() => {
    const component = customComponent ?? Toast;

    dispatch({
      type: "push",
      item: {
        id,
        component,
        onClose: closeToast,
        standalone: false, // OverlayContext handles positioning
        ...toastProps,
      } as ToastStackItem,
    });

    // Auto-dismiss if duration is set
    if (duration > 0) {
      setTimeout(closeToast, duration);
    }
  }, [dispatch, id, customComponent, toastProps, closeToast, duration]);

  return {
    openToast,
    closeToast,
  };
};
