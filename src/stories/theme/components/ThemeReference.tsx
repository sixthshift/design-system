import { Heading } from "@sixthshift/design-system/heading";
import { Text } from "@sixthshift/design-system/text";
import { useState } from "react";
import { type Declaration, modeDeclarations, paletteMap, resolveValue, rootDeclarations, themeDeclarations } from "../read-theme-source";
import { type Row, VariableTable } from "./VariableTable";

/**
 * The reference sheet itself: every variable the assembled theme declares, grouped by
 * what it is for, filterable by name.
 *
 * Lives here rather than in the story file because it is the page — the story
 * is one line of glue. The grouping predicates are the only judgement in it,
 * and theme-reference.visual.test.tsx asserts they partition the file
 * exhaustively, so a variable added under a prefix nothing matches fails the
 * suite instead of quietly going missing from the sheet.
 *
 * Story-only. `src/stories` is excluded from the published package.
 */

const isColour = (value: string) => /^#|^rgb|^hsl|^oklch/.test(value);

/** `bg-danger` -> `bg-bg-danger`; foreground tokens use Tailwind's `text-` prefix. */
function utilityFor(token: string): string | undefined {
  if (token.startsWith("bg-")) return `bg-${token}`;
  if (token.startsWith("fg-")) return `text-${token}`;
  if (token.startsWith("border-")) return `border-${token}`;
  return undefined;
}

const startsWith =
  (...prefixes: string[]) =>
  (declaration: Declaration) =>
    prefixes.some((prefix) => declaration.name.startsWith(prefix));

export function ThemeReference() {
  const [query, setQuery] = useState("");
  const palette = paletteMap();

  const root = rootDeclarations();
  const theme = themeDeclarations();
  const light = modeDeclarations("light");
  const dark = new Map(modeDeclarations("dark").map((declaration) => [declaration.name, declaration.value]));

  const keep = (name: string) => name.toLowerCase().includes(query.trim().toLowerCase());

  /** Semantic tokens: one row per name, resolved in both modes. */
  const semantic: Row[] = light
    .filter((declaration) => keep(declaration.name))
    .map((declaration) => {
      const lightValue = resolveValue(declaration.value, palette);
      const darkValue = resolveValue(dark.get(declaration.name) ?? "", palette);
      return {
        name: declaration.name,
        values: [lightValue, darkValue || "not declared in dark"],
        swatches: [isColour(lightValue) ? lightValue : undefined, isColour(darkValue) ? darkValue : undefined],
        utility: utilityFor(declaration.name),
      };
    });

  const rows = (declarations: Declaration[], { swatch = false } = {}): Row[] =>
    declarations
      .filter((declaration) => keep(declaration.name))
      .map((declaration) => {
        const resolved = resolveValue(declaration.value, palette);
        return {
          name: declaration.name,
          values: [declaration.value],
          ...(swatch && isColour(resolved) ? { swatches: [resolved] } : {}),
        };
      });

  const total = light.length + root.length + theme.length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Heading as="h2">Theme reference</Heading>
        <Text className="max-w-3xl text-fg-subtle">
          Every CSS variable <code className="font-mono text-xs">themes/linen.css</code> declares — {total} of them, parsed from the file. Component tokens are
          per-component and live on each component's Docs tab.
        </Text>
        <label className="flex max-w-sm flex-col gap-1">
          <span className="text-fg-subtle text-xs">Filter by name</span>
          <input
            type="search"
            value={query}
            aria-label="Filter by name"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="danger, z-index, brand-hovered…"
            className="rounded-md border border-border-normal bg-bg-normal px-3 py-1.5 text-fg-normal text-sm"
          />
        </label>
      </div>

      <VariableTable
        title="Semantic colour tokens"
        description="What a colour means. Two values per name — one per mode — and the only group that remaps between them. Shown resolved; each is authored as a palette reference."
        columns={["Light", "Dark"]}
        rows={semantic}
      />

      <VariableTable
        title="Palette"
        description="The scales the semantic values are tuned against. Identical in both modes, and never referenced by a component."
        columns={["Value"]}
        rows={rows(root.filter(startsWith("color-")), { swatch: true })}
      />

      <VariableTable
        title="Tailwind bridge"
        description="The @theme entries that make a utility compile for each semantic token. Nothing reads these directly — they exist so bg-bg-danger is a real class."
        columns={["Points at"]}
        rows={rows(theme.filter(startsWith("color-")))}
      />

      <VariableTable
        title="Layering"
        description="Named stacking order. Components never use a raw z-index."
        columns={["Value"]}
        rows={rows(theme.filter(startsWith("z-index-")))}
      />

      <VariableTable
        title="Motion"
        description="Enter/exit pairs, selected by data-state. Every one is pinned to 0.01ms under prefers-reduced-motion."
        columns={["Animation"]}
        rows={rows(theme.filter(startsWith("animate-")))}
      />

      <VariableTable
        title="Typography"
        description="Font stacks. Override these to swap faces without touching component source."
        columns={["Stack"]}
        rows={rows(root.filter(startsWith("font-")))}
      />

      <VariableTable
        title="Identity"
        description="Declared as variables rather than comments, so anything that wants them can read them at runtime."
        columns={["Value"]}
        rows={rows(root.filter(startsWith("theme-")))}
      />
    </div>
  );
}
