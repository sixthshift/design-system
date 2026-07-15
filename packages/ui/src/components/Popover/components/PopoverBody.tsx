import { FloatingPortal } from "@floating-ui/react";
import { cn } from "@sixthshift/ui/utils";
import * as React from "react";
import { usePopoverContext } from "./PopoverContext";

export type PopoverBodyProps = React.HTMLAttributes<HTMLDivElement>;

export const PopoverBody = React.forwardRef<HTMLDivElement, PopoverBodyProps>(({ className, children, ...props }, forwardedRef) => {
  const { open, refs, floatingStyles, getFloatingProps, contentId } = usePopoverContext();

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
        style={floatingStyles}
        className={cn("z-popover rounded-lg border border-border-normal bg-bg-normal p-4 shadow-lg", className)}
        {...getFloatingProps(props)}
      >
        {children}
      </div>
    </FloatingPortal>
  );
});
PopoverBody.displayName = "PopoverBody";
