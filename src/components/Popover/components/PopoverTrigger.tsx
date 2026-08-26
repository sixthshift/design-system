import * as React from "react";
import { Slot } from "../../../internal/Slot";
import { usePopoverContext } from "./PopoverContext";

export type PopoverTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Render as child element */
  asChild?: boolean;
};

export const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(({ asChild = false, children, ...props }, forwardedRef) => {
  const { refs, getReferenceProps, contentId, triggerId, open } = usePopoverContext();
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={(node: HTMLButtonElement | null) => {
        refs.setReference(node);
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      type={asChild ? undefined : "button"}
      id={triggerId}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={open ? contentId : undefined}
      {...getReferenceProps(props)}
    >
      {children}
    </Comp>
  );
});
PopoverTrigger.displayName = "PopoverTrigger";
