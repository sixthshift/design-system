import { TAKES } from "../takes";

/**
 * The seven takes on the two axes that actually separate them.
 *
 * Warm-versus-cool is the axis people reach for and it explains nothing: two
 * takes can share a temperature and still be unusable in each other's place.
 * What separates them is how much identity the default asserts, and whether the
 * structure survives having its hues changed later — which is what decides
 * whether a palette is a starting point or a finished answer.
 *
 * Step-semantic is plotted by hand: it is a contract rather than a palette, so
 * it has no entry in TAKES and no hue of its own. Story-only.
 */

const WIDTH = 720;
const HEIGHT = 320;
const PAD = { top: 20, right: 132, bottom: 48, left: 56 };

const x = (value: number) => PAD.left + ((value - 0.5) / 4.5) * (WIDTH - PAD.left - PAD.right);
const y = (value: number) => HEIGHT - PAD.bottom - ((value - 1) / 4) * (HEIGHT - PAD.top - PAD.bottom);

export function PositioningPlot({ stepSemanticColour }: { stepSemanticColour: string }) {
  const points = [
    ...TAKES.map((take) => ({ label: take.name, colour: take.palette.accent[6] as string, asserts: take.asserts, survivesSwap: take.survivesSwap })),
    { label: "Step-semantic", colour: stepSemanticColour, asserts: 1.5, survivesSwap: 4.8 },
  ];

  return (
    <div className="sb-unstyled overflow-x-auto">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full min-w-[560px]"
        role="img"
        aria-label="The seven takes plotted by how much identity each asserts against how well its structure survives a hue swap. Contrast-locked, seeded and step-semantic sit high on portability; expressive sits alone at high assertion and low portability."
      >
        <title>Palette takes by identity asserted and portability</title>

        <line x1={PAD.left} y1={HEIGHT - PAD.bottom} x2={WIDTH - PAD.right} y2={HEIGHT - PAD.bottom} className="stroke-border-normal" />
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={HEIGHT - PAD.bottom} className="stroke-border-normal" />

        <text x={(PAD.left + WIDTH - PAD.right) / 2} y={HEIGHT - 14} textAnchor="middle" className="fill-fg-subtle font-mono text-[11px]">
          identity asserted →
        </text>
        <text
          transform={`translate(18, ${(PAD.top + HEIGHT - PAD.bottom) / 2}) rotate(-90)`}
          textAnchor="middle"
          className="fill-fg-subtle font-mono text-[11px]"
        >
          structure survives a hue swap →
        </text>

        {points.map((point) => (
          <g key={point.label}>
            <circle cx={x(point.asserts)} cy={y(point.survivesSwap)} r={7} fill={point.colour} className="stroke-bg-normal" strokeWidth={2} />
            <text x={x(point.asserts) + 13} y={y(point.survivesSwap) + 4} className="fill-fg-subtle text-[11.5px]">
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
