import { cn } from "@sixthshift/design-system/utils";
import { X } from "lucide-react";
import * as React from "react";
import { SheetContext } from "./SheetContext";

export type SheetHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export const SheetHeader = React.forwardRef<HTMLDivElement, SheetHeaderProps>(({ className, children, id, ...props }, ref) => {
  const context = React.useContext(SheetContext);
  const closable = context?.closable;
  const onClose = context?.onClose;
  const registerTitle = context?.registerTitle;

  // Report the title to the sheet so it can name itself, and withdraw it on
  // unmount. A caller-supplied `id` wins over the generated one — which the
  // sheet can no longer resolve, so it is told there is no title to point at.
  const ownsTitleId = id === undefined;
  React.useEffect(() => {
    registerTitle?.(ownsTitleId);
    return () => registerTitle?.(false);
  }, [registerTitle, ownsTitleId]);

  return (
    <div
      ref={ref}
      id={id ?? context?.titleId}
      className={cn("flex flex-col space-y-1.5 border-border-normal border-b p-6", closable && "pr-12", className)}
      {...props}
    >
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
