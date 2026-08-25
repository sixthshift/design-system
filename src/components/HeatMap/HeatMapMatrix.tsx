import { cn } from "@sixthshift/design-system/utils";
import type * as React from "react";
import { Temporal } from "../../temporal";
import { DAY_KEYS, DAY_LABELS, DEFAULT_COLOR_SCALE, getIntensity, type HeatMapCell } from "./heat-map.utils";

export type HeatMapMatrixProps = React.HTMLAttributes<HTMLDivElement> & {
  data: HeatMapCell[];
  colorScale?: string[];
  cellSize?: number;
  cellGap?: number;
  showDayLabels?: boolean;
  formatTooltip?: (cell: HeatMapCell) => string;
};

export const HeatMapMatrix = ({
  data,
  colorScale = DEFAULT_COLOR_SCALE,
  cellSize = 12,
  cellGap = 2,
  showDayLabels = true,
  formatTooltip,
  className,
  ...rest
}: HeatMapMatrixProps) => {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const sorted = [...data].map((d) => ({ ...d, plain: Temporal.PlainDate.from(d.date) })).sort((a, b) => Temporal.PlainDate.compare(a.plain, b.plain));

  const rows: { date: string; value: number; col: number }[][] = [];
  let currentRow: { date: string; value: number; col: number }[] = [];
  let lastDow = -1;

  for (const cell of sorted) {
    const dow = cell.plain.dayOfWeek - 1;
    if (dow <= lastDow && currentRow.length > 0) {
      rows.push(currentRow);
      currentRow = [];
    }
    currentRow.push({ date: cell.date, value: cell.value, col: dow });
    lastDow = dow;
  }
  if (currentRow.length > 0) rows.push(currentRow);

  const step = cellSize + cellGap;
  const labelHeight = showDayLabels ? 14 : 0;
  const gridWidth = 7 * step;
  const gridHeight = rows.length * step;

  return (
    <div {...rest} className={cn("inline-block", className)}>
      <svg width={gridWidth} height={gridHeight + labelHeight} className="overflow-visible" role="img">
        <title>Heat map</title>
        {showDayLabels &&
          DAY_LABELS.map((label, i) => (
            <text key={`col-${DAY_KEYS[i]}`} x={i * step + cellSize / 2} y={10} textAnchor="middle" className="fill-fg-subtle" fontSize={9}>
              {label}
            </text>
          ))}
        {rows.map((row, ri) =>
          row.map((cell) => {
            const intensity = getIntensity(cell.value, maxValue, colorScale.length);
            const fill = cell.value > 0 ? colorScale[intensity]! : colorScale[0]!;
            return (
              <rect key={cell.date} x={cell.col * step} y={labelHeight + ri * step} width={cellSize} height={cellSize} rx={2} fill={fill}>
                {formatTooltip && <title>{formatTooltip({ date: cell.date, value: cell.value })}</title>}
              </rect>
            );
          })
        )}
      </svg>
    </div>
  );
};
