import { cn } from "@sixthshift/design-system/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 font-semibold text-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-border-brand focus:ring-offset-2",
  {
    variants: {
      variant: {
        solid: "border-transparent shadow",
        soft: "border-transparent",
        outline: "",
      },
      intent: {
        neutral: "",
        primary: "",
        danger: "",
        success: "",
        warning: "",
        muted: "",
      },
    },
    compoundVariants: [
      // Solid variants
      { variant: "solid", intent: "neutral", className: "bg-bg-strong text-fg-on-strong" },
      { variant: "solid", intent: "primary", className: "bg-bg-brand text-fg-on-brand" },
      { variant: "solid", intent: "danger", className: "bg-bg-danger text-fg-on-danger" },
      { variant: "solid", intent: "success", className: "bg-bg-success text-fg-on-success" },
      { variant: "solid", intent: "warning", className: "bg-bg-warning text-fg-on-warning" },
      { variant: "solid", intent: "muted", className: "bg-bg-subtle text-fg-subtle" },
      // Soft variants
      { variant: "soft", intent: "neutral", className: "bg-bg-subtle text-fg-normal" },
      { variant: "soft", intent: "primary", className: "bg-bg-brand-subtle text-fg-on-brand-subtle" },
      { variant: "soft", intent: "danger", className: "bg-bg-danger-subtle text-fg-on-danger-subtle" },
      { variant: "soft", intent: "success", className: "bg-bg-success-subtle text-fg-on-success-subtle" },
      { variant: "soft", intent: "warning", className: "bg-bg-warning-subtle text-fg-on-warning-subtle" },
      { variant: "soft", intent: "muted", className: "bg-bg-subtle text-fg-subtle" },
      // Outline variants
      { variant: "outline", intent: "neutral", className: "border-border-normal bg-bg-normal text-fg-normal" },
      { variant: "outline", intent: "primary", className: "border-border-brand bg-bg-normal text-fg-brand" },
      { variant: "outline", intent: "danger", className: "border-border-danger bg-bg-normal text-fg-danger" },
      { variant: "outline", intent: "success", className: "border-border-success bg-bg-normal text-fg-success" },
      { variant: "outline", intent: "warning", className: "border-border-warning bg-bg-normal text-fg-warning" },
      { variant: "outline", intent: "muted", className: "border-border-normal bg-bg-normal text-fg-subtle" },
    ],
    defaultVariants: {
      variant: "solid",
      intent: "primary",
    },
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant, intent, ...props }, ref) => {
  return <span ref={ref} className={cn(badgeVariants({ variant, intent }), className)} {...props} />;
});
Badge.displayName = "Badge";

export { badgeVariants };
