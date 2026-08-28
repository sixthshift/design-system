"use client";

import * as React from "react";
import { Slot } from "../../../internal/Slot";
import { usePopoverContext } from "./PopoverContext";

export type PopoverCloseProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Render as child element */
  asChild?: boolean;
};

export const PopoverClose = React.forwardRef<HTMLButtonElement, PopoverCloseProps>(({ asChild = false, onClick, ...props }, ref) => {
  const { onOpenChange } = usePopoverContext();
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : "button"}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        onOpenChange(false);
      }}
      {...props}
    />
  );
});
PopoverClose.displayName = "PopoverClose";
