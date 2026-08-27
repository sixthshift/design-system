import { autoUpdate, flip, offset, type Placement, shift, useClick, useDismiss, useFloating, useInteractions } from "@floating-ui/react";
import { useControllableState } from "@sixthshift/design-system/hooks";
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
  // `Popover.Body` is a `role="dialog"`, and a dialog with no accessible name is
  // announced as just "dialog". There is no title sub-part to read from, so the
  // trigger — which always has a label, because it is what the user clicked —
  // names the popover. A caller passing their own `aria-label`/`aria-labelledby`
  // to `Popover.Body` still wins.
  const triggerId = `popover-trigger-${id}`;

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
    triggerId,
  };

  return <PopoverContext.Provider value={contextValue}>{children}</PopoverContext.Provider>;
};

/**
 * A click-triggered floating panel anchored to a trigger element, with no
 * backdrop. Reach for `Popover` over `Modal`/`Sheet` when the content is a
 * menu, a small edit form, or info-on-demand that should stay tethered to
 * whatever the user clicked, rather than taking over the page. Reach for
 * `HoverCard` instead when the panel should open passively on hover/focus
 * rather than a click, and for `Tooltip` when it's a short text label rather
 * than a panel with real content.
 *
 * Works both controlled (`open` + `onOpenChange`) and uncontrolled
 * (`defaultOpen`) via `useControllableState`. `placement` (default
 * `"bottom"`) and `offsetPx` (default `8`) position it relative to the
 * trigger through floating-ui's `offset → flip → shift` middleware, which
 * repositions automatically on scroll/resize (`autoUpdate`).
 *
 * Opens via `useClick` and dismisses via `useDismiss` — outside-press and
 * Escape both close it, handled directly by floating-ui rather than
 * `OverlayProvider`, since a Popover isn't part of the modal stack.
 * `Popover.Body` renders in a `FloatingPortal` to `document.body` and hard
 * unmounts (`return null`) when closed — there's no exit animation. It
 * carries `role="dialog"` and, since there's no title slot to read from,
 * names itself from `Popover.Trigger` via `aria-labelledby` unless the
 * caller passes their own `aria-label`/`aria-labelledby`.
 *
 * Compound: `Popover.Trigger` (`asChild` to render the child element as the
 * trigger instead of wrapping it in a `<button>`), `Popover.Body`,
 * `Popover.Close` (a button that calls `onOpenChange(false)` — for a close
 * affordance inside the panel's own content).
 */
export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Body: PopoverBody,
  Close: PopoverClose,
});
