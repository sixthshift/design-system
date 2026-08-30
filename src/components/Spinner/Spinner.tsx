import { cn } from "@sixthshift/design-system/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

/**
 * Geometry (size) plus the one `--spinner-fg` component token.
 *
 * The colour used to be `text-fg-subtle`, a semantic token named directly in
 * the class string — the one thing a consumer could not do was recolour a
 * spinner without fighting `className` against it. `--spinner-fg` in
 * src/theming/recipes/spinner.css is now that seam: a consumer overrides the
 * variable, scoped to whatever subtree they like, instead of overriding a
 * class.
 */
const spinnerVariants = cva("spinner animate-spin text-(--spinner-fg)", {
  variants: {
    size: {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type SpinnerProps = React.SVGAttributes<SVGElement> & VariantProps<typeof spinnerVariants>;

/**
 * Animated loading indicator — an inline `<svg>`, `size` scales it (`sm` |
 * `md` | `lg` | `xl`). Use it for a fetching-more state at the bottom
 * of an already-rendered list, and for an initial load inside a container that
 * already reserves its final height, so resolving the load does not jump the
 * layout (see docs/states.md).
 *
 * It is `aria-hidden="true"` unconditionally — it announces nothing to
 * assistive tech on its own, so pair it with visible or `sr-only` text (or a
 * live region) if the loading state needs to be announced.
 *
 * Colour reads the `--spinner-fg` component token
 * (src/theming/recipes/spinner.css) rather than a class name, so a consumer
 * can recolour a spinner scoped to a subtree without fighting `className`.
 */
const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(({ className, size, ...props }, ref) => (
  <svg
    ref={ref}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    className={cn(spinnerVariants({ size, className }))}
    aria-hidden="true"
    {...props}
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
));
Spinner.displayName = "Spinner";

export { Spinner, spinnerVariants };
