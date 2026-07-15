import { FloatingFocusManager, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import { useMergedFloatingRef, usePresence } from "@sixthshift/ui/hooks";
import { cn } from "@sixthshift/ui/utils";
import { type HTMLAttributes, type ReactNode, useCallback, useEffect, useMemo } from "react";
import { SheetBody, SheetContext, SheetFooter, SheetHeader } from "./components";

// =============================================================================
// Types
// =============================================================================

export type SheetProps = Pick<HTMLAttributes<HTMLDivElement>, "className" | "style"> & {
  /** Whether the sheet is open. Sheet owns its own mount lifecycle so exit animations can play. */
  open: boolean;
  /** Called when the sheet requests a state change (Esc, outside press, X button). */
  onOpenChange: (open: boolean) => void;
  /** Which edge the sheet slides in from */
  side?: "right" | "left";
  /** Sheet width on desktop — mobile is always full width */
  size?: "sm" | "md" | "lg";
  /** When true (default), Esc closes the sheet. */
  dismissable?: boolean;
  /** When true, clicking outside the sheet closes it. Defaults to false — Sheet is a persistent workspace, not a transient popover. */
  dismissOnOutsidePress?: boolean;
  /** When true, shows a close (X) button in the header */
  closable?: boolean;
  /** Children — use Sheet.Header, Sheet.Body, Sheet.Footer */
  children: ReactNode;
};

// =============================================================================
// Size classes
// =============================================================================

const sizeClasses = {
  sm: "sm:w-[22rem]",
  md: "sm:w-[30rem]",
  lg: "sm:w-[40rem]",
};

// =============================================================================
// Sheet
// =============================================================================

const SheetRoot = ({
  open,
  onOpenChange,
  side = "right",
  size = "md",
  dismissable = true,
  dismissOnOutsidePress = false,
  closable,
  className,
  style,
  children,
}: SheetProps) => {
  const { ref: presenceRef, state, isMounted, show, hide } = usePresence();

  // Drive presence from the controlled `open` prop.
  // When `open` flips to false, we play the exit animation, then unmount.
  useEffect(() => {
    if (open) {
      show();
    } else if (isMounted) {
      hide();
    }
  }, [open, isMounted, show, hide]);

  const requestClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const { refs, context } = useFloating({
    open,
    onOpenChange: (nextOpen) => {
      if (!nextOpen) requestClose();
    },
  });

  const mergedRef = useMergedFloatingRef(refs, presenceRef);

  const dismiss = useDismiss(context, {
    enabled: dismissable,
    escapeKey: true,
    outsidePress: dismissOnOutsidePress,
    outsidePressEvent: "mousedown",
  });

  const role = useRole(context, { role: "dialog" });

  const { getFloatingProps } = useInteractions([dismiss, role]);

  const sheetContextValue = useMemo(() => ({ onClose: requestClose, closable }), [requestClose, closable]);

  if (!isMounted) return null;

  const isEntering = state === "entering";
  const isExiting = state === "exiting";

  return (
    <FloatingFocusManager context={context} modal={false}>
      <div
        ref={mergedRef}
        tabIndex={-1}
        data-state={state}
        data-side={side}
        className={cn(
          "fixed top-0 bottom-0 z-sheet flex flex-col overflow-hidden bg-bg-normal outline-hidden",
          "border-border-normal shadow-lg",
          side === "right" ? "right-0 border-l" : "left-0 border-r",
          sizeClasses[size],
          "max-sm:inset-x-0",
          isEntering && side === "right" && "animate-slide-right-in",
          isExiting && side === "right" && "animate-slide-right-out",
          isEntering && side === "left" && "animate-slide-left-in",
          isExiting && side === "left" && "animate-slide-left-out",
          className
        )}
        style={style}
        {...getFloatingProps({})}
      >
        <SheetContext.Provider value={sheetContextValue}>{children}</SheetContext.Provider>
      </div>
    </FloatingFocusManager>
  );
};
SheetRoot.displayName = "Sheet";

// =============================================================================
// Compound Component Export
// =============================================================================

export const Sheet = Object.assign(SheetRoot, {
  Header: SheetHeader,
  Body: SheetBody,
  Footer: SheetFooter,
});
