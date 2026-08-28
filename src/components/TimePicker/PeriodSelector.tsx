"use client";

import { cn } from "@sixthshift/design-system/utils";
import type { TimePeriod } from "./timepicker.types";

export type PeriodSelectorProps = {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
};

export const PeriodSelector = ({ value, onChange }: PeriodSelectorProps) => {
  return (
    <div className="flex h-48 w-12 flex-col items-center justify-center gap-1 rounded-lg border border-border-subtle bg-bg-subtle/50">
      {(["AM", "PM"] as const).map((period) => (
        <button
          key={period}
          type="button"
          onClick={() => onChange(period)}
          className={cn(
            `w-10 cursor-pointer rounded-md py-1.5 text-center text-sm transition-colors focus-visible:outline-hidden`,
            `hover:bg-bg-subtle focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-inset`,
            value === period && "bg-bg-brand text-fg-on-brand hover:bg-bg-brand-strong"
          )}
        >
          {period}
        </button>
      ))}
    </div>
  );
};
