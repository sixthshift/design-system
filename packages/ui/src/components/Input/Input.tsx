import { cn } from "@sixthshift/ui/utils";
import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
};

const iconSlotStyles = `absolute top-1/2 -translate-y-1/2 text-fg-subtle
  [&_svg]:h-4 [&_svg]:w-4
  [&_button]:flex [&_button]:cursor-pointer [&_button]:appearance-none
  [&_button]:border-0 [&_button]:bg-transparent`;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, iconLeft, iconRight, ...props }, ref) => {
  if (iconLeft || iconRight) {
    return (
      <div className={cn("relative h-9 w-full text-sm", className)}>
        {iconLeft && <span className={cn(iconSlotStyles, "left-3")}>{iconLeft}</span>}
        <input
          type={type}
          className={cn(
            `flex h-full w-full rounded-md border border-border-normal bg-bg-normal py-1 text-[length:inherit] shadow-xs transition-colors file:border-0 file:bg-bg-normal file:font-medium file:text-fg-normal file:text-sm placeholder:text-fg-subtle focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-not-allowed disabled:opacity-50`,
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
        `flex h-9 w-full rounded-md border border-border-normal bg-bg-normal px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-bg-normal file:font-medium file:text-fg-normal file:text-sm placeholder:text-fg-subtle focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-not-allowed disabled:opacity-50`,
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
