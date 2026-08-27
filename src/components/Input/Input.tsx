import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
};

const iconSlotStyles = `absolute top-1/2 -translate-y-1/2 text-(--input-icon-fg)
  [&_svg]:h-4 [&_svg]:w-4
  [&_button]:flex [&_button]:cursor-pointer [&_button]:appearance-none
  [&_button]:border-0 [&_button]:bg-transparent`;

/**
 * Single-line text input for free-form text entry.
 *
 * Renders a plain `<input>` unless `iconLeft` or `iconRight` is supplied, in
 * which case it wraps the input in a relatively positioned container so an
 * icon — or an icon-styled button, as `SearchInput` uses for its clear
 * button — can sit inside the field's padding without affecting layout.
 *
 * Controlled or uncontrolled exactly like a native input (`value`/`onChange`
 * or `defaultValue`), and `type` is forwarded as-is, so `type="password"`,
 * `type="number"`, etc. all work.
 *
 * Meant to be wrapped by `FormField` for label, description and validation
 * wiring, or by `SearchInput` for a search affordance.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, iconLeft, iconRight, ...props }, ref) => {
  if (iconLeft || iconRight) {
    return (
      <div className={cn("input relative h-9 w-full text-sm", className)}>
        {iconLeft && <span className={cn(iconSlotStyles, "left-3")}>{iconLeft}</span>}
        <input
          type={type}
          className={cn(
            `input border-(color:--input-border) focus-visible:ring-(color:--input-ring) flex h-full w-full rounded-md border bg-(--input-bg) py-1 text-[length:inherit] shadow-xs transition-colors file:border-0 file:bg-(--input-file-bg) file:font-medium file:text-(--input-file-fg) file:text-sm placeholder:text-(--input-placeholder-fg) focus-visible:outline-hidden focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50`,
            iconLeft ? "pl-9" : "pl-3",
            iconRight ? "pr-9" : "pr-3"
          )}
          ref={ref}
          {...props}
        />
        {iconRight && <span className={cn(iconSlotStyles, "right-3")}>{iconRight}</span>}
      </div>
    );
  }

  return (
    <input
      type={type}
      className={cn(
        `input border-(color:--input-border) focus-visible:ring-(color:--input-ring) flex h-9 w-full rounded-md border bg-(--input-bg) px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-(--input-file-bg) file:font-medium file:text-(--input-file-fg) file:text-sm placeholder:text-(--input-placeholder-fg) focus-visible:outline-hidden focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50`,
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
