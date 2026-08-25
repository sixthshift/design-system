import { cn } from "@sixthshift/design-system/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const textInlineVariants = cva("inline-flex items-center", {
  variants: {
    gap: {
      none: "gap-0",
      xs: "gap-0.5",
      sm: "gap-1",
      md: "gap-2",
      lg: "gap-3",
      xl: "gap-4",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      baseline: "items-baseline",
    },
  },
  defaultVariants: {
    gap: "sm",
    align: "baseline",
  },
});

export type TextInlineProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof textInlineVariants>;

const TextInline = React.forwardRef<HTMLSpanElement, TextInlineProps>(({ className, gap, align, ...props }, ref) => (
  <span ref={ref} className={cn(textInlineVariants({ gap, align }), className)} {...props} />
));
TextInline.displayName = "TextInline";

export { TextInline, textInlineVariants };
