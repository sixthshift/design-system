"use client";

import { useCallback } from "react";
import { useOverlayContext } from "../OverlayContext";
import { toastStore as defaultStore, type ToastOptions } from "../toastStore";

/**
 * Open toasts on the provider's stack, with the content decided at the moment
 * of opening: an error's message, a count, whatever the action produced.
 *
 * @example
 * ```tsx
 * const { openToast } = useToast();
 *
 * async function save() {
 *   try {
 *     await api.save();
 *     openToast({ intent: "success", title: "Saved" });
 *   } catch (error) {
 *     openToast({ intent: "danger", title: "Could not save", children: String(error) });
 *   }
 * }
 * ```
 *
 * Outside any provider this opens on the app's default stack, which is also
 * what the plain `toast()` export uses, so code that is not a component — a
 * store, a callback from a service worker — has the same door.
 */
export const useToast = () => {
  const store = useOverlayContext()?.toastStore ?? defaultStore;

  const openToast = useCallback((options: ToastOptions) => store.open(options), [store]);
  const closeToast = useCallback((id: string) => store.close(id), [store]);
  const closeAllToasts = useCallback(() => store.clear(), [store]);

  return { openToast, closeToast, closeAllToasts };
};
