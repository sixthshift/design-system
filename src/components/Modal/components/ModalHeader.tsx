import { cn } from "@sixthshift/design-system/utils";
import { X } from "lucide-react";
import * as React from "react";
import { ModalContext } from "./ModalContext";

export type ModalHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(({ className, children, id, ...props }, ref) => {
  const context = React.useContext(ModalContext);
  const closable = context?.closable;
  const onClose = context?.onClose;
  const registerTitle = context?.registerTitle;

  // Tell the dialog it has a title to point `aria-labelledby` at, and take that
  // back on unmount so a header removed at runtime doesn't leave a dangling
  // reference behind. A caller-supplied `id` wins over the generated one, which
  // also means the dialog can no longer find it — say so rather than pointing
  // at an id that isn't in the DOM, and let the caller label the Modal itself.
  const ownsTitleId = id === undefined;
  React.useEffect(() => {
    registerTitle?.(ownsTitleId);
    return () => registerTitle?.(false);
  }, [registerTitle, ownsTitleId]);

  return (
    <div ref={ref} id={id ?? context?.titleId} className={cn("flex flex-col space-y-1.5 p-6", closable && "pr-12", className)} {...props}>
      {children}
      {closable && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="modal-close absolute top-4 right-4 cursor-pointer rounded-md p-1 text-(--modal-close-fg) transition-colors hover:bg-(--modal-close-bg-hovered) hover:text-(--modal-close-fg-hovered)"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
});
ModalHeader.displayName = "ModalHeader";
