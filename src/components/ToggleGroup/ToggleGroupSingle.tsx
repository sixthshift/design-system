"use client";

import { useControllableState } from "@sixthshift/design-system/hooks";
import * as React from "react";
import { getRovingTargetIndex } from "../../internal/rovingFocus";
import type { WritableRefObject } from "../../internal/types";
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

    const handleSelect = (optionValue: string) => {
      // Single select: clicking the selected item does nothing (no deselect)
      if (optionValue !== value) {
        setValue(optionValue);
      }
    };

    const groupRef = React.useRef<HTMLDivElement | null>(null);
    const mergedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        groupRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as WritableRefObject<HTMLDivElement | null>).current = node;
      },
      [ref]
    );

    // role="radiogroup" means one tab stop with arrow-key navigation.
    const handleKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
      const enabled = Array.from(groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? []).filter((radio) => !radio.disabled);
      const focused = (event.target as HTMLElement | null)?.closest?.('[role="radio"]') as HTMLButtonElement | null;
      const target = getRovingTargetIndex(event.key, focused ? enabled.indexOf(focused) : -1, enabled.length);
      if (target === null) return;

      event.preventDefault();
      const next = enabled[target];
      next?.focus();
      // In the radio pattern, moving focus also moves the selection.
      next?.click();
    }, []);

    // Tab stop: the selected option, or the first enabled one when nothing is
    // selected, so the group is always keyboard-reachable.
    const firstEnabledValue = options.find((option) => !(disabled || option.disabled))?.value;
    const hasSelected = options.some((option) => option.value === value);
    const tabStopValue = hasSelected ? value : firstEnabledValue;

    return (
      <ToggleGroupContainer
        ref={mergedRef}
        role="radiogroup"
        onKeyDown={handleKeyDown}
        appearance={appearance}
        orientation={orientation}
        className={className}
        {...props}
      >
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
            iconOnly={iconOnly}
            index={index}
            total={options.length}
            role="radio"
            aria-checked={value === option.value}
            tabIndex={option.value === tabStopValue ? 0 : -1}
            onClick={() => handleSelect(option.value)}
          />
        ))}
      </ToggleGroupContainer>
    );
  }
);
ToggleGroupSingle.displayName = "ToggleGroupSingle";

export { ToggleGroupSingle };
