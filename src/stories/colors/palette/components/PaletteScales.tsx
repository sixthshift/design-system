import { readPalette } from "../../../theme/read-tokens";
import { inkOn, lightness } from "./lightness";

/**
 * The raw scales, one row per family, every stop in the same column.
 *
 * The column alignment is the point rather than a layout convenience: the
 * palette's central claim is that a stop means the same thing in every hue, and
 * that claim is only checkable when `red-300` sits directly above
 * `green-300`. The previous layout wrapped each family independently, which
 * made the one defect worth seeing — families disagreeing about a stop — the
 * one thing it could not show.
 *
 * Values come from `readPalette()`, so a stop deleted from `tokens.css` leaves a
 * gap here rather than a stale swatch. Story-only.
 */

export const STOPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] as const;

/** Families in role order — what each is wired to, not what hue it happens to be. */
export const FAMILIES = [
  { scale: "sand", role: "Neutral — every surface, border and text" },
  { scale: "blue", role: "Brand, focus ring" },
  { scale: "green", role: "Success" },
  { scale: "amber", role: "Warning" },
  { scale: "red", role: "Danger" },
] as const;

function Row({ scale, role }: { scale: string; role: string }) {
  const steps = readPalette()[scale] ?? {};

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <h3 className="font-mono font-semibold text-fg-normal text-sm">{scale}</h3>
        <span className="text-fg-subtle text-xs">{role}</span>
      </div>
      <div className="grid grid-cols-11 gap-1">
        {STOPS.map((stop) => {
          const hex = steps[stop];
          if (!hex) return <div key={stop} className="rounded-md border border-border-normal border-dashed" />;
          return (
            <div
              key={stop}
              className="flex aspect-[5/6] flex-col justify-between rounded-md p-1.5 ring-1 ring-black/10 ring-inset"
              style={{ backgroundColor: hex, color: inkOn(hex) }}
              title={`--color-${scale}-${stop}: ${hex}`}
            >
              <span className="font-mono font-semibold text-[10px] leading-none">{stop}</span>
              <span className="flex flex-col gap-0.5 font-mono text-[10px] leading-none">
                <span>{hex.replace("#", "")}</span>
                <span>L {lightness(hex).toFixed(2)}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PaletteScales({ scale }: { scale?: string }) {
  const shown = scale ? FAMILIES.filter((family) => family.scale === scale) : FAMILIES;

  return (
    <div className="sb-unstyled flex flex-col gap-5">
      {shown.map((family) => (
        <Row key={family.scale} {...family} />
      ))}
    </div>
  );
}
