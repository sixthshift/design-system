import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Multi-line text input for longer free-form text.
 *
 * A thin styled wrapper around `<textarea>` — no custom props beyond
 * `React.TextareaHTMLAttributes`, no auto-resize, and no maximum-length UI of
 * its own. Height comes from a `min-h-[60px]` default plus whatever `rows`
 * or `className` the caller passes; growing with content is the caller's
 * responsibility. Controlled or uncontrolled exactly like a native textarea.
 *
 * Meant to be wrapped by `FormField` for label, description and validation
 * wiring.
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "textarea border-(color:--textarea-border) focus-visible:ring-(color:--textarea-ring) flex min-h-[60px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-(--textarea-placeholder-fg) focus-visible:outline-hidden focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
