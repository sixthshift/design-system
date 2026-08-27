import { autoUpdate, flip, offset, type Placement, safePolygon, shift, useDismiss, useFloating, useFocus, useHover, useInteractions } from "@floating-ui/react";
import { useControllableState } from "@sixthshift/design-system/hooks";
import type * as React from "react";
import { HoverCardContent } from "./components/HoverCardContent";
import { HoverCardContext } from "./components/HoverCardContext";
import { HoverCardTrigger } from "./components/HoverCardTrigger";

export type HoverCardProps = {
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Default open state for uncontrolled mode */
  defaultOpen?: boolean;
  /** Placement relative to trigger */
  placement?: Placement;
  /** Delay before showing (ms). Defaults to 500ms — longer than a tooltip so hover-cards don't pop on incidental hover. */
  delayShow?: number;
  /** Delay before hiding (ms). Defaults to 200ms. */
  delayHide?: number;
  /** Offset from trigger in pixels */
  offsetPx?: number;
  /** Children — compound components */
  children: React.ReactNode;
};

const HoverCardRoot = ({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  placement = "bottom-start",
  delayShow = 500,
  delayHide = 200,
  offsetPx = 8,
  children,
}: HoverCardProps) => {
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

  const hover = useHover(context, {
    delay: { open: delayShow, close: delayHide },
    handleClose: safePolygon(),
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss]);

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

  return <HoverCardContext.Provider value={contextValue}>{children}</HoverCardContext.Provider>;
};

type HoverCardComponent = typeof HoverCardRoot & {
  Trigger: typeof HoverCardTrigger;
  Content: typeof HoverCardContent;
};

/**
 * NOTE: Storybook shows the copy in HoverCard.stories.tsx
 * (`parameters.docs.description.component`), not this comment. react-docgen
 * cannot extract a description from this declaration shape, so keeping a
 * second copy here would only drift. Edit the stories file.
 */
export const HoverCard: HoverCardComponent = Object.assign(HoverCardRoot, {
  Trigger: HoverCardTrigger,
  Content: HoverCardContent,
});
