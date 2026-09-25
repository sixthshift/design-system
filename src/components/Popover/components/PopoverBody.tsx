"use client";

import { FloatingPortal } from "@floating-ui/react";
import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";
import { usePopoverContext } from "./PopoverContext";

export type PopoverBodyProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Name of a brand the theme defines, rendered as `data-brand`. Omitted, the
   * body copies the brand scope of its trigger, which the portal would
   * otherwise leave behind.
   */
  brand?: string | undefined;
};

export const PopoverBody = React.forwardRef<HTMLDivElement, PopoverBodyProps>(({ className, brand, children, ...props }, forwardedRef) => {
  const { open, refs, floatingStyles, inheritedBrand, getFloatingProps, contentId, triggerId } = usePopoverContext();

  // `aria-labelledby` outranks `aria-label` in the name computation, so the
  // trigger only names the dialog when the caller hasn't named it themselves.
  const hasOwnLabel = props["aria-label"] !== undefined || props["aria-labelledby"] !== undefined;

  if (!open) return null;

  return (
    <FloatingPortal>
      <div
        ref={(node) => {
          refs.setFloating(node);
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        id={contentId}
        role="dialog"
        aria-labelledby={hasOwnLabel ? undefined : triggerId}
        style={floatingStyles}
        data-brand={brand ?? inheritedBrand}
        className={cn("z-popover rounded-lg border border-border-normal bg-bg-normal p-4 shadow-lg", className)}
        {...getFloatingProps(props)}
      >
        {children}
      </div>
    </FloatingPortal>
  );
});
PopoverBody.displayName = "PopoverBody";
