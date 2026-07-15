import { useControllableState } from "@sixthshift/ui/hooks";
import * as React from "react";
import { ToggleGroupContainer } from "./ToggleGroupContainer";
import { ToggleGroupItem } from "./ToggleGroupItem";
import type { ToggleGroupSingleProps } from "./toggleGroup.types";

const ToggleGroupSingle = React.forwardRef<HTMLDivElement, ToggleGroupSingleProps>(
  (
    {
      options,
      value: controlledValue,
      defaultValue = "",
      onValueChange,
      appearance = "segmented",
      orientation = "horizontal",
      variant = "solid",
      intent = "neutral",
      size = "default",
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = useControllableState({
      value: controlledValue,
      defaultValue,
      onChange: onValueChange,
    });

    const handleSelect = (optionValue: string) => {
      // Single select: clicking the selected item does nothing (no deselect)
      if (optionValue !== value) {
        setValue(optionValue);
      }
    };

    return (
      <ToggleGroupContainer ref={ref} role="radiogroup" appearance={appearance} orientation={orientation} className={className} {...props}>
        {options.map((option, index) => (
          <ToggleGroupItem
            key={option.value}
            option={option}
            selected={value === option.value}
            groupDisabled={disabled}
            appearance={appearance}
            orientation={orientation}
            variant={variant}
            intent={intent}
            size={size}
            index={index}
            total={options.length}
            role="radio"
            aria-checked={value === option.value}
            onClick={() => handleSelect(option.value)}
          />
        ))}
      </ToggleGroupContainer>
    );
  }
);
ToggleGroupSingle.displayName = "ToggleGroupSingle";

export { ToggleGroupSingle };
