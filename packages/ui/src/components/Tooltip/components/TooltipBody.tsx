import { FloatingPortal } from "@floating-ui/react";
import { cn } from "@sixthshift/ui/utils";
import * as React from "react";
import { useTooltipContext } from "./TooltipContext";

export type TooltipBodyProps = React.HTMLAttributes<HTMLDivElement>;

export const TooltipBody = React.forwardRef<HTMLDivElement, TooltipBodyProps>(({ className, children, ...props }, forwardedRef) => {
  const { open, refs, floatingStyles, getFloatingProps } = useTooltipContext();

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
        className={cn("z-popover rounded-lg border border-border-normal bg-bg-normal px-2.5 py-1.5 text-fg-normal text-xs shadow-lg", className)}
        {...getFloatingProps(props)}
      >
        {children}
      </div>
    </FloatingPortal>
  );
});
TooltipBody.displayName = "TooltipBody";
