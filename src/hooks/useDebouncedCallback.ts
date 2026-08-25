import { useCallback, useRef } from "react";

/**
 * Returns a debounced version of the callback.
 * The callback is invoked after `delay` ms of inactivity.
 */
export const useDebouncedCallback = <T extends (...args: never[]) => void>(callback: T, delay: number): T => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
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
