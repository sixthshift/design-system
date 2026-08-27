import * as React from "react";
import { type Resolved, resolveCell } from "../read-recipes";

export type Column = { token: string; label: string };

/**
 * One recipe cell as a table row, with a swatch per token.
 *
 * Resolution touches the DOM — a probe element has to exist for the browser to
 * cascade against — so it happens in an effect rather than during render, and
 * the row paints its labels on the first pass and its swatches on the second.
 */
export function CellRow({
  hook,
  label,
  attrs,
  declared,
  columns,
  modeVars,
}: {
  hook: string;
  label: string;
  attrs: Record<string, string>;
  /** What this cell declares, as authored — `var(--bg-danger)`, not a hex. */
  declared: Record<string, string>;
  columns: Column[];
  modeVars: Record<string, string>;
}) {
  const [resolved, setResolved] = React.useState<Record<string, Resolved> | null>(null);
  const tokens = columns.map((column) => column.token).join(",");

  // `attrs` and `modeVars` arrive as fresh objects on every render, so depending
  // on them directly would re-probe the DOM forever. Serialising first makes the
  // dependency list both stable and genuinely exhaustive — the effect reads only
  // what it lists, rather than suppressing the rule.
  const attrsKey = JSON.stringify(attrs);
  const modeKey = JSON.stringify(modeVars);

  // `useLayoutEffect`, not `useEffect`: resolution needs the DOM, but it must
  // land before the browser paints. With `useEffect` there is a committed frame
  // showing the `…` placeholders, and the a11y suite can scan it — which it did,
  // once, as an unreproducible failure. Running before paint removes the race
  // rather than leaving a one-in-many flake in the suite.
  React.useLayoutEffect(() => {
    setResolved(resolveCell(hook, JSON.parse(attrsKey), tokens.split(","), JSON.parse(modeKey)));
  }, [hook, tokens, attrsKey, modeKey]);

  return (
    <tr className="border-border-normal/50 border-b last:border-b-0">
      <th scope="row" className="whitespace-nowrap py-1.5 pr-4 font-mono font-normal text-fg-normal text-xs">
        {label}
      </th>
      {columns.map((column) => {
        const value = resolved?.[column.token];
        return (
          <td key={column.token} className="py-1.5 pr-4">
            {value ? <Swatch value={value} authored={declared[column.token]} /> : <span className="text-fg-subtle text-xs">…</span>}
          </td>
        );
      })}
    </tr>
  );
}

function Swatch({ value, authored }: { value: Resolved; authored: string | undefined }) {
  if (value.unset) {
    return (
      <span className="text-fg-subtle text-xs italic" title="No cell declares this token, so it inherits.">
        unset
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className="h-4 w-4 shrink-0 rounded border border-border-normal"
        style={{ backgroundColor: value.colour }}
        title={authored ? `${authored} on this cell` : "inherited from the floor"}
      />
      <span className="font-mono text-fg-subtle text-xs">{value.colour.replace(/^rgba?\(|\)$/g, "").replace(/, /g, " ")}</span>
    </span>
  );
}
