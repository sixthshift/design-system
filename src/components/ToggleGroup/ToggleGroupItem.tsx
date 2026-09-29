import { cn } from "@sixthshift/design-system/utils";
import { cva } from "class-variance-authority";
import * as React from "react";
import type { ToggleGroupBaseProps, ToggleGroupOption } from "./toggleGroup.types";

/**
 * An item's geometry. Duplicated from Button's on purpose — ToggleGroup is its
 * own component and imports neither Button nor Toggle. Every colour reads a
 * `--toggle-group-item-*` token from toggle-group.recipe.css.
 */
const itemVariants = cva(
  // One literal, deliberately — see Button.tsx for the sorter trap.
  "toggle-group-item border-(color:--toggle-group-item-border) focus-visible:ring-(color:--toggle-group-item-ring) inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-(--toggle-group-item-bg) font-medium text-(--toggle-group-item-fg) text-sm transition-colors hover:bg-(--toggle-group-item-bg-hovered) focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 active:bg-(--toggle-group-item-bg-pressed) disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      size: {
        xs: "h-7 rounded-md px-2 text-xs",
        sm: "h-8 rounded-md px-3 text-xs",
        md: "h-9 px-4 py-2",
        lg: "h-10 rounded-md px-8",
      },
    },
    defaultVariants: { size: "md" },
  }
);

/** The non-colour half of `variant` — border width and elevation. */
const variantStructure: Record<string, string> = {
  solid: "shadow",
  outline: "border shadow-xs",
  ghost: "",
};

/** Squares the item at whatever size is set, and drops the horizontal padding. */
const iconOnlyGeometry: Record<string, string> = {
  xs: "w-7 px-0",
  sm: "w-8 px-0",
  md: "w-9 px-0",
  lg: "w-10 px-0",
};

type ItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  Required<Pick<ToggleGroupBaseProps, "appearance" | "orientation" | "variant" | "intent" | "size" | "iconOnly">> & {
    option: ToggleGroupOption;
    selected: boolean;
    groupDisabled?: boolean | undefined;
    index: number;
    total: number;
  };

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ItemProps>(
  ({ option, selected, groupDisabled, appearance, orientation, variant, intent, size, iconOnly, index, total, ...props }, ref) => {
    const isDisabled = groupDisabled || option.disabled;
    const isFirst = index === 0;
    const isLast = index === total - 1;
    const isVertical = orientation === "vertical";
    const isSegmented = appearance === "segmented";

    // Both appearances share the same base and the pressed-state cells in
    // toggle-group.recipe.css. Segmented just overrides the rounding so items
    // join cleanly.
    return (
      <button
        ref={ref}
        data-variant={variant}
        data-intent={intent}
        type="button"
        // toggle-group.recipe.css selects the selected state on this.
        data-state={selected ? "on" : "off"}
        disabled={isDisabled}
        aria-label={option.ariaLabel}
        className={cn(
          variantStructure[variant],
          itemVariants({ size, className: iconOnly ? iconOnlyGeometry[size] : undefined }),
          // Segmented: only override rounding (the variant handles border/colour).
          // Negative margin collapses double borders between outline items.
          isSegmented &&
            (isVertical
              ? cn("rounded-none", isFirst && "rounded-t-md", isLast && "rounded-b-md", !isFirst && "-mt-px")
              : cn("rounded-none", isFirst && "rounded-l-md", isLast && "rounded-r-md", !isFirst && "-ml-px"))
        )}
        {...props}
      >
        {option.label}
      </button>
    );
  }
);
ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroupItem };
