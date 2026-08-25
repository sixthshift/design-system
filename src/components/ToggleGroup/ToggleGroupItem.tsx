import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";
import { buttonVariants } from "../Button/Button";
import { togglePressedVariants } from "../Toggle/Toggle";
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

    // Both modes share the same base: buttonVariants + togglePressedVariants.
    // Segmented just overrides border/shadow/rounding so items join cleanly.
    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        aria-label={option.ariaLabel}
        className={cn(
          buttonVariants({ variant, intent, size }),
          selected && togglePressedVariants({ variant, intent }),
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
