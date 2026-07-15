import { autoUpdate, flip, offset, type Placement, shift, useClick, useDismiss, useFloating, useInteractions } from "@floating-ui/react";
import { useControllableState } from "@sixthshift/ui/hooks";
import type * as React from "react";
import { useId } from "react";
import { PopoverBody } from "./components/PopoverBody";
import { PopoverClose } from "./components/PopoverClose";
import { PopoverContext } from "./components/PopoverContext";
import { PopoverTrigger } from "./components/PopoverTrigger";

export type PopoverProps = {
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Default open state for uncontrolled mode */
  defaultOpen?: boolean;
  /** Placement of the popover relative to trigger */
  placement?: Placement;
  /** Offset from the trigger in pixels */
  offsetPx?: number;
  /** Children - compound components */
  children: React.ReactNode;
};

const PopoverRoot = ({ open: controlledOpen, onOpenChange, defaultOpen = false, placement = "bottom", offsetPx = 8, children }: PopoverProps) => {
  const [open, setOpen] = useControllableState({
    value: controlledOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    strategy: "fixed",
    middleware: [offset(offsetPx), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  const id = useId();
  const contentId = `popover-content-${id}`;

  const contextValue = {
    open,
    onOpenChange: setOpen,
    refs: {
      setReference: refs.setReference,
      setFloating: refs.setFloating,
    },
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
    contentId,
  };

  return <PopoverContext.Provider value={contextValue}>{children}</PopoverContext.Provider>;
};

export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Body: PopoverBody,
  Close: PopoverClose,
});
