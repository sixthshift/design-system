import { FloatingPortal } from "@floating-ui/react";
import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";
import { useHoverCardContext } from "./HoverCardContext";

export type HoverCardContentProps = React.HTMLAttributes<HTMLDivElement>;

export const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(({ className, children, ...props }, forwardedRef) => {
  const { open, refs, floatingStyles, getFloatingProps } = useHoverCardContext();

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
        className={cn("z-popover w-80 rounded-lg border border-border-normal bg-bg-normal p-4 shadow-lg", className)}
        {...getFloatingProps(props)}
      >
        {children}
      </div>
    </FloatingPortal>
  );
});
HoverCardContent.displayName = "HoverCardContent";
