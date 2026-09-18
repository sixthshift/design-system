"use client";

import { FloatingPortal, type FloatingPortalProps } from "@floating-ui/react";
import { Toast } from "@sixthshift/design-system/toast";
import { cn } from "@sixthshift/design-system/utils";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { toastStore as defaultStore, type ToastRecord, type ToastStore } from "./toastStore";

const EMPTY: readonly ToastRecord[] = [];

/** The store's stack, re-rendering the caller as it changes. Empty during server rendering. */
export function useToasts(store: ToastStore = defaultStore): readonly ToastRecord[] {
  return useSyncExternalStore(store.subscribe, store.snapshot, () => EMPTY);
}

/**
 * One toast in the stack: the dismissal timer lives here, not in the store,
 * so the store stays free of the DOM. Expiry and the X button take the same
 * path — `open` flips false, `Toast` plays its exit, and `onClose` drops the
 * record once the animation ends.
 */
function ToastItem({ record, store }: { record: ToastRecord; store: ToastStore }) {
  const { id, duration, closing } = record;
  // `duration` is the stack's to act on, not the toast's to render.
  const { component: Component = Toast, duration: _duration, ...props } = record.options;

  useEffect(() => {
    if (duration <= 0 || closing) return;
    const timer = setTimeout(() => store.close(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, closing, store]);

  const onClose = useCallback(() => store.remove(id), [store, id]);

  return (
    <div className="pointer-events-auto" data-toast-id={id} data-toast-intent={props.intent ?? "neutral"}>
      <Component {...props} standalone={false} open={!closing} onClose={onClose} />
    </div>
  );
}

export type ToastStackProps = {
  /** The stack to render. Default: the app's one, which `toast()` opens onto. */
  store?: ToastStore | undefined;
  /** Portal root (default: `document.body`). */
  root?: FloatingPortalProps["root"] | undefined;
  /** Merged over the container's classes, so an app can move the stack (above a bottom bar, to a corner). */
  className?: string | undefined;
};

/** The container's own classes: bottom centre, newest at the bottom, click-through between toasts. */
export const TOAST_STACK_CLASS = "pointer-events-none fixed bottom-6 left-1/2 z-toast flex -translate-x-1/2 flex-col-reverse items-center gap-3";

/**
 * The open toasts, portalled and positioned. `OverlayProvider` renders one;
 * render it yourself only when there is no provider to host it.
 */
export function ToastStack({ store = defaultStore, root, className }: ToastStackProps) {
  const toasts = useToasts(store);
  if (toasts.length === 0) return null;
  // `root` omitted rather than passed as `undefined`: see OverlayContext's `rootProp`.
  return (
    <FloatingPortal {...(root === undefined ? {} : { root })}>
      <div className={cn(TOAST_STACK_CLASS, className)} data-toast-stack="" data-count={toasts.length}>
        {toasts.map((record) => (
          <ToastItem key={record.id} record={record} store={store} />
        ))}
      </div>
    </FloatingPortal>
  );
}
