"use client";

import { cn } from "@sixthshift/design-system/utils";
import { Search, X } from "lucide-react";
import * as React from "react";

export type SearchInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  value: string;
  /** Called with the input's string value on every change. The native `onChange(event)` also fires, unchanged. */
  onValueChange: (value: string) => void;
  onClear?: () => void;
  /** Accessible name for the clear button — it is icon-only. */
  clearLabel?: string;
};

/** The icon slots, duplicated from Input's. */
const iconSlotStyles = `absolute top-1/2 -translate-y-1/2 text-(--search-input-icon-fg)
  [&_svg]:h-4 [&_svg]:w-4
  [&_button]:flex [&_button]:cursor-pointer [&_button]:appearance-none
  [&_button]:border-0 [&_button]:bg-transparent`;

/**
 * Text input specialised for search: a search icon fixed on the left and,
 * once there is a value, a clear button on the right.
 *
 * Its own field, not a wrapped `Input`: the markup and classes are duplicated
 * from Input on purpose, so importing SearchInput pulls in nothing else and
 * its colours are its own `--search-input-*` tokens. Always controlled — `value` is required and
 * there is no `defaultValue`/uncontrolled mode. `onValueChange` receives the
 * string value directly; the native `onChange` keeps its event signature and
 * fires too if passed. Clearing calls `onClear` if provided, otherwise calls
 * `onValueChange("")` — note a programmatic clear dispatches no native event.
 */
const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onValueChange, onChange, onClear, clearLabel = "Clear search", ...props }, ref) => {
    const handleClear = () => {
      if (onClear) {
        onClear();
      } else {
        onValueChange("");
      }
    };

    return (
      <div className={cn("search-input relative h-9 w-full text-sm", className)}>
        <span className={cn(iconSlotStyles, "left-3")}>
          <Search />
        </span>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => {
            onValueChange(e.target.value);
            onChange?.(e);
          }}
          className={cn(
            "border-(color:--search-input-border) focus-visible:ring-(color:--search-input-ring) flex h-full w-full rounded-md border bg-(--search-input-bg) py-1 text-[length:inherit] shadow-xs transition-colors placeholder:text-(--search-input-placeholder-fg) focus-visible:outline-hidden focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
            "pl-9",
            value ? "pr-9" : "pr-3"
          )}
          {...props}
        />
        {value && (
          <span className={cn(iconSlotStyles, "right-3")}>
            <button type="button" onClick={handleClear} aria-label={clearLabel} className="rounded-sm hover:bg-(--search-input-clear-bg-hovered)">
              <X />
            </button>
          </span>
        )}
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
