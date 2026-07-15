import { useCallback, useRef, useState } from "react";

declare const process: undefined | { env?: { NODE_ENV?: string } };

interface UseControllableStateOptions<T> {
  /** Controlled value */
  value?: T | undefined;
  /** Default value for uncontrolled mode */
  defaultValue: T;
  /** Callback when value changes */
  onChange?: ((value: T) => void) | undefined;
}

/**
 * Hook for managing controlled/uncontrolled state pattern.
 * If `value` is provided, the component is controlled.
 * Otherwise, it manages its own internal state starting with `defaultValue`.
 */
export function useControllableState<T>({ value: controlledValue, defaultValue, onChange }: UseControllableStateOptions<T>): [T, (value: T) => void] {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const wasControlledRef = useRef(isControlled);
  if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
    if (wasControlledRef.current && !isControlled) {
      console.warn(
        "useControllableState: switched from controlled to uncontrolled. This usually means `value` changed from a defined value to `undefined`. Decide between controlled and uncontrolled for the lifetime of the component."
      );
    }
    if (!wasControlledRef.current && isControlled) {
      console.warn(
        "useControllableState: switched from uncontrolled to controlled. This usually means `value` changed from `undefined` to a defined value. Use `defaultValue` for uncontrolled components, or provide `value` from the first render."
      );
    }
    if (isControlled && !onChange) {
      console.warn("useControllableState: controlled component has `value` but no `onChange`. The component will be read-only.");
    }
  }
  wasControlledRef.current = isControlled;

  const setValue = useCallback(
    (newValue: T) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange]
  );

  return [value, setValue];
}
