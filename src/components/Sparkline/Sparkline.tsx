import type { Interpolation } from "@sixthshift/design-system/line-chart";
import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type SparklineProps = React.HTMLAttributes<HTMLSpanElement> & {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillArea?: boolean;
  interpolation?: Interpolation;
  strokeWidth?: number;
};

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

/**
 * A minimal inline trend line for embedding in a table cell or card — an
 * `<svg>` inside an `inline-block` `<span>`, sized to `width`/`height` rather
 * than a chart that lays out its own labels or axes.
 *
 * Requires at least 2 data points; with fewer it renders nothing (`null`).
 * `color` is a single CSS color string (default `var(--fg-brand)`), and
 * `interpolation` reuses the same `Interpolation` type as `LineChart`. The
 * accessible name is a static `aria-label="Trend line"` — it does not
 * describe the actual values.
 */
export const Sparkline = React.forwardRef<HTMLSpanElement, SparklineProps>(
  ({ data, width = 80, height = 24, color = "var(--fg-brand)", fillArea = false, interpolation = "monotone", strokeWidth = 1.5, className, ...rest }, ref) => {
    if (data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const padY = 2;
    const padX = 1;
    const innerW = width - padX * 2;
    const innerH = height - padY * 2;

    const points = data.map((v, i) => ({
      x: padX + (i / (data.length - 1)) * innerW,
      y: padY + innerH - ((v - min) / range) * innerH,
    }));

    const path = buildPath(points, interpolation);

    return (
      <span ref={ref} {...rest} className={cn("inline-block align-middle", className)}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Trend line">
          {fillArea && path && (
            <path d={`${path} L ${points[points.length - 1]!.x} ${height - padY} L ${points[0]!.x} ${height - padY} Z`} fill={color} opacity={0.12} />
          )}
          <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
);
Sparkline.displayName = "Sparkline";
