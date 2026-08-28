"use client";

import { FloatingFocusManager, FloatingOverlay, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import { useMergedFloatingRef, usePresence } from "@sixthshift/design-system/hooks";
import { cn } from "@sixthshift/design-system/utils";
import { forwardRef, type HTMLAttributes, type ReactNode, useCallback, useContext, useEffect, useId, useMemo, useState } from "react";
import { ModalBody, ModalContext, ModalFooter, ModalHeader } from "./components";

// =============================================================================
// Types
// =============================================================================

export type ModalProps = Pick<HTMLAttributes<HTMLDivElement>, "className" | "style" | "aria-label" | "aria-labelledby" | "aria-describedby"> & {
  /**
   * Called when the modal's open state should change. Today Modal is mount-driven
   * (parent conditionally renders), so this fires only with `false` on dismissal.
   * The signature matches Popover/Tooltip/HoverCard/Tabs for API consistency and
   * leaves room to evolve Modal into a state-driven primitive later.
   */
  onOpenChange?: (open: boolean) => void;
  /** Modal size */
  size?: "sm" | "md" | "lg" | "full";
  /** Children - use Modal.Header, Modal.Body, Modal.Footer */
  children: ReactNode;
  /**
   * When true (default), clicking outside closes the modal.
   * When false, the modal can only be closed programmatically.
   * Note: Escape key is handled by OverlayContext for proper stack ordering.
   */
  dismissable?: boolean;
  /** When true, shows a close (X) button in the modal header */
  closable?: boolean;
  /** Vertical alignment on desktop. "center" (default) or "top" (anchored near top, content grows down) */
  align?: "center" | "top";
};

// =============================================================================
// Size classes
// =============================================================================

const sizeClasses = {
  sm: "sm:w-80",
  md: "sm:w-[28rem]",
  lg: "sm:w-[36rem]",
  full: "sm:w-[95%] sm:h-[95%]",
};

// =============================================================================
// Modal
// =============================================================================

const ModalRoot = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      onOpenChange,
      size = "md",
      className,
      style,
      children,
      dismissable = true,
      closable,
      align = "center",
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
    },
    ref
  ) => {
    // Prefer explicit prop over context (context is set by useModal's overlay system)
    const contextValue = useContext(ModalContext);
    // Context provides a parameterless onClose for programmatic modals; adapt to the boolean shape.
    const handleDismiss = useCallback(() => {
      if (onOpenChange) onOpenChange(false);
      else contextValue?.onClose();
    }, [onOpenChange, contextValue]);

    const { ref: presenceRef, state, isMounted, show, hide } = usePresence();

    useEffect(() => {
      show();
    }, [show]);

    const handleClose = useCallback(() => {
      hide(handleDismiss);
    }, [handleDismiss, hide]);

    const { refs, context } = useFloating({
      open: true,
      onOpenChange: (nextOpen) => {
        if (!nextOpen) handleClose();
      },
    });

    const mergedRef = useMergedFloatingRef<HTMLDivElement>(refs, presenceRef, ref);

    const dismiss = useDismiss(context, {
      enabled: dismissable,
      // OverlayContext handles escape key for proper stack ordering
      escapeKey: false,
      outsidePress: true,
      outsidePressEvent: "mousedown",
    });

    const role = useRole(context, {
      role: "dialog",
    });

    const { getFloatingProps } = useInteractions([dismiss, role]);

    // The dialog names itself from its header. `Modal.Header` stamps `titleId`
    // on itself and reports back, so a headerless modal falls through to the
    // caller's `aria-label` instead of referencing an id that isn't there.
    const titleId = useId();
    const [hasTitle, setHasTitle] = useState(false);
    const registerTitle = useCallback((present: boolean) => setHasTitle(present), []);

    // `aria-labelledby` beats `aria-label` in the name computation, so a caller
    // who passes a label must not also be pointed at the header — they would
    // never see their own string win.
    const labelledBy = ariaLabelledBy ?? (ariaLabel || !hasTitle ? undefined : titleId);

    const modalContextValue = useMemo(() => ({ onClose: handleClose, closable, titleId, registerTitle }), [closable, handleClose, titleId, registerTitle]);

    if (!isMounted) return null;

    const isEntering = state === "entering";
    const isExiting = state === "exiting";

    return (
      <FloatingFocusManager context={context} modal>
        <FloatingOverlay
          lockScroll
          className={cn("modal-overlay fixed inset-0 z-modal bg-(--modal-overlay-bg)", isEntering && "animate-fade-in", isExiting && "animate-fade-out")}
        >
          <div
            ref={mergedRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            aria-labelledby={labelledBy}
            aria-describedby={ariaDescribedBy}
            tabIndex={-1}
            data-state={state}
            className={cn(
              "modal fixed flex flex-col overflow-hidden outline-hidden",
              "border-(color:--modal-border) rounded-xl border bg-(--modal-bg)",
              // Size
              sizeClasses[size],
              // Cap height so ModalBody scrolls instead of overflowing the viewport
              "max-h-[95%]",
              // Mobile: slide up from bottom, full width
              "max-sm:inset-x-0 max-sm:bottom-0 max-sm:rounded-b-none",
              isEntering && "max-sm:animate-slide-up-in",
              isExiting && "max-sm:animate-slide-up-out",
              // Desktop: horizontal center + vertical alignment
              "sm:left-1/2 sm:-translate-x-1/2",
              align === "center" && "sm:top-1/2 sm:-translate-y-1/2",
              align === "top" && "sm:top-[15vh]",
              isEntering && "sm:animate-fade-in",
              isExiting && "sm:animate-fade-out",
              className
            )}
            style={style}
            {...getFloatingProps({})}
          >
            <ModalContext.Provider value={modalContextValue}>{children}</ModalContext.Provider>
          </div>
        </FloatingOverlay>
      </FloatingFocusManager>
    );
  }
);
ModalRoot.displayName = "Modal";

// =============================================================================
// Compound Component Export
// =============================================================================

/**
 * A centered, backdrop-dimmed dialog that fully interrupts the page — the
 * background stays visually present but the user can't reach it. Reach for
 * `Modal` when the interruption should own the user's attention completely
 * (a confirmation, a focused form); reach for `Sheet` when the page behind
 * should stay visible and interactive, or `Popover` when there's no need for
 * a backdrop at all.
 *
 * `size` (`"sm" | "md" | "lg" | "full"`, default `"md"`) sets the desktop
 * width — every size slides up full-width from the bottom on mobile.
 * `align` positions the desktop dialog `"center"` (default) or `"top"`.
 * `dismissable` (default `true`) governs outside-press only: clicking the
 * backdrop closes the modal unless set to `false`. `closable` shows an X
 * button in `Modal.Header`.
 *
 * Modal is mount-driven — a parent (or `useModal`'s stack) decides whether it
 * renders at all, so there's no `open` prop. `onOpenChange` still exists,
 * firing only with `false` on dismissal, so every overlay in this library
 * shares one open/close shape. Escape is *not* wired inside Modal itself:
 * `OverlayProvider` owns it globally so a stack of modals closes
 * topmost-first. That means Escape only closes a Modal opened through
 * `useModal()` — one a parent mounts directly from its own boolean state
 * won't respond to Escape unless the app wires that separately.
 *
 * Focus moves into the modal on mount and is trapped there
 * (`FloatingFocusManager modal`) until it unmounts, then returns to whatever
 * triggered it. The dialog carries `role="dialog"` and `aria-modal="true"`,
 * and names itself from `Modal.Header` via `aria-labelledby` unless the
 * caller passes their own `aria-label`. It stays mounted through its
 * fade-out exit animation (`usePresence`), so `onOpenChange(false)` fires
 * only after the animation completes.
 *
 * Compound: `Modal.Header` (title + optional close button), `Modal.Body`
 * (scrolls internally so the modal itself never grows past the viewport),
 * `Modal.Footer` (action buttons). None are required.
 */
export const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
});
