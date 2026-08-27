import { FloatingPortal } from "@floating-ui/react";
import { cn } from "@sixthshift/design-system/utils";
import { Check } from "lucide-react";
import type React from "react";
import type { WritableRefObject } from "../../internal/types";

/**
 * Options are addressed by id, not by focus: the listbox (or the search input)
 * keeps focus and points `aria-activedescendant` at the highlighted option, so
 * both sides need to agree on the id.
 */
export const selectOptionId = (listboxId: string, index: number) => `${listboxId}-option-${index}`;

interface SelectDropdownProps<T extends string> {
  setFloating: (node: HTMLElement | null) => void;
  listboxId: string;
  /** Publishes the listbox node upward — Select focuses it and scrolls it. */
  setListbox: (node: HTMLDivElement | null) => void;
  /** Names the listbox — a bare `role="listbox"` has no accessible name. */
  label: string;
  /** The highlighted option's id, or undefined when nothing is highlighted. */
  activeOptionId: string | undefined;
  floatingStyles: React.CSSProperties;
  displayOptions: readonly { value: T; label: string }[];
  highlightedIndex: number;
  selectedValues: Set<T>;
  searchValue: string;
  optionRefs: WritableRefObject<Map<number, HTMLButtonElement>>;
  multiple: boolean;
  onSelect: (value: T) => void;
  onHighlight: (index: number) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
}

export const SelectDropdown = <T extends string>({
  setFloating,
  listboxId,
  setListbox,
  label,
  activeOptionId,
  floatingStyles,
  displayOptions,
  highlightedIndex,
  selectedValues,
  searchValue,
  optionRefs,
  multiple,
  onSelect,
  onHighlight,
  onKeyDown,
}: SelectDropdownProps<T>) => (
  <FloatingPortal>
    <div
      ref={(node) => {
        setFloating(node);
        setListbox(node);
      }}
      id={listboxId}
      role="listbox"
      aria-label={label}
      aria-multiselectable={multiple || undefined}
      aria-activedescendant={activeOptionId}
      // Focus lands here when the dropdown opens (the searchable variant keeps
      // it in the input instead), which is what makes `aria-activedescendant`
      // and the scoped keydown handler work.
      tabIndex={-1}
      onKeyDown={onKeyDown}
      style={floatingStyles}
      className="select-dropdown border-(color:--select-dropdown-border) z-popover max-h-60 overflow-y-auto rounded-md border bg-(--select-dropdown-bg) shadow-lg"
    >
      {displayOptions.length === 0 ? (
        <div className="px-3 py-2 text-center text-(--select-dropdown-empty-fg) text-sm">
          {searchValue ? `No results for "${searchValue}"` : "No options available"}
        </div>
      ) : (
        displayOptions.map((option, index) => {
          const isSelected = selectedValues.has(option.value);
          const isHighlighted = highlightedIndex === index;
          return (
            <button
              key={option.value}
              ref={(el) => {
                if (el) optionRefs.current.set(index, el);
                else optionRefs.current.delete(index);
              }}
              type="button"
              id={selectOptionId(listboxId, index)}
              role="option"
              aria-selected={isSelected}
              // Surfaces the keyboard/mouse "current" option as an attribute
              // the select.css recipe selects on, rather than compiling it
              // straight into a class name — see select.css's header.
              data-highlighted={isHighlighted ? "true" : undefined}
              // The options are not tab stops and must not steal focus: the
              // listbox holds it and delegates via aria-activedescendant, so a
              // click that moved focus onto the option would strand the keyboard
              // handler with nothing listening.
              tabIndex={-1}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelect(option.value)}
              onMouseEnter={() => onHighlight(index)}
              className={cn(
                `select-option flex w-full cursor-pointer items-center bg-(--select-option-bg) px-3 py-2 text-(--select-option-fg) text-sm transition-colors`,
                multiple && "gap-2",
                isSelected && "font-medium"
              )}
            >
              {multiple && (
                <span
                  data-selected={isSelected ? "true" : undefined}
                  className="select-option-indicator border-(color:--select-option-indicator-border) flex h-4 w-4 shrink-0 items-center justify-center rounded-xs border bg-(--select-option-indicator-bg) text-(--select-option-indicator-fg)"
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
