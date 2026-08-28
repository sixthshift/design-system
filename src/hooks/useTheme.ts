"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "theme";
const listeners = new Set<() => void>();

function emit(): void {
  for (const fn of listeners) fn();
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readTheme(): Theme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return "system";
    const parsed = JSON.parse(raw);
    if (parsed === "light" || parsed === "dark" || parsed === "system") return parsed;
    return "system";
  } catch {
    return "system";
  }
}

function writeTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  } catch {
    // Storage full or unavailable
  }
  paint(theme);
  emit();
}

function paint(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme === "system" ? getSystemTheme() : theme;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): Theme {
  return readTheme();
}

function getServerSnapshot(): Theme {
  return "system";
}

/**
 * Apply the stored theme now, and subscribe to OS color-scheme changes and
 * cross-tab `storage` events. If nothing is stored yet, seeds `"system"` so
 * the source of truth always exists. Call once at app bootstrap.
 */
export function bootstrapTheme(): () => void {
  const theme = readTheme();
  if (!localStorage.getItem(STORAGE_KEY)) {
    writeTheme("system");
  }
  paint(theme);

  if (typeof window === "undefined") return () => {};

  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (readTheme() === "system") {
      paint("system");
      emit();
    }
  };
  mq.addEventListener("change", onSystemChange);

  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    paint(readTheme());
    emit();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    mq.removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Read/write theme hook. Reads from localStorage via useSyncExternalStore; no effects. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const resolvedTheme: ResolvedTheme = theme === "system" ? getSystemTheme() : theme;

  const setTheme = useCallback((next: Theme) => writeTheme(next), []);
  const toggleTheme = useCallback(() => {
    writeTheme(readTheme() === "dark" ? "light" : "dark");
  }, []);

  return { theme, setTheme, resolvedTheme, toggleTheme };
}
