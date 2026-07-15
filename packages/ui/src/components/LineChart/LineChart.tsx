import { Tooltip } from "@sixthshift/ui/tooltip";
import { cn } from "@sixthshift/ui/utils";
import type * as React from "react";

export type LineChartDataPoint = {
  label: string;
  value: number;
};

export type LineChartSeries = {
  data: LineChartDataPoint[];
  name?: string;
  color?: string;
};

export type Interpolation = "linear" | "monotone" | "stepBefore" | "stepAfter";

export type LineChartProps = React.HTMLAttributes<HTMLDivElement> & {
  series: LineChartSeries[];
  height?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  showDots?: boolean;
  showLabels?: boolean;
  showValues?: boolean;
  interpolation?: Interpolation;
  fillArea?: boolean;
  yMin?: number;
  yMax?: number;
  yTicks?: number;
  showTooltip?: boolean;
  formatTooltip?: (point: LineChartDataPoint, seriesName?: string) => string;
  formatValue?: (value: number) => string;
};

const SERIES_COLORS = ["var(--fg-brand)", "var(--fg-success)", "var(--fg-warning)", "var(--fg-danger)", "var(--fg-subtle)"];

const PADDING = { top: 12, right: 16, bottom: 32, left: 48 };
const PADDING_NO_AXES = { top: 8, right: 8, bottom: 8, left: 8 };

function niceScale(min: number, max: number, ticks: number) {
  if (min === max) {
    const pad = min === 0 ? 1 : Math.abs(min) * 0.1;
    return { min: min - pad, max: max + pad, step: (pad * 2) / ticks };
  }
  const range = max - min;
  const roughStep = range / ticks;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const residual = roughStep / magnitude;
  const niceStep = residual <= 1.5 ? magnitude : residual <= 3 ? 2 * magnitude : residual <= 7 ? 5 * magnitude : 10 * magnitude;
  const niceMin = Math.floor(min / niceStep) * niceStep;
  const niceMax = Math.ceil(max / niceStep) * niceStep;
  return { min: niceMin, max: niceMax, step: niceStep };
}

function buildPath(points: { x: number; y: number }[], interpolation: Interpolation): string {
  if (points.length === 0) return "";
  const parts = [`M ${points[0]!.x} ${points[0]!.y}`];

  switch (interpolation) {
    case "monotone":
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]!;
        const curr = points[i]!;
        const cpx = (prev.x + curr.x) / 2;
        parts.push(`C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`);
      }
      break;
    case "stepAfter":
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]!;
        const curr = points[i]!;
        parts.push(`L ${curr.x} ${prev.y}`);
        parts.push(`L ${curr.x} ${curr.y}`);
      }
      break;
    case "stepBefore":
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]!;
        const curr = points[i]!;
        parts.push(`L ${prev.x} ${curr.y}`);
        parts.push(`L ${curr.x} ${curr.y}`);
      }
      break;
    default:
      for (let i = 1; i < points.length; i++) {
        parts.push(`L ${points[i]!.x} ${points[i]!.y}`);
      }
      break;
  }

  return parts.join(" ");
}

export const LineChart = ({
  series,
  height = 200,
  showGrid = true,
  showAxes = true,
  showDots = true,
  showLabels = true,
  showValues = false,
  interpolation = "monotone",
  fillArea = false,
  yMin: yMinProp,
  yMax: yMaxProp,
  yTicks = 4,
  showTooltip = false,
  formatTooltip,
  formatValue = (v) => String(v),
  className,
  ...rest
}: LineChartProps) => {
  const allValues = series.flatMap((s) => s.data.map((d) => d.value));
  const rawMin = yMinProp ?? Math.min(...allValues);
  const rawMax = yMaxProp ?? Math.max(...allValues);
  const scale = niceScale(rawMin, rawMax, yTicks);

  const labelSet = new Set<string>();
  for (const s of series) {
    for (const d of s.data) {
      labelSet.add(d.label);
    }
  }
  const labels = [...labelSet];
  const labelCount = labels.length;
  const labelIndex = new Map(labels.map((l, i) => [l, i]));

  const padding = showAxes ? PADDING : PADDING_NO_AXES;
  const viewWidth = 600;
  const chartW = viewWidth - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const xStep = labelCount > 1 ? chartW / (labelCount - 1) : 0;

  function toX(i: number) {
    return padding.left + i * xStep;
  }

  function toY(v: number) {
    const ratio = (v - scale.min) / (scale.max - scale.min);
    return padding.top + chartH - ratio * chartH;
  }

  const yTickValues: number[] = [];
  for (let v = scale.min; v <= scale.max + scale.step * 0.01; v += scale.step) {
    yTickValues.push(Math.round(v * 1e6) / 1e6);
  }

  function tooltipText(point: LineChartDataPoint, seriesName?: string) {
    if (formatTooltip) return formatTooltip(point, seriesName);
    const prefix = seriesName ? `${seriesName}: ` : `${point.label}: `;
    return `${prefix}${formatValue(point.value)}`;
  }

  return (
    <div {...rest} className={cn("relative w-full", className)}>
      <svg viewBox={`0 0 ${viewWidth} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet" role="img">
        <title>Line chart</title>
        {showGrid &&
          yTickValues.map((v) => (
            <line
              key={`grid-${v}`}
              x1={padding.left}
              y1={toY(v)}
              x2={viewWidth - padding.right}
              y2={toY(v)}
              className="stroke-border-subtle"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          ))}

        {showAxes && (
          <>
            <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartH} className="stroke-border-normal" strokeWidth={1} />
            <line
              x1={padding.left}
              y1={padding.top + chartH}
              x2={viewWidth - padding.right}
              y2={padding.top + chartH}
              className="stroke-border-normal"
              strokeWidth={1}
            />
            {yTickValues.map((v) => (
              <text key={`ytick-${v}`} x={padding.left - 8} y={toY(v)} textAnchor="end" dominantBaseline="middle" className="fill-fg-subtle" fontSize={11}>
                {formatValue(v)}
              </text>
            ))}
          </>
        )}

        {showLabels &&
          labels.map((label, i) => (
            <text key={`xlabel-${label}`} x={toX(i)} y={height - 4} textAnchor="middle" className="fill-fg-subtle" fontSize={11}>
              {label}
            </text>
          ))}

        {series.map((s, si) => {
          const color = s.color ?? SERIES_COLORS[si % SERIES_COLORS.length];
          const points = s.data.map((d) => ({ x: toX(labelIndex.get(d.label)!), y: toY(d.value) }));
          const path = buildPath(points, interpolation);

          return (
            <g key={s.name ?? si}>
              {fillArea && path && (
                <path
                  d={`${path} L ${points[points.length - 1]!.x} ${padding.top + chartH} L ${points[0]!.x} ${padding.top + chartH} Z`}
                  fill={color}
                  opacity={0.1}
                />
              )}
              {path && <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />}
              {showDots && points.map((p, pi) => <circle key={`dot-${s.data[pi]!.label}`} cx={p.x} cy={p.y} r={3} fill={color} />)}
              {showValues &&
                points.map((p, vi) => (
                  <text key={`val-${s.data[vi]!.label}`} x={p.x} y={p.y - 10} textAnchor="middle" className="fill-fg-normal" fontSize={10} fontWeight={600}>
                    {formatValue(s.data[vi]!.value)}
                  </text>
                ))}
            </g>
          );
        })}
      </svg>

      {showTooltip &&
        series.map((s, si) =>
          s.data.map((d) => {
            const xPct = (toX(labelIndex.get(d.label)!) / viewWidth) * 100;
            const yPct = (toY(d.value) / height) * 100;

            return (
              <Tooltip key={`tip-${s.name ?? si}-${d.label}`} delayShow={0}>
                <Tooltip.Trigger asChild>
                  <span className="absolute block -translate-x-1/2 -translate-y-1/2" style={{ left: `${xPct}%`, top: `${yPct}%`, width: 16, height: 16 }} />
                </Tooltip.Trigger>
                <Tooltip.Body>{tooltipText(d, s.name)}</Tooltip.Body>
              </Tooltip>
            );
          })
        )}
    </div>
  );
};
