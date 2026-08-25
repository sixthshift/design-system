import { useCallback, useRef } from "react";

/**
 * Returns a debounced version of the callback.
 * The callback is invoked after `delay` ms of inactivity.
 */
export const useDebouncedCallback = <T extends (...args: never[]) => void>(callback: T, delay: number): T => {
  // Passed explicitly: React 19's types dropped the zero-argument `useRef`
  // overload, so the initial value has to be spelled out to build on both 18 and 19.
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    ((...args: Parameters<T>) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callbackRef.current(...args), delay);
    }) as T,
    [delay]
  );
};
