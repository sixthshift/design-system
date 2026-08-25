import { FloatingPortal } from "@floating-ui/react";
import { cn } from "@sixthshift/design-system/utils";
import { Check } from "lucide-react";
import type React from "react";

interface SelectDropdownProps<T extends string> {
  setFloating: (node: HTMLElement | null) => void;
  listboxId: string;
  listboxRef: React.MutableRefObject<HTMLDivElement | null>;
  floatingStyles: React.CSSProperties;
  displayOptions: readonly { value: T; label: string }[];
  highlightedIndex: number;
  selectedValues: Set<T>;
  searchValue: string;
  optionRefs: React.MutableRefObject<Map<number, HTMLButtonElement>>;
  multiple: boolean;
  onSelect: (value: T) => void;
  onHighlight: (index: number) => void;
}

export const SelectDropdown = <T extends string>({
  setFloating,
  listboxId,
  listboxRef,
  floatingStyles,
  displayOptions,
  highlightedIndex,
  selectedValues,
  searchValue,
  optionRefs,
  multiple,
  onSelect,
  onHighlight,
}: SelectDropdownProps<T>) => (
  <FloatingPortal>
    <div
      ref={(node) => {
        setFloating(node);
        listboxRef.current = node;
      }}
      id={listboxId}
      role="listbox"
      aria-multiselectable={multiple || undefined}
      tabIndex={-1}
      style={floatingStyles}
      className="z-popover max-h-60 overflow-y-auto rounded-md border border-border-normal bg-bg-normal shadow-lg"
    >
      {displayOptions.length === 0 ? (
        <div className="px-3 py-2 text-center text-fg-subtle text-sm">{searchValue ? `No results for "${searchValue}"` : "No options available"}</div>
      ) : (
        displayOptions.map((option, index) => {
          const isSelected = selectedValues.has(option.value);
          return (
            <button
              key={option.value}
              ref={(el) => {
                if (el) optionRefs.current.set(index, el);
                else optionRefs.current.delete(index);
              }}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelect(option.value)}
              onMouseEnter={() => onHighlight(index)}
              className={cn(
                `flex w-full cursor-pointer items-center px-3 py-2 text-fg-normal text-sm transition-colors`,
                multiple && "gap-2",
                highlightedIndex === index && "bg-bg-subtle",
                isSelected ? "font-medium text-fg-normal" : "text-fg-subtle"
              )}
            >
              {multiple && (
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-xs border",
                    isSelected ? "border-border-brand bg-bg-brand text-fg-on-brand" : "border-border-normal"
                  )}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </span>
              )}
              {option.label}
            </button>
          );
        })
      )}
    </div>
  </FloatingPortal>
);
