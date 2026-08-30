import type { Palette } from "../takes";

/**
 * The same small product surface, painted from one take's palette.
 *
 * Ramps show what a palette contains; they do not show what it feels like to
 * use, and the difference between these takes is almost entirely the second
 * thing. So every take gets an identical fragment — solid fill, tinted fill,
 * outline, three states, a selected row, an alert — and the only variable is
 * which palette painted it.
 *
 * Colours are inline because they are data rather than design decisions: these
 * are candidate palettes, not the shipped theme, and reaching them through
 * utilities would imply they are tokens. Story-only.
 */

const S = { 50: 0, 100: 1, 200: 2, 300: 3, 400: 4, 500: 5, 600: 6, 700: 7, 800: 8, 900: 9, 950: 10 } as const;

type Mode = "light" | "dark";
type Family = keyof Palette;

export function Vignette({ palette, mode, label }: { palette: Palette; mode: Mode; label?: string }) {
  const dark = mode === "dark";
  const at = (family: Family, stop: keyof typeof S) => palette[family][S[stop]] as string;

  const ground = dark ? at("neutral", 950) : at("neutral", 50);
  const surface = dark ? at("neutral", 900) : "#ffffff";
  const ink = dark ? at("neutral", 50) : at("neutral", 900);
  const dim = dark ? at("neutral", 400) : at("neutral", 500);
  const line = dark ? at("neutral", 800) : at("neutral", 200);

  const solid = (family: Family) => at(family, dark ? 500 : 600);
  const tint = (family: Family) => at(family, dark ? 950 : 100);
  const onTint = (family: Family) => at(family, dark ? 300 : 800);
  const tintLine = (family: Family) => at(family, dark ? 800 : 300);

  const chip = (family: Family, text: string) => (
    <span
      key={text}
      className="rounded-full border px-2 py-px font-semibold text-[10px]"
      style={{ background: tint(family), color: onTint(family), borderColor: tintLine(family) }}
    >
      {text}
    </span>
  );

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border p-4" style={{ background: ground, borderColor: line, color: ink }}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-[13px] tracking-tight">Deployments</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.13em] opacity-55">{label ?? mode}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-md px-2.5 py-1 font-medium text-[11px]" style={{ background: solid("accent"), color: "#ffffff" }}>
          Deploy
        </span>
        <span className="rounded-md border px-2.5 py-1 font-medium text-[11px]" style={{ background: surface, color: ink, borderColor: line }}>
          Roll back
        </span>
        <span className="rounded-md px-2.5 py-1 font-medium text-[11px]" style={{ background: tint("accent"), color: onTint("accent") }}>
          History
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {chip("green", "Live")}
        {chip("amber", "Queued")}
        {chip("red", "Failed")}
      </div>

      <div className="overflow-hidden rounded-lg border" style={{ borderColor: line, background: surface }}>
        {[
          { name: "api · main", when: "2m ago", selected: true },
          { name: "web · main", when: "1h ago", selected: false },
          { name: "docs · main", when: "3h ago", selected: false },
        ].map((row, index) => (
          <div
            key={row.name}
            className="flex justify-between gap-2 px-2.5 py-1.5 text-[11px]"
            style={{
              borderTop: index === 0 ? undefined : `1px solid ${line}`,
              background: row.selected ? tint("accent") : undefined,
              color: row.selected ? onTint("accent") : ink,
            }}
          >
            <span>{row.name}</span>
            <span style={{ color: row.selected ? onTint("accent") : dim }}>{row.when}</span>
          </div>
        ))}
      </div>

      <div className="rounded-lg border px-2.5 py-2 text-[11px]" style={{ background: tint("red"), borderColor: tintLine("red"), color: onTint("red") }}>
        Build failed on <code className="font-mono">docs</code> — 2 type errors.
      </div>
    </div>
  );
}
