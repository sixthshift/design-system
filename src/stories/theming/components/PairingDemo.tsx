/**
 * `fg-danger` versus `fg-on-danger`, shown rather than described.
 *
 * The `-on-` half of the naming convention is the part readers get wrong, and
 * the cost of getting it wrong is invisible in a diff and glaring on screen. A
 * sentence explaining the rule is easy to nod along to; three swatches, one of
 * them unreadable, is not.
 *
 * The third panel is deliberately the broken pairing. It is labelled as such
 * and is the only place on the page a contrast failure is rendered on purpose.
 *
 * Story-only. `src/stories` is excluded from the published package.
 */

function Panel({ title, code, className, note }: { title: string; code: string; className: string; note: string }) {
  return (
    <div className="flex min-w-52 flex-1 flex-col gap-2">
      <span className="font-medium text-fg-subtle text-xs">{title}</span>
      <div className={`rounded-lg border border-border-normal p-4 text-sm ${className}`}>Delete 3 invoices</div>
      <code className="font-mono text-[11px] text-fg-subtle">{code}</code>
      <span className="text-fg-subtle text-xs">{note}</span>
    </div>
  );
}

export function PairingDemo() {
  return (
    <div className="sb-unstyled flex flex-wrap gap-4">
      <Panel
        title="fg-danger"
        className="bg-bg-normal text-fg-danger"
        code="bg-bg-normal + text-fg-danger"
        note="Danger-coloured text on an ordinary surface. Darkened until it is readable there."
      />
      <Panel
        title="fg-on-danger"
        className="bg-bg-danger text-fg-on-danger"
        code="bg-bg-danger + text-fg-on-danger"
        note="The partner of bg-danger — the text that sits on top of it. Near-white, because that surface is dark."
      />
      <Panel
        title="the mix-up"
        className="bg-bg-danger text-fg-danger"
        code="bg-bg-danger + text-fg-danger"
        note="Both are danger-coloured, so they are the same hue at similar lightness. This is what swapping the two produces."
      />
    </div>
  );
}
