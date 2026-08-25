import { cn } from "@sixthshift/design-system/utils";
import type * as React from "react";
import { Temporal } from "../../temporal";
import { DAY_KEYS, DAY_LABELS, DEFAULT_COLOR_SCALE, getIntensity, type HeatMapCell, MONTH_NAMES } from "./heat-map.utils";

export type HeatMapCalendarProps = React.HTMLAttributes<HTMLDivElement> & {
  data: HeatMapCell[];
  colorScale?: string[];
  cellSize?: number;
  cellGap?: number;
  formatTooltip?: (cell: HeatMapCell) => string;
};

type MonthGrid = {
  year: number;
  month: number;
  label: string;
  weeks: ({ date: string; value: number; col: number } | null)[][];
};

function buildMonthGrids(data: HeatMapCell[]): MonthGrid[] {
  const dataMap = new Map(data.map((d) => [d.date, d.value]));

  const dates = data.map((d) => Temporal.PlainDate.from(d.date)).sort(Temporal.PlainDate.compare);
  const minDate = dates[0]!;
  const maxDate = dates[dates.length - 1]!;

  const months: MonthGrid[] = [];
  let cursor = Temporal.PlainDate.from({ year: minDate.year, month: minDate.month, day: 1 });
  const endMonth = Temporal.PlainDate.from({ year: maxDate.year, month: maxDate.month, day: 1 });

  while (Temporal.PlainDate.compare(cursor, endMonth) <= 0) {
    const year = cursor.year;
    const month = cursor.month;
    const daysInMonth = cursor.daysInMonth;

    const weeks: ({ date: string; value: number; col: number } | null)[][] = [];
    let currentWeek: ({ date: string; value: number; col: number } | null)[] = [];

    const firstDow = cursor.dayOfWeek - 1;
    for (let i = 0; i < firstDow; i++) {
      currentWeek.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = Temporal.PlainDate.from({ year, month, day });
      const dateStr = date.toString();
      const col = date.dayOfWeek - 1;

      currentWeek.push({ date: dateStr, value: dataMap.get(dateStr) ?? 0, col });

      if (col === 6 || day === daysInMonth) {
        if (day === daysInMonth && col < 6) {
          for (let i = col + 1; i <= 6; i++) {
            currentWeek.push(null);
          }
        }
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    months.push({
      year,
      month,
      label: `${MONTH_NAMES[month - 1]} ${year}`,
      weeks,
    });

    cursor = month === 12 ? Temporal.PlainDate.from({ year: year + 1, month: 1, day: 1 }) : Temporal.PlainDate.from({ year, month: month + 1, day: 1 });
  }

  return months;
}

export const HeatMapCalendar = ({
  data,
  colorScale = DEFAULT_COLOR_SCALE,
  cellSize = 12,
  cellGap = 2,
  formatTooltip,
  className,
  ...rest
}: HeatMapCalendarProps) => {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const months = buildMonthGrids(data);
  const step = cellSize + cellGap;
  const gridWidth = 7 * step;

  return (
    <div {...rest} className={cn("flex flex-wrap gap-4", className)}>
      {months.map((month) => {
        const headerHeight = 24;
        const dayLabelHeight = 14;
        const svgHeight = headerHeight + dayLabelHeight + month.weeks.length * step;

        return (
          <svg key={month.label} width={gridWidth} height={svgHeight} className="overflow-visible" role="img">
            <title>{month.label}</title>
            <text x={0} y={14} className="fill-fg-normal" fontSize={12} fontWeight={500}>
              {month.label}
            </text>
            {DAY_LABELS.map((label, i) => (
              <text key={`day-${DAY_KEYS[i]}`} x={i * step + cellSize / 2} y={headerHeight + 10} textAnchor="middle" className="fill-fg-subtle" fontSize={9}>
                {label}
              </text>
            ))}
            {month.weeks.map((week, wi) =>
              week.map((cell) => {
                if (!cell) return null;
                const intensity = getIntensity(cell.value, maxValue, colorScale.length);
                const fill = cell.value > 0 ? colorScale[intensity]! : colorScale[0]!;
                return (
                  <rect key={cell.date} x={cell.col * step} y={headerHeight + dayLabelHeight + wi * step} width={cellSize} height={cellSize} rx={2} fill={fill}>
                    {formatTooltip && <title>{formatTooltip({ date: cell.date, value: cell.value })}</title>}
                  </rect>
                );
              })
            )}
          </svg>
        );
      })}
    </div>
  );
};
