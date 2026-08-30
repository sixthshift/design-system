import { readPalette } from "../../../theme/read-tokens";
import { lightness } from "./lightness";
import { FAMILIES, STOPS } from "./PaletteScales";

/**
 * Perceived lightness against stop, one line per family.
 *
 * Seven lines lying on top of each other is the whole argument for how this
 * palette is built, and it is an argument a grid of swatches cannot make: the
 * eye reads a red and a green at the same stop as different colours long before
 * it reads them as the same weight. The two neutrals leaving the bundle below
 * 700 is the one deliberate exception, and it shows here as exactly that — a
 * documented divergence rather than the noise the previous palette produced.
 *
 * Measured from the shipped hexes via `lightness()`, so this is a plot of the
 * stylesheet, not of the generator's intent. Story-only.
 */

const WIDTH = 640;
const HEIGHT = 300;
const PAD = { top: 16, right: 88, bottom: 30, left: 40 };

const x = (index: number) => PAD.left + (index * (WIDTH - PAD.left - PAD.right)) / (STOPS.length - 1);
const y = (value: number) => PAD.top + (1 - value) * (HEIGHT - PAD.top - PAD.bottom);

type Point = { index: number; stop: string; hex: string };

export function SpineChart() {
  const palette = readPalette();
  const lines = FAMILIES.map(({ scale }) => {
    const steps = palette[scale] ?? {};
    const points: Point[] = [];
    STOPS.forEach((stop, index) => {
      const hex = steps[stop];
      if (hex) points.push({ index, stop, hex });
    });
    return { scale, stroke: steps["600"] ?? "currentColor", points };
  });

  return (
    <div className="sb-unstyled overflow-x-auto">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full min-w-[520px]"
        role="img"
        aria-label="Perceived lightness by stop. All seven families follow one curve; the two neutrals run deeper below the 700 stop."
      >
        <title>Perceived lightness by stop, per family</title>

        {[0, 0.25, 0.5, 0.75, 1].map((gridline) => (
          <g key={gridline}>
            <line x1={PAD.left} y1={y(gridline)} x2={WIDTH - PAD.right} y2={y(gridline)} className="stroke-border-subtle" strokeWidth={1} />
            <text x={PAD.left - 8} y={y(gridline) + 4} textAnchor="end" className="fill-fg-subtle font-mono text-[10px]">
              {gridline.toFixed(2)}
            </text>
          </g>
        ))}

        {lines.map(({ scale, stroke, points }) => (
          <g key={scale}>
            <polyline
              points={points.map((point) => `${x(point.index)},${y(lightness(point.hex))}`).join(" ")}
              fill="none"
              stroke={stroke}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {points.map((point) => (
              <circle key={point.stop} cx={x(point.index)} cy={y(lightness(point.hex))} r={2.5} fill={point.hex} stroke={stroke} strokeWidth={1} />
            ))}
            {points.at(-1) && (
              <text x={WIDTH - PAD.right + 8} y={y(lightness((points.at(-1) as Point).hex)) + 3.5} className="fill-fg-subtle font-mono text-[10px]">
                {scale}
              </text>
            )}
          </g>
        ))}

        {STOPS.map((stop, index) => (
          <text key={stop} x={x(index)} y={HEIGHT - 10} textAnchor="middle" className="fill-fg-subtle font-mono text-[10px]">
            {stop}
          </text>
        ))}
      </svg>
    </div>
  );
}
