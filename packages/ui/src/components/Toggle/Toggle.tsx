import { useControllableState } from "@sixthshift/ui/hooks";
import { cn } from "@sixthshift/ui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { buttonVariants } from "../Button/Button";

/**
 * Pressed-state backgrounds matching Button's active: states.
 * When a toggle is "on", its resting background becomes the pressed token.
 */
const togglePressedVariants = cva("", {
  variants: {
    variant: { solid: "", outline: "", ghost: "", link: "" },
    intent: { neutral: "", danger: "", success: "", warning: "" },
  },
  compoundVariants: [
    // Solid — use the main -pressed background
    { variant: "solid", intent: "neutral", className: "bg-bg-brand-pressed hover:bg-bg-brand-pressed" },
    { variant: "solid", intent: "danger", className: "bg-bg-danger-pressed hover:bg-bg-danger-pressed" },
    { variant: "solid", intent: "success", className: "bg-bg-success-pressed hover:bg-bg-success-pressed" },
    { variant: "solid", intent: "warning", className: "bg-bg-warning-pressed hover:bg-bg-warning-pressed" },
    // Outline — use the subtle -pressed background
    { variant: "outline", intent: "neutral", className: "bg-bg-subtle-pressed hover:bg-bg-subtle-pressed" },
    { variant: "outline", intent: "danger", className: "bg-bg-danger-subtle-pressed hover:bg-bg-danger-subtle-pressed" },
    { variant: "outline", intent: "success", className: "bg-bg-success-subtle-pressed hover:bg-bg-success-subtle-pressed" },
    { variant: "outline", intent: "warning", className: "bg-bg-warning-subtle-pressed hover:bg-bg-warning-subtle-pressed" },
    // Ghost — same as outline
    { variant: "ghost", intent: "neutral", className: "bg-bg-subtle-pressed hover:bg-bg-subtle-pressed" },
    { variant: "ghost", intent: "danger", className: "bg-bg-danger-subtle-pressed hover:bg-bg-danger-subtle-pressed" },
    { variant: "ghost", intent: "success", className: "bg-bg-success-subtle-pressed hover:bg-bg-success-subtle-pressed" },
    { variant: "ghost", intent: "warning", className: "bg-bg-warning-subtle-pressed hover:bg-bg-warning-subtle-pressed" },
  ],
  defaultVariants: { variant: "solid", intent: "neutral" },
});

export type ToggleProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value"> &
  VariantProps<typeof buttonVariants> & {
    /** Controlled pressed state */
    pressed?: boolean;
    /** Default pressed state for uncontrolled mode */
    defaultPressed?: boolean;
    /** Called when pressed state changes */
    onPressedChange?: (pressed: boolean) => void;
  };

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, variant, intent, size, pressed: controlledPressed, defaultPressed = false, onPressedChange, disabled, children, ...props }, ref) => {
    const [pressed, setPressed] = useControllableState({
      value: controlledPressed,
      defaultValue: defaultPressed,
      onChange: onPressedChange,
    });

    return (
      <button
        type="button"
        aria-pressed={pressed}
        data-state={pressed ? "on" : "off"}
        disabled={disabled}
        ref={ref}
        onClick={() => setPressed(!pressed)}
        className={cn(buttonVariants({ variant, intent, size }), pressed && togglePressedVariants({ variant, intent }), className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Toggle.displayName = "Toggle";

export { Toggle, togglePressedVariants };
