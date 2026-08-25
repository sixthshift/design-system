import { Input } from "@sixthshift/design-system/input";
import { Search, X } from "lucide-react";
import * as React from "react";

export type SearchInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  /** Accessible name for the clear button — it is icon-only. */
  clearLabel?: string;
};

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
            <button type="button" onClick={handleClear} aria-label={clearLabel} className="rounded hover:bg-bg-subtle">
              <X />
            </button>
          ) : undefined
        }
        className={className}
        {...props}
      />
    );
  }
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
