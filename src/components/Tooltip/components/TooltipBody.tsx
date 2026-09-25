"use client";

import { FloatingPortal } from "@floating-ui/react";
import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";
import { useTooltipContext } from "./TooltipContext";

export type TooltipBodyProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Name of a brand the theme defines, rendered as `data-brand`. Omitted, the
   * body copies the brand scope of its trigger, which the portal would
   * otherwise leave behind.
   */
  brand?: string | undefined;
};

export const TooltipBody = React.forwardRef<HTMLDivElement, TooltipBodyProps>(({ className, brand, children, ...props }, forwardedRef) => {
  const { open, refs, floatingStyles, inheritedBrand, getFloatingProps } = useTooltipContext();

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
        className={cn("z-popover rounded-lg border border-border-normal bg-bg-normal px-2.5 py-1.5 text-fg-normal text-xs shadow-lg", className)}
        {...getFloatingProps(props)}
      >
        {children}
      </div>
    </FloatingPortal>
  );
});
TooltipBody.displayName = "TooltipBody";
