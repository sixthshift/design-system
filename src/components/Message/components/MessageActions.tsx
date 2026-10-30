import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type MessageActionsProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * The row of controls under the description. It owns its own spacing (the
 * body's `gap-1` is too tight above buttons) and nothing else: no opacity, so
 * controls keep full contrast, and no colour, since a Button or link brings
 * its own. `size="sm"` on the root tightens the row through the `message`
 * group.
 */
export const MessageActions = React.forwardRef<HTMLDivElement, MessageActionsProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("mt-2 flex flex-wrap items-center gap-2 group-data-[size=sm]/message:gap-1.5", className)} {...props} />;
});
MessageActions.displayName = "MessageActions";
