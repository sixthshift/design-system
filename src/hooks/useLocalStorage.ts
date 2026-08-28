"use client";

import { useCallback, useSyncExternalStore } from "react";

type SetValue<T> = T | ((prev: T) => T);

function getStorageValue<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorageValue<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    window.dispatchEvent(new StorageEvent("storage", { key, newValue: serialized }));
  } catch {
    // Storage full or unavailable
  }
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: SetValue<T>) => void] {
  const subscribe = useCallback(
    (callback: () => void) => {
      const handleStorage = (e: StorageEvent) => {
        if (e.key === key || e.key === null) {
          callback();
        }
      };

      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    },
    [key]
  );

  const getSnapshot = useCallback(() => {
    return JSON.stringify(getStorageValue(key, defaultValue));
  }, [key, defaultValue]);

  const getServerSnapshot = useCallback(() => {
    return JSON.stringify(defaultValue);
  }, [defaultValue]);

  const storedValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (value: SetValue<T>) => {
      const currentValue = getStorageValue(key, defaultValue);
      const newValue = value instanceof Function ? value(currentValue) : value;
      setStorageValue(key, newValue);
    },
    [key, defaultValue]
  );

  return [JSON.parse(storedValue) as T, setValue];
}
