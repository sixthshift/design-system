import { Heading } from "@sixthshift/design-system/heading";
import { readTokens } from "../../theme/read-tokens";
import { modeVarsFrom, readRecipes } from "../read-recipes";
import { CellRow, type Column } from "./CellRow";

/** Describe a row by its attribute values — `solid · neutral` beats a selector. */
const describe = (attrs: Record<string, string>) =>
  Object.entries(attrs)
    .map(([, value]) => value)
    .join(" · ");

/**
 * Every recipe named in `hooks`, for one mode.
 *
 * The subtree is pinned to the mode's token values so light and dark can sit on
 * one page — `data-theme` is matched on `:root` and does nothing on a nested
 * element. It has to restate `color` as well: overriding `--fg-normal` alone
 * leaves text inheriting whatever colour the ambient theme already computed,
 * which is white-on-white when the two disagree. The a11y suite caught that.
 */
export function RecipeTables({ mode, hooks }: { mode: "light" | "dark"; hooks: readonly string[] }) {
  const modeVars = modeVarsFrom(readTokens(mode));
  const recipes = readRecipes().filter((recipe) => hooks.includes(recipe.hook));

  return (
    <div style={modeVars as React.CSSProperties} className="flex flex-col gap-8 rounded-lg bg-bg-normal p-4 text-fg-normal">
      {recipes.map((recipe) => {
        const columns: Column[] = recipe.tokens.map((token) => ({ token, label: token.replace(`--${recipe.hook}-`, "").replace("--", "") }));
        const rows = [
          ...(recipe.floor ? [{ key: "floor", label: "floor", attrs: {}, declared: recipe.floor.declared }] : []),
          ...recipe.cells.map((cell) => ({ key: cell.selector, label: describe(cell.attrs), attrs: cell.attrs, declared: cell.declared })),
        ];

        return (
          <section key={recipe.hook} className="flex flex-col gap-2">
            <Heading as="h3">
              <code className="font-mono">.{recipe.hook}</code>
            </Heading>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">
                  Component tokens for .{recipe.hook} in {mode} mode
                </caption>
                <thead>
                  <tr className="border-border-normal border-b">
                    <th scope="col" className="py-1 pr-4 font-medium text-fg-subtle">
                      cell
                    </th>
                    {columns.map((column) => (
                      <th key={column.token} scope="col" className="py-1 pr-4 font-mono font-normal text-fg-subtle text-xs">
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <CellRow
                      key={row.key}
                      hook={recipe.hook}
                      label={row.label}
                      attrs={row.attrs}
                      declared={row.declared}
                      columns={columns}
                      modeVars={modeVars}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
