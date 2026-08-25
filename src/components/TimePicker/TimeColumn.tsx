import { cn } from "@sixthshift/design-system/utils";
import { useEffect, useRef } from "react";

export type TimeColumnProps = {
  values: number[];
  selected: number;
  onSelect: (value: number) => void;
  formatValue?: (value: number) => string;
  disabled?: (value: number) => boolean;
};

export const TimeColumn = ({ values, selected, onSelect, formatValue = (v) => String(v).padStart(2, "0"), disabled }: TimeColumnProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Scroll selected item into view on mount and when selection changes
  useEffect(() => {
    if (selectedRef.current && containerRef.current) {
      const container = containerRef.current;
      const item = selectedRef.current;
      const containerRect = container.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      const scrollTop = item.offsetTop - container.offsetTop - containerRect.height / 2 + itemRect.height / 2;
      container.scrollTo({ top: scrollTop, behavior: "smooth" });
    }
  }, []);

  return (
    <div ref={containerRef} role="listbox" className="h-48 w-14 overflow-y-auto overscroll-contain rounded-lg border border-border-subtle bg-bg-subtle/50">
      {/* Top spacer for centering first items */}
      <div className="h-19" aria-hidden="true" />
      <div className="flex flex-col gap-0.5">
        {values.map((value) => {
          const isSelected = value === selected;
          const isDisabled = disabled?.(value) ?? false;

          return (
            <button
              key={value}
              ref={isSelected ? selectedRef : undefined}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => !isDisabled && onSelect(value)}
              disabled={isDisabled}
              className={cn(
                `mx-1 cursor-pointer rounded-md py-1.5 text-center text-sm transition-colors focus-visible:outline-hidden`,
                `hover:bg-bg-subtle focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-inset`,
                isSelected && "bg-bg-brand text-fg-on-brand hover:bg-bg-brand-strong",
                isDisabled && "cursor-not-allowed opacity-50"
              )}
            >
              {formatValue(value)}
            </button>
          );
        })}
      </div>
      {/* Bottom spacer for centering last items */}
      <div className="h-19" aria-hidden="true" />
    </div>
  );
};
