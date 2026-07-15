import * as React from "react";
import { Slot } from "../../../internal/Slot";
import { useTooltipContext } from "./TooltipContext";

export type TooltipTriggerProps = React.HTMLAttributes<HTMLElement> & {
  /** Render as child element */
  asChild?: boolean;
};

export const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(({ asChild = false, children, ...props }, forwardedRef) => {
  const { refs, getReferenceProps } = useTooltipContext();
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      ref={(node: HTMLElement | null) => {
        refs.setReference(node);
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      {...getReferenceProps(props)}
    >
      {children}
    </Comp>
  );
});
TooltipTrigger.displayName = "TooltipTrigger";
