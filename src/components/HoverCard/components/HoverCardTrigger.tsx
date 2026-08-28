"use client";

import * as React from "react";
import { Slot } from "../../../internal/Slot";
import type { WritableRefObject } from "../../../internal/types";
import { useHoverCardContext } from "./HoverCardContext";

export type HoverCardTriggerProps = React.HTMLAttributes<HTMLElement> & {
  /** Render as child element (default true — hover-cards typically wrap an existing inline element). */
  asChild?: boolean;
};

export const HoverCardTrigger = React.forwardRef<HTMLElement, HoverCardTriggerProps>(({ asChild = true, children, className, ...props }, forwardedRef) => {
  const { refs, getReferenceProps } = useHoverCardContext();
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      ref={(node: HTMLElement | null) => {
        refs.setReference(node);
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) (forwardedRef as WritableRefObject<HTMLElement | null>).current = node;
      }}
      // When rendering as a span wrapper (not asChild), use block layout so the
      // bounding box matches the wrapped element. Without this, the span has
      // inline layout and floating-ui anchors to the wrong position.
      className={asChild ? className : `block ${className ?? ""}`.trim()}
      {...getReferenceProps(props)}
    >
      {children}
    </Comp>
  );
});
HoverCardTrigger.displayName = "HoverCardTrigger";
