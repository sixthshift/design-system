import { readResolvedTokens, readTokens } from "../../theme/read-tokens";

/**
 * One intent family, complete: every token it declares, the Tailwind utility
 * that compiles from it, and what it resolves to in each mode.
 *
 * The grid above answers "does this exist"; this answers "what do I type". They
 * are different questions, and a reader onboarding onto the system needs the
 * second one answered in full at least once — the weights, the `fg`/`fg-on`
 * split and the state suffixes only make sense seen together on a single
 * family rather than inferred from a grammar.
 *
 * `danger` is the family to show: it is the only one that carries every axis the
 * grammar allows. Read from the stylesheet at render time.
 *
 * Story-only. `src/stories` is excluded from the published package.
 */

const STATES = ["hovered", "pressed", "disabled"] as const;

/** The utility prefix each context compiles into — `bg-*`, `text-*`, `border-*`. */
const UTILITY = { bg: "bg", fg: "text", border: "border" } as const;

type Row = { token: string; utility: string; states: string[] };

function rowsFor(family: string, declared: string[]): Row[] {
  const base = declared.filter((token) => {
    const match = new RegExp(`^(bg|fg-on|fg|border)-${family}(-(subtle|strong))?$`).exec(token);
    return Boolean(match);
  });

  return base.map((token) => {
    const context = (/^(bg|fg|border)/.exec(token)?.[1] ?? "bg") as keyof typeof UTILITY;
    return {
      token,
      utility: `${UTILITY[context]}-${token}`,
      states: STATES.filter((state) => declared.includes(`${token}-${state}`)),
    };
  });
}

function Swatch({ colour }: { colour: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span aria-hidden className="inline-block size-3 rounded-sm border border-border-normal" style={{ backgroundColor: colour }} />
      <code className="font-mono text-[11px]">{colour}</code>
    </span>
  );
}

export function FamilyAnatomy({ family = "danger" }: { family?: string }) {
  const declared = Object.keys(readTokens("light"));
  const light = readResolvedTokens("light");
  const dark = readResolvedTokens("dark");
  const rows = rowsFor(family, declared);

  return (
    <div className="sb-unstyled flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Every token the {family} family declares</caption>
          <thead>
            <tr className="border-border-normal border-b">
              <th className="py-2 pr-4 font-medium text-fg-subtle">Token</th>
              <th className="py-2 pr-4 font-medium text-fg-subtle">Utility</th>
              <th className="py-2 pr-4 font-medium text-fg-subtle">Light</th>
              <th className="py-2 pr-4 font-medium text-fg-subtle">Dark</th>
              <th className="py-2 pr-4 font-medium text-fg-subtle">Also declares</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ token, utility, states }) => (
              <tr key={token} className="border-border-subtle border-b align-top">
                <td className="whitespace-nowrap py-2 pr-4 font-mono text-xs">--{token}</td>
                <td className="whitespace-nowrap py-2 pr-4 font-mono text-xs">{utility}</td>
                <td className="py-2 pr-4">
                  <Swatch colour={light[token] ?? "transparent"} />
                </td>
                <td className="py-2 pr-4">
                  <Swatch colour={dark[token] ?? "transparent"} />
                </td>
                <td className="py-2 pr-4 font-mono text-[11px] text-fg-subtle">{states.length > 0 ? states.map((state) => `-${state}`).join(" ") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-fg-subtle text-xs">
        {rows.length} base tokens for <code className="font-mono">{family}</code>, plus the state suffixes in the last column — {declared.length} semantic
        tokens across all families. Every other feedback family has the same shape.
      </p>
    </div>
  );
}
