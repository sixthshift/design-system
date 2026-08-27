import { useControllableState } from "@sixthshift/design-system/hooks";
import * as React from "react";
import { ToggleGroupContainer } from "./ToggleGroupContainer";
import { ToggleGroupItem } from "./ToggleGroupItem";
import type { ToggleGroupMultipleProps } from "./toggleGroup.types";

const ToggleGroupMultiple = React.forwardRef<HTMLDivElement, ToggleGroupMultipleProps>(
  (
    {
      options,
      value: controlledValue,
      defaultValue = [],
      onValueChange,
      appearance = "segmented",
      orientation = "horizontal",
      variant = "solid",
      intent = "neutral",
      size = "md",
      iconOnly = false,
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

    const handleToggle = (optionValue: string) => {
      const next = value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue];
      setValue(next);
    };

    return (
      <ToggleGroupContainer ref={ref} role="group" appearance={appearance} orientation={orientation} className={className} {...props}>
        {options.map((option, index) => (
          <ToggleGroupItem
            key={option.value}
            option={option}
            selected={value.includes(option.value)}
            groupDisabled={disabled}
            appearance={appearance}
            orientation={orientation}
            variant={variant}
            intent={intent}
            size={size}
            iconOnly={iconOnly}
            index={index}
            total={options.length}
            aria-pressed={value.includes(option.value)}
            onClick={() => handleToggle(option.value)}
          />
        ))}
      </ToggleGroupContainer>
    );
  }
);
ToggleGroupMultiple.displayName = "ToggleGroupMultiple";

export { ToggleGroupMultiple };
