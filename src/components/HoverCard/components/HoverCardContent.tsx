"use client";

import { FloatingPortal } from "@floating-ui/react";
import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";
import { useHoverCardContext } from "./HoverCardContext";

export type HoverCardContentProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Name of a brand the theme defines, rendered as `data-brand`. Omitted, the
   * body copies the brand scope of its trigger, which the portal would
   * otherwise leave behind.
   */
  brand?: string | undefined;
};

export const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(({ className, brand, children, ...props }, forwardedRef) => {
  const { open, refs, floatingStyles, inheritedBrand, getFloatingProps } = useHoverCardContext();

  if (!open) return null;

  return (
    <FloatingPortal>
      <div
        ref={(node) => {
          refs.setFloating(node);
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        style={floatingStyles}
        data-brand={brand ?? inheritedBrand}
        className={cn("z-popover w-80 rounded-lg border border-border-normal bg-bg-normal p-4 shadow-lg", className)}
        {...getFloatingProps(props)}
      >
        {children}
      </div>
    </FloatingPortal>
  );
});
HoverCardContent.displayName = "HoverCardContent";
