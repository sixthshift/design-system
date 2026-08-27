import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";
import { buttonRecipe } from "../Button/Button";
import type { ToggleGroupBaseProps, ToggleGroupOption } from "./toggleGroup.types";

type ItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  Required<Pick<ToggleGroupBaseProps, "appearance" | "orientation" | "variant" | "intent" | "size">> & {
    option: ToggleGroupOption;
    selected: boolean;
    groupDisabled?: boolean | undefined;
    index: number;
    total: number;
  };

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ItemProps>(
  ({ option, selected, groupDisabled, appearance, orientation, variant, intent, size, index, total, ...props }, ref) => {
    const isDisabled = groupDisabled || option.disabled;
    const isFirst = index === 0;
    const isLast = index === total - 1;
    const isVertical = orientation === "vertical";
    const isSegmented = appearance === "segmented";

    // Both modes share the same base: buttonVariants + the pressed-state cells
    // in recipes/toggle.css. Segmented just overrides border/shadow/rounding
    // so items join cleanly.
    const recipe = buttonRecipe({ variant, intent, size });

    return (
      <button
        ref={ref}
        {...recipe}
        type="button"
        // Same attribute Toggle renders for `pressed` — recipes/toggle.css
        // selects on it, so selected/unselected items pick up the same cells.
        data-state={selected ? "on" : "off"}
        disabled={isDisabled}
        aria-label={option.ariaLabel}
        className={cn(
          recipe.className,
          // Segmented: only override rounding (let buttonVariants handle border/color).
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
