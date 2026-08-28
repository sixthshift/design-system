"use client";

import { Input } from "@sixthshift/design-system/input";
import { cn } from "@sixthshift/design-system/utils";
import { Search, X } from "lucide-react";
import * as React from "react";

export type SearchInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  /** Accessible name for the clear button — it is icon-only. */
  clearLabel?: string;
};

/**
 * Text input specialised for search: a search icon fixed on the left and,
 * once there is a value, a clear button on the right.
 *
 * Wraps `Input`, using its `iconLeft`/`iconRight` slots, rather than
 * reimplementing the field. Always controlled — `value` is required and
 * there is no `defaultValue`/uncontrolled mode. `onChange` receives the
 * string value directly, not the change event. Clearing calls `onClear` if
 * provided, otherwise calls `onChange("")`.
 */
const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, onClear, clearLabel = "Clear search", ...props }, ref) => {
    const handleClear = () => {
      if (onClear) {
        onClear();
      } else {
        onChange("");
      }
    };

    return (
      <Input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        iconLeft={<Search />}
        iconRight={
          value ? (
            <button type="button" onClick={handleClear} aria-label={clearLabel} className="rounded hover:bg-(--search-input-clear-bg-hovered)">
              <X />
            </button>
          ) : undefined
        }
        className={cn("search-input", className)}
        {...props}
      />
    );
  }
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
