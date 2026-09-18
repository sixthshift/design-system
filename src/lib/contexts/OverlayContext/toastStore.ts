import type { ToastProps } from "@sixthshift/design-system/toast";
import type { FunctionComponent } from "react";

// =============================================================================
// Types
// =============================================================================

/** What a caller passes to open a toast: the `Toast`'s own props, plus how long it stays. */
export type ToastOptions = Omit<ToastProps, "onClose" | "open" | "standalone" | "root"> & {
  /**
   * Milliseconds until the toast dismisses itself. `0` keeps it until it is
   * dismissed by hand. Default: `0` for `intent="danger"` (a failure usually
   * carries a message worth reading, and often a retry), `5000` otherwise.
   */
  duration?: number;
  /** Render this instead of `Toast`. It receives `ToastProps` and must honour `open` and `onClose` as `Toast` does. */
  component?: FunctionComponent<ToastProps>;
};

/** One toast as the stack holds it. */
export type ToastRecord = {
  id: string;
  options: ToastOptions;
  /** The resolved lifetime, in ms; `0` sticks. */
  duration: number;
  /** Playing its exit; removed once the animation ends. */
  closing: boolean;
};

/** What `open` hands back: the toast's id, and a way to close it early. */
export type ToastHandle = { id: string; close: () => void };

/**
 * The stack of open toasts, with subscribers. No DOM and no timers: the
 * `ToastStack` that renders it owns dismissal timing, and `Toast` owns the
 * exit animation. Plain functions, so a toast can be opened from anywhere —
 * an event handler, a store, a service-worker callback — not only from a
 * component.
 */
export type ToastStore = {
  /** Register a listener; returns the unsubscribe. */
  subscribe: (listener: () => void) => () => void;
  /** The current stack, oldest first. Reference-stable until it changes, as `useSyncExternalStore` needs. */
  snapshot: () => readonly ToastRecord[];
  /** Add a toast. Past `max`, the oldest is dropped at once. */
  open: (options: ToastOptions) => ToastHandle;
  /** Begin a toast's exit. It leaves the stack when `remove` is called, which `Toast` does after its animation. */
  close: (id: string) => void;
  /** Drop a toast at once. */
  remove: (id: string) => void;
  /** Begin every toast's exit. */
  clear: () => void;
};

export type ToastStoreOptions = {
  /** How many toasts show at once; the oldest falls off. Default: 3 — a short stack reads on a phone. */
  max?: number;
  /** Ids in open order. Injectable so a test can name them. */
  newId?: () => string;
};

// =============================================================================
// Defaults
// =============================================================================

export const DEFAULT_TOAST_DURATION = 5000;
export const DEFAULT_MAX_TOASTS = 3;

/** The lifetime an intent gets when none is given: failures stay, everything else expires. */
export function defaultToastDuration(intent: ToastOptions["intent"]): number {
  return intent === "danger" ? 0 : DEFAULT_TOAST_DURATION;
}

let opened = 0;
const nextId = () => `toast-${++opened}`;

// =============================================================================
// Store
// =============================================================================

const EMPTY: readonly ToastRecord[] = [];

export function createToastStore({ max = DEFAULT_MAX_TOASTS, newId = nextId }: ToastStoreOptions = {}): ToastStore {
  let toasts: readonly ToastRecord[] = EMPTY;
  const listeners = new Set<() => void>();

  const set = (next: readonly ToastRecord[]) => {
    toasts = next.length === 0 ? EMPTY : next;
    for (const listener of [...listeners]) listener();
  };

  const close = (id: string) => {
    const record = toasts.find((toast) => toast.id === id);
    if (record === undefined || record.closing) return;
    set(toasts.map((toast) => (toast === record ? { ...toast, closing: true } : toast)));
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    snapshot: () => toasts,
    open(options) {
      const id = newId();
      const record: ToastRecord = { id, options, duration: options.duration ?? defaultToastDuration(options.intent), closing: false };
      set([...toasts, record].slice(-max));
      return { id, close: () => close(id) };
    },
    close,
    remove(id) {
      const next = toasts.filter((toast) => toast.id !== id);
      if (next.length !== toasts.length) set(next);
    },
    clear() {
      if (toasts.every((toast) => toast.closing)) return;
      set(toasts.map((toast) => ({ ...toast, closing: true })));
    },
  };
}

/** The app's one stack: what `OverlayProvider` renders unless handed another. */
export const toastStore = createToastStore();

/** Open a toast on the app's stack, from anywhere. Returns its id and a way to close it early. */
export function toast(options: ToastOptions): ToastHandle {
  return toastStore.open(options);
}

/** Begin a toast's exit on the app's stack. */
export function closeToast(id: string): void {
  toastStore.close(id);
}

/** Begin every toast's exit on the app's stack. */
export function closeAllToasts(): void {
  toastStore.clear();
}
