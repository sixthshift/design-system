import { STEP_JOBS, steps } from "../takes";

/**
 * The twelve-step contract, each step labelled with the job it holds.
 *
 * Shown as labelled bars rather than as a ramp of squares because the claim is
 * not "here are twelve colours" — it is that step 9 is *the solid fill* in every
 * hue that ships, so a component asking for a solid fill never needs to know
 * which hue answered. The label is the substance; the colour is the illustration.
 *
 * Story-only.
 */

export function StepContract({ hue = 250 }: { hue?: number }) {
  const scale = steps(hue);

  return (
    <div className="sb-unstyled flex flex-col gap-1">
      {scale.map((hex, index) => (
        <div key={hex} className="grid grid-cols-[1.75rem_1fr] items-center gap-2.5">
          <span className="text-right font-mono text-[10px] text-fg-subtle">{index + 1}</span>
          <div
            className="flex h-6 items-center rounded-md px-3 font-mono text-[10px] ring-1 ring-black/10 ring-inset"
            style={{ background: hex, color: index < 8 ? (scale[11] as string) : "#ffffff" }}
          >
            {STEP_JOBS[index]}
          </div>
        </div>
      ))}
    </div>
  );
}
