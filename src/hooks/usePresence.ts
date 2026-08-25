import { type RefCallback, useCallback, useEffect, useRef, useState } from "react";

// =============================================================================
// Types
// =============================================================================

type PresenceState = "hidden" | "entering" | "visible" | "exiting";

type UsePresenceReturn = {
  /** Ref callback to attach to the animated element */
  ref: RefCallback<HTMLElement>;
  /** Current presence state */
  state: PresenceState;
  /** Whether the component should be mounted in the DOM */
  isMounted: boolean;
  /** Whether the component is visible (entering or fully visible) */
  isVisible: boolean;
  /** Call to start showing the component */
  show: () => void;
  /** Call to start hiding the component, with optional callback after animation */
  hide: (onComplete?: () => void) => void;
};

// =============================================================================
// Hook
// =============================================================================

/**
 * Manages mount/unmount presence with CSS animation support.
 *
 * Coordinates component lifecycle with CSS @keyframes animations by listening
 * to `animationend` events. This is more robust than setTimeout because:
 * 1. The browser tells us when the animation actually ends
 * 2. No need to keep JS duration in sync with CSS duration
 * 3. Works correctly even if animations are interrupted
 *
 * @example
 * ```tsx
 * function Modal({ open, onClose }) {
 *   const { ref, state, isMounted, show, hide } = usePresence();
 *
 *   useEffect(() => {
 *     if (open) show();
 *   }, [open, show]);
 *
 *   if (!isMounted) return null;
 *
 *   return (
 *     <div
 *       ref={ref}
 *       data-state={state}
 *       className={cn(
 *         state === "entering" && "animate-fade-in",
 *         state === "exiting" && "animate-fade-out",
 *       )}
 *     >
 *       ...
 *     </div>
 *   );
 * }
 * ```
 */
export function usePresence(): UsePresenceReturn {
  const [state, setState] = useState<PresenceState>("hidden");
  const nodeRef = useRef<HTMLElement | null>(null);
  const onExitCompleteRef = useRef<(() => void) | null>(null);

  // Track if we were exiting to know when to call the callback
  const wasExitingRef = useRef(false);

  // Handle animation end events
  const handleAnimationEnd = useCallback(() => {
    setState((current) => {
      if (current === "entering") return "visible";
      if (current === "exiting") return "hidden";
      return current;
    });
  }, []);

  // Call exit callback after state transitions to hidden (after render completes)
  // This avoids the "Cannot update a component while rendering" warning
  useEffect(() => {
    if (state === "exiting") {
      wasExitingRef.current = true;
    } else if (state === "hidden" && wasExitingRef.current) {
      wasExitingRef.current = false;
      const callback = onExitCompleteRef.current;
      onExitCompleteRef.current = null;
      callback?.();
    }
  }, [state]);

  // Ref callback to manage event listeners
  const ref: RefCallback<HTMLElement> = useCallback(
    (node) => {
      // Cleanup old node
      if (nodeRef.current) {
        nodeRef.current.removeEventListener("animationend", handleAnimationEnd);
      }

      // Setup new node
      nodeRef.current = node;
      if (node) {
        node.addEventListener("animationend", handleAnimationEnd);
      }
    },
    [handleAnimationEnd]
  );

  const show = useCallback(() => {
    setState("entering");
  }, []);

  const hide = useCallback((onComplete?: () => void) => {
    onExitCompleteRef.current = onComplete ?? null;
    setState("exiting");
  }, []);

  return {
    ref,
    state,
    isMounted: state !== "hidden",
    isVisible: state === "visible" || state === "entering",
    show,
    hide,
  };
}
