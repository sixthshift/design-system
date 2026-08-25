import { cn } from "@sixthshift/design-system/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

const INTENT_CLASSES: Record<string, string> = {
  neutral: "bg-fg-subtle",
  brand: "bg-bg-brand",
  primary: "bg-bg-brand",
  success: "bg-bg-success",
  warning: "bg-bg-warning",
  danger: "bg-bg-danger",
};

const colorDotVariants = cva("inline-block shrink-0 rounded-full", {
  variants: {
    size: {
      sm: "h-1.5 w-1.5",
      md: "h-2 w-2",
      lg: "h-2.5 w-2.5",
    },
    pulse: {
      true: "animate-pulse",
      false: "",
    },
  },
  defaultVariants: {
    size: "md",
    pulse: false,
  },
});

export type ColorDotProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof colorDotVariants> & {
    /** Intent name (neutral, brand, success, warning, danger) or arbitrary CSS color */
    color: string;
  };

export const ColorDot = ({ color, size, pulse, className, style, ...props }: ColorDotProps) => {
  const intentClass = INTENT_CLASSES[color];

  return (
    <span
      className={cn(colorDotVariants({ size, pulse }), intentClass, className)}
      style={intentClass ? style : { ...style, backgroundColor: color }}
      {...props}
    />
  );
};

export { colorDotVariants };
