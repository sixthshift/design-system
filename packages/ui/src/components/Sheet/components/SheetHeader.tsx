import { cn } from "@sixthshift/ui/utils";
import { X } from "lucide-react";
import * as React from "react";
import { SheetContext } from "./SheetContext";

export type SheetHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export const SheetHeader = React.forwardRef<HTMLDivElement, SheetHeaderProps>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SheetContext);
  const closable = context?.closable;
  const onClose = context?.onClose;

  return (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 border-border-normal border-b p-6", closable && "pr-12", className)} {...props}>
      {children}
      {closable && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 cursor-pointer rounded-md p-1 text-fg-subtle transition-colors hover:bg-bg-subtle hover:text-fg-normal"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
});
SheetHeader.displayName = "SheetHeader";
