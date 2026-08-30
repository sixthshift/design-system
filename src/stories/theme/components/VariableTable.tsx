import { Text } from "@sixthshift/design-system/text";

/**
 * One section of the CSS variable reference: a table of names, what they are
 * declared as, and — for colours — what they resolve to.
 *
 * Deliberately dumb. Every row is handed in already read from the stylesheet by
 * the story, so this file has no opinion about what a variable *is*; it renders
 * whatever grouping the reference decides on. That keeps the grouping logic in
 * one place and lets a section carry one value column (palette, motion) or two
 * (semantic tokens, which differ per mode) without a second component.
 *
 * Story-only. `src/stories` is excluded from the published package.
 */

export type Row = {
  /** The variable name, without `--`. */
  name: string;
  /** Value columns, in the order the section's `columns` names them. */
  values: string[];
  /** Colour to swatch alongside each value, where the value is a colour. */
  swatches?: (string | undefined)[] | undefined;
  /** The Tailwind utility this variable produces, if any. */
  utility?: string | undefined;
};

function Swatch({ colour }: { colour: string }) {
  return <span aria-hidden className="inline-block size-3.5 shrink-0 rounded-sm border border-border-normal" style={{ backgroundColor: colour }} />;
}

export function VariableTable({ title, description, columns, rows }: { title: string; description?: string; columns: string[]; rows: Row[] }) {
  if (rows.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <h3 className="font-medium text-base text-fg-normal">{title}</h3>
        <span className="text-fg-subtle text-xs tabular-nums">{rows.length} variables</span>
      </div>
      {description && (
        <Text as="p" className="max-w-3xl text-fg-subtle text-sm">
          {description}
        </Text>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">{title}</caption>
          <thead>
            <tr className="border-border-normal border-b">
              <th className="py-1.5 pr-4 font-medium text-fg-subtle text-xs">Variable</th>
              {columns.map((column) => (
                <th key={column} className="py-1.5 pr-4 font-medium text-fg-subtle text-xs">
                  {column}
                </th>
              ))}
              {rows.some((row) => row.utility) && <th className="py-1.5 pr-4 font-medium text-fg-subtle text-xs">Utility</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-border-subtle border-b">
                <td className="whitespace-nowrap py-1.5 pr-4 font-mono text-xs">--{row.name}</td>
                {row.values.map((value, index) => (
                  <td key={columns[index]} className="py-1.5 pr-4">
                    <span className="flex items-center gap-1.5">
                      {row.swatches?.[index] && <Swatch colour={row.swatches[index] as string} />}
                      <code className="whitespace-nowrap font-mono text-[11px]">{value || "—"}</code>
                    </span>
                  </td>
                ))}
                {rows.some((candidate) => candidate.utility) && <td className="py-1.5 pr-4 font-mono text-[11px] text-fg-subtle">{row.utility ?? "—"}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
