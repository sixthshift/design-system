import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type BarChartItem = {
  label: string;
  value: number;
  color?: string;
};

export type BarChartProps = React.HTMLAttributes<HTMLDivElement> & {
  data: BarChartItem[];
  showValues?: boolean;
  maxValue?: number;
  formatValue?: (value: number) => string;
  barHeight?: number;
};

const DEFAULT_COLORS = ["var(--fg-brand)", "var(--fg-success)", "var(--fg-warning)", "var(--fg-danger)", "var(--fg-subtle)"];

export const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>(
  ({ data, showValues = true, maxValue: maxValueProp, formatValue = (v) => String(v), barHeight = 24, className, ...rest }, ref) => {
    const maxValue = maxValueProp ?? Math.max(...data.map((d) => d.value), 1);

    return (
      <div ref={ref} {...rest} className={cn("flex flex-col gap-2", className)}>
        {data.map((item, i) => {
          // Clamp both ends: a negative value would otherwise emit an invalid
          // `width: -n%`, whose rendering is undefined.
          const percent = Math.min(Math.max((item.value / maxValue) * 100, 0), 100);
          const color = item.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];

          return (
            <div key={item.label} className="flex items-center gap-3">
              <span className="w-20 shrink-0 truncate text-right text-fg-subtle text-sm">{item.label}</span>
              <div className="flex-1 overflow-hidden rounded-sm bg-bg-subtle" style={{ height: barHeight }}>
                <div className="h-full rounded-sm transition-all duration-300" style={{ width: `${percent}%`, backgroundColor: color }} />
              </div>
              {showValues && <span className="w-12 shrink-0 text-right font-medium text-fg-normal text-sm">{formatValue(item.value)}</span>}
            </div>
          );
        })}
      </div>
    );
  }
);
BarChart.displayName = "BarChart";
