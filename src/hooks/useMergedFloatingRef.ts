import { useCallback } from "react";
import type { WritableRefObject } from "../internal/types";

type FloatingRefs = {
  setFloating: (node: HTMLElement | null) => void;
};

type PresenceRef = (node: HTMLElement | null) => void;

type ConsumerRef<T extends HTMLElement> = React.Ref<T> | undefined;

/**
 * Merges a floating-ui ref, a usePresence ref, and an optional consumer ref
 * into a single callback ref. Used by Modal, Sheet, and Toast.
 */
export function useMergedFloatingRef<T extends HTMLElement = HTMLElement>(floatingRefs: FloatingRefs, presenceRef: PresenceRef, consumerRef?: ConsumerRef<T>) {
  return useCallback(
    (node: T | null) => {
      floatingRefs.setFloating(node);
      presenceRef(node);
      if (typeof consumerRef === "function") {
        consumerRef(node);
      } else if (consumerRef && "current" in consumerRef) {
        (consumerRef as WritableRefObject<T | null>).current = node;
      }
    },
    [floatingRefs, presenceRef, consumerRef]
  );
}
