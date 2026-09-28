import { Text } from "@sixthshift/design-system/text";
import { useState } from "react";
import { type Declaration, MODE_SELECTORS, modeDeclarations, paletteMap, resolveValue, rootDeclarations } from "../read-theme-source";

/**
 * A copy-paste starting point: the shipped theme, emitted as the CSS a consumer
 * would write to override it.
 *
 * The gap this closes is the first hour of adopting the system. Everything else
 * documents tokens one at a time; nobody re-skinning an app wants to assemble
 * 178 declarations by hand from a table, and the only complete example of the
 * shape — two mode blocks, same names in both — was the theme source itself, inside
 * the package. So: generate it, with the real names and the current values, and
 * let them delete what they do not want to change.
 *
 * Values are emitted as literals rather than `var(--color-…)` references. The
 * palette is the system's own coordination device, not a surface a consumer
 * should be pinned to; a hex is a value they own from the moment they paste it.
 *
 * Story-only. `src/stories` is excluded from the published package.
 */

/**
 * Families a re-skin is usually scoped to. `all` is the whole theme. `colour`
 * selects mode tokens; `radius` adds the mode-free corner scale.
 */
const SCOPES = [
  { value: "brand", label: "Brand only", colour: (name: string) => /-brand(-|$)/.test(name), radius: false },
  { value: "feedback", label: "Success, warning, danger", colour: (name: string) => /-(success|warning|danger)(-|$)/.test(name), radius: false },
  {
    value: "neutral",
    label: "The greys",
    colour: (name: string) => /-(strong|normal|subtle)(-|$)/.test(name) && !/-(brand|success|warning|danger)-/.test(name),
    radius: false,
  },
  { value: "radius", label: "Corners", colour: () => false, radius: true },
  { value: "all", label: "Everything", colour: () => true, radius: true },
] as const;

/** `bg-brand-hovered` -> `Background`. The comment headers inside each block. */
function groupOf(name: string): string {
  if (name.startsWith("bg-")) return "Background";
  if (name.startsWith("fg-")) return "Foreground";
  if (name.startsWith("border-")) return "Border";
  return "Interaction";
}

function block(selector: string, declarations: Declaration[], palette: Map<string, string>): string {
  const lines: string[] = [];
  let group = "";

  for (const declaration of declarations) {
    const next = groupOf(declaration.name);
    if (next !== group) {
      lines.push(`${group ? "\n" : ""}  /* ${next} */`);
      group = next;
    }
    lines.push(`  --${declaration.name}: ${resolveValue(declaration.value, palette)};`);
  }

  return `${selector} {\n${lines.join("\n")}\n}`;
}

/** The corner scale: one mode-free block, since a corner is the same shape in light and dark. */
function radiusBlock(declarations: Declaration[]): string {
  const lines = declarations.map((declaration) => `  --${declaration.name}: ${declaration.value};`);
  return `/* Corners — md is the middle and the default. A theme must define all five. */\n:root {\n${lines.join("\n")}\n}`;
}

const HEADER = `/* Your theme. Paste after the design-system import, and leave it unlayered —
   the library's own tokens are unlayered, so a rule inside @layer would lose.

   Every value below is the shipped default. Change what you want, delete the
   rest: anything you do not declare keeps the library's value. Both blocks
   matter — a token declared in only one mode is undefined in the other. */`;

export function ThemeTemplate() {
  const [scope, setScope] = useState<string>("brand");
  const [copied, setCopied] = useState(false);

  const palette = paletteMap();
  const selected = SCOPES.find((candidate) => candidate.value === scope) ?? SCOPES[4];
  const keep = (declarations: Declaration[]) => declarations.filter((declaration) => selected.colour(declaration.name));

  const light = keep(modeDeclarations("light"));
  const dark = keep(modeDeclarations("dark"));
  const radius = selected.radius ? rootDeclarations().filter((declaration) => declaration.name.startsWith("border-radius-")) : [];

  const css = [
    HEADER,
    ...(light.length > 0 ? [block(MODE_SELECTORS.light, light, palette), block(MODE_SELECTORS.dark, dark, palette)] : []),
    ...(radius.length > 0 ? [radiusBlock(radius)] : []),
  ].join("\n\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(css);
      setCopied(true);
    } catch {
      // Clipboard access can be denied outright; the CSS is selectable anyway.
      setCopied(false);
    }
  };

  return (
    <div className="sb-unstyled flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-fg-subtle text-xs">What are you re-skinning?</span>
          <select
            value={scope}
            onChange={(event) => {
              setScope(event.target.value);
              setCopied(false);
            }}
            className="rounded-md border border-border-normal bg-bg-normal px-3 py-1.5 text-fg-normal text-sm"
          >
            {SCOPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={copy}
          className="rounded-md border border-border-normal bg-bg-normal px-3 py-1.5 text-fg-normal text-sm hover:bg-bg-subtle"
        >
          {copied ? "Copied" : "Copy CSS"}
        </button>
        <Text as="span" className="text-fg-subtle text-xs">
          {[light.length > 0 && `${light.length} tokens per mode`, radius.length > 0 && `${radius.length} radius steps`].filter(Boolean).join(" · ")}
        </Text>
      </div>
      <pre className="max-h-[32rem] overflow-auto rounded-lg border border-border-normal bg-bg-subtle p-4 font-mono text-[11px] text-fg-normal leading-relaxed">
        <code>{css}</code>
      </pre>
    </div>
  );
}
