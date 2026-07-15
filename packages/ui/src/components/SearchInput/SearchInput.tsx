import { Input } from "@sixthshift/ui/input";
import { Search, X } from "lucide-react";
import * as React from "react";

export type SearchInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
};

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(({ className, value, onChange, onClear, ...props }, ref) => {
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
          <button type="button" onClick={handleClear} className="rounded hover:bg-bg-subtle">
            <X />
          </button>
        ) : undefined
      }
      className={className}
      {...props}
    />
  );
});
SearchInput.displayName = "SearchInput";

export { SearchInput };
