import { cn } from "@sixthshift/design-system/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Slot } from "../../internal/Slot";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        solid: "shadow",
        outline: "border bg-bg-normal shadow-xs",
        ghost: "",
        link: "underline-offset-4 hover:underline",
      },
      intent: {
        neutral: "",
        danger: "",
        success: "",
        warning: "",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-7 rounded-md px-2 text-xs",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
        icon: "h-9 w-9",
      },
    },
    compoundVariants: [
      // Solid variants
      {
        variant: "solid",
        intent: "neutral",
        className: "bg-bg-brand text-fg-on-brand hover:bg-bg-brand-hovered active:bg-bg-brand-pressed",
      },
      {
        variant: "solid",
        intent: "danger",
        className: "bg-bg-danger text-fg-on-danger hover:bg-bg-danger-hovered active:bg-bg-danger-pressed",
      },
      {
        variant: "solid",
        intent: "success",
        className: "bg-bg-success text-fg-on-success hover:bg-bg-success-hovered active:bg-bg-success-pressed",
      },
      {
        variant: "solid",
        intent: "warning",
        className: "bg-bg-warning text-fg-on-warning hover:bg-bg-warning-hovered active:bg-bg-warning-pressed",
      },
      // Outline variants
      {
        variant: "outline",
        intent: "neutral",
        className: "border-border-normal text-fg-normal hover:bg-bg-subtle-hovered active:bg-bg-subtle-pressed",
      },
      {
        variant: "outline",
        intent: "danger",
        className: "border-border-danger text-fg-danger hover:bg-bg-danger-subtle-hovered active:bg-bg-danger-subtle-pressed",
      },
      {
        variant: "outline",
        intent: "success",
        className: "border-border-success text-fg-success hover:bg-bg-success-subtle-hovered active:bg-bg-success-subtle-pressed",
      },
      {
        variant: "outline",
        intent: "warning",
        className: "border-border-warning text-fg-warning hover:bg-bg-warning-subtle-hovered active:bg-bg-warning-subtle-pressed",
      },
      // Ghost variants
      {
        variant: "ghost",
        intent: "neutral",
        className: "text-fg-normal hover:bg-bg-subtle-hovered active:bg-bg-subtle-pressed",
      },
      {
        variant: "ghost",
        intent: "danger",
        className: "text-fg-danger hover:bg-bg-danger-subtle-hovered active:bg-bg-danger-subtle-pressed",
      },
      {
        variant: "ghost",
        intent: "success",
        className: "text-fg-success hover:bg-bg-success-subtle-hovered active:bg-bg-success-subtle-pressed",
      },
      {
        variant: "ghost",
        intent: "warning",
        className: "text-fg-warning hover:bg-bg-warning-subtle-hovered active:bg-bg-warning-subtle-pressed",
      },
      // Link variants
      {
        variant: "link",
        intent: "neutral",
        className: "text-fg-brand",
      },
      {
        variant: "link",
        intent: "danger",
        className: "text-fg-danger",
      },
      {
        variant: "link",
        intent: "success",
        className: "text-fg-success",
      },
      {
        variant: "link",
        intent: "warning",
        className: "text-fg-warning",
      },
    ],
    defaultVariants: {
      variant: "solid",
      intent: "neutral",
      size: "default",
    },
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, intent, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, intent, size, className }))} ref={ref} disabled={disabled || loading} {...props}>
        {loading ? (
          <>
            <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
