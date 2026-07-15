import { autoUpdate, flip, offset, type Placement, shift, useDismiss, useFloating, useFocus, useHover, useInteractions, useRole } from "@floating-ui/react";
import { useControllableState } from "@sixthshift/ui/hooks";
import { TooltipBody } from "./components/TooltipBody";
import { TooltipContext } from "./components/TooltipContext";
import { TooltipTrigger } from "./components/TooltipTrigger";

export type TooltipProps = {
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Placement of the tooltip relative to trigger */
  placement?: Placement;
  /** Delay before showing tooltip (ms) */
  delayShow?: number;
  /** Delay before hiding tooltip (ms) */
  delayHide?: number;
  /** Offset from the trigger in pixels */
  offsetPx?: number;
  /** Children - compound components */
  children: React.ReactNode;
};

const TooltipRoot = ({ open: controlledOpen, onOpenChange, placement = "top", delayShow = 300, delayHide = 0, offsetPx = 8, children }: TooltipProps) => {
  const [open, setOpen] = useControllableState({
    value: controlledOpen,
    defaultValue: false,
    onChange: onOpenChange,
  });

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    middleware: [offset(offsetPx), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    delay: { open: delayShow, close: delayHide },
    move: false,
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  const contextValue = {
    open,
    refs: {
      setReference: refs.setReference,
      setFloating: refs.setFloating,
    },
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
  };

  return <TooltipContext.Provider value={contextValue}>{children}</TooltipContext.Provider>;
};

export const Tooltip = Object.assign(TooltipRoot, {
  Trigger: TooltipTrigger,
  Body: TooltipBody,
});
