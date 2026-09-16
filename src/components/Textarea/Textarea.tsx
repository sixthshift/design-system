import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /**
   * Grows the textarea to fit its content instead of scrolling internally.
   * Off by default — a fixed box that scrolls is still correct for e.g. a
   * bounded comment field. `rows` still sets the starting height.
   */
  autosize?: boolean;
};

/**
 * Multi-line text input for longer free-form text.
 *
 * A thin styled wrapper around `<textarea>` — no custom props beyond
 * `autosize` and `React.TextareaHTMLAttributes`, and no maximum-length UI of
 * its own. Height comes from a `min-h-[60px]` default plus whatever `rows`
 * or `className` the caller passes. With `autosize`, that starting height
 * grows with content instead; without it, growing with content is the
 * caller's responsibility. Controlled or uncontrolled exactly like a native
 * textarea.
 *
 * Meant to be wrapped by `FormField` for label, description and validation
 * wiring.
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, autosize = false, onInput, value, ...props }, ref) => {
  const innerRef = React.useRef<HTMLTextAreaElement>(null);

  const resize = React.useCallback(() => {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: value only triggers the resize, it isn't read here
  React.useLayoutEffect(() => {
    if (autosize) resize();
  }, [autosize, resize, value]);

  return (
    <textarea
      value={value}
      className={cn(
        "textarea border-(color:--textarea-border) focus-visible:ring-(color:--textarea-ring) flex min-h-[60px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-(--textarea-placeholder-fg) focus-visible:outline-hidden focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        autosize && "resize-none overflow-hidden",
        className
      )}
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.RefObject<HTMLTextAreaElement | null>).current = node;
      }}
      onInput={(event) => {
        if (autosize) resize();
        onInput?.(event);
      }}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
