import { FAMILIES, type Take } from "../takes";
import { Vignette } from "./Vignette";

/**
 * One take, complete: its ramps, what it ships in, where it breaks, and the
 * shared vignette in both modes.
 *
 * The two-column split is deliberate — the ramps answer "what is in it" and the
 * vignettes answer "what does it do to a screen", and reading those side by side
 * is what makes a premise comparable to another premise. Story-only.
 */

function Ramps({ take }: { take: Take }) {
  return (
    <div className="flex flex-col gap-1.5">
      {FAMILIES.map((family) => (
        <div key={family} className="grid grid-cols-[3.5rem_1fr] items-center gap-2">
          <span className="text-right font-mono text-[10px] text-fg-subtle">{family}</span>
          <div className="grid grid-cols-11 gap-0.5">
            {take.palette[family].map((hex) => (
              <span key={hex} className="aspect-[2/3] rounded-sm ring-1 ring-black/10 ring-inset" style={{ background: hex }} title={hex} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Renders the single-backtick code spans the take copy uses. */
function Prose({ children }: { children: string }) {
  return (
    <>
      {children.split(/`([^`]+)`/g).map((part, index) =>
        index % 2 === 1 ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: split output is positional
          <code key={index} className="font-mono text-[0.92em]">
            {part}
          </code>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: split output is positional
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

export function TakeSpecimen({ take, swap }: { take: Take; swap?: { palette: Take["palette"]; label: string } }) {
  return (
    <section className="sb-unstyled flex flex-col gap-5">
      <div className="flex flex-col gap-2 border-fg-normal border-t-2 pt-4">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-medium font-mono text-fg-subtle text-xs">{take.number}</span>
          <h3 className="font-semibold text-fg-normal text-xl tracking-tight">{take.name}</h3>
        </div>
        <p className="max-w-[64ch] text-fg-subtle text-sm">{take.thesis}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Ramps take={take} />
          <dl className="flex flex-col gap-2">
            <div className="grid grid-cols-[5rem_1fr] gap-2.5">
              <dt className="pt-0.5 font-mono text-[10px] text-fg-subtle uppercase tracking-[0.09em]">Ships in</dt>
              <dd className="text-[13px] text-fg-subtle leading-snug">{take.shipsIn}</dd>
            </div>
            <div className="grid grid-cols-[5rem_1fr] gap-2.5">
              <dt className="pt-0.5 font-mono text-[10px] text-fg-subtle uppercase tracking-[0.09em]">Breaks when</dt>
              <dd className="text-[13px] text-fg-subtle leading-snug">
                <Prose>{take.breaksWhen}</Prose>
              </dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {swap ? (
            <>
              <Vignette palette={take.palette} mode="light" label={`accent: ${take.name === "Hue-anchored" ? "blue" : "as shipped"}`} />
              <Vignette palette={swap.palette} mode="light" label={swap.label} />
            </>
          ) : (
            <>
              <Vignette palette={take.palette} mode="light" />
              <Vignette palette={take.palette} mode="dark" />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
