import { FloatingFocusManager, FloatingOverlay, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import { useMergedFloatingRef, usePresence } from "@sixthshift/design-system/hooks";
import { cn } from "@sixthshift/design-system/utils";
import { type HTMLAttributes, type ReactNode, useCallback, useContext, useEffect, useMemo } from "react";
import { ModalBody, ModalContext, ModalFooter, ModalHeader } from "./components";

// =============================================================================
// Types
// =============================================================================

export type ModalProps = Pick<HTMLAttributes<HTMLDivElement>, "className" | "style"> & {
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

const ModalRoot = ({ onOpenChange, size = "md", className, style, children, dismissable = true, closable, align = "center" }: ModalProps) => {
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

  const mergedRef = useMergedFloatingRef(refs, presenceRef);

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

  const modalContextValue = useMemo(() => ({ onClose: handleClose, closable }), [closable, handleClose]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isMounted) return null;

  const isEntering = state === "entering";
  const isExiting = state === "exiting";

  return (
    <FloatingFocusManager context={context} modal>
      <FloatingOverlay lockScroll className={cn("fixed inset-0 z-modal bg-bg-overlay", isEntering && "animate-fade-in", isExiting && "animate-fade-out")}>
        <div
          ref={mergedRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          data-state={state}
          className={cn(
            "fixed flex flex-col overflow-hidden outline-hidden",
            "rounded-xl border border-border-normal bg-bg-normal",
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
};
ModalRoot.displayName = "Modal";

// =============================================================================
// Compound Component Export
// =============================================================================

export const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
});
