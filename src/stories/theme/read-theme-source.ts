/**
 * Parses the default theme's sources (palette, semantics, Tailwind config) at build\n * time, via Vite's `?raw` — the same files the `@import` manifest composes.
 *
 * The rest of this directory reads the CSSOM, which is the right source when
 * the question is "what does the browser compute". It is the wrong source for a
 * reference sheet: Tailwind only emits the `@theme` variables a build actually
 * uses, so `--z-index-app-bar` is absent from the CSSOM of any app that never
 * writes `z-app-bar`. A sheet built that way would document the workbench's
 * usage rather than the token file, and would quietly shrink when a story
 * stopped using something.
 *
 * So this reads the files. It is still not a hand-maintained copy — the
 * imports are the real theme sources, and deleting a token deletes its row.
 *
 * Story-only. `src/stories` is excluded from the published package.
 */

import paletteCss from "../../theme/default/palette.css?raw";
import semanticCss from "../../theme/default/theme.css?raw";
import tailwindCss from "../../theming/tailwind.css?raw";

const tokensCss = [paletteCss, semanticCss, tailwindCss].join("\n");

export type Declaration = { name: string; value: string };

const LIGHT = ':root:not([data-theme]), :root[data-theme="light"]';
const DARK = ':root[data-theme="dark"]';

/** The file with comments removed, so a commented-out token is never reported. */
const source = () => tokensCss.replace(/\/\*[\s\S]*?\*\//g, "");

/** Top-level `selector { … }` blocks, brace-matched so nested at-rules stay inside. */
function blocks(css: string): { selector: string; body: string }[] {
  const found: { selector: string; body: string }[] = [];
  let index = 0;

  while (index < css.length) {
    const open = css.indexOf("{", index);
    if (open === -1) break;

    let depth = 1;
    let close = open + 1;
    while (close < css.length && depth > 0) {
      if (css[close] === "{") depth += 1;
      if (css[close] === "}") depth -= 1;
      close += 1;
    }

    // Everything since the previous block can include statement at-rules —
    // `@import …;`, `@custom-variant …;` — so the selector is only the fragment
    // after the last semicolon. Without this the first block in the file is
    // named `@import "./recipes/index.css"; :root` and never matches.
    const preamble = css.slice(index, open);
    found.push({
      selector: (preamble.split(";").pop() as string).replace(/\s+/g, " ").trim(),
      body: css.slice(open + 1, close - 1),
    });
    index = close;
  }
  return found;
}

/** `--x: y;` pairs at the top level of a block body, in source order. */
function declarations(body: string): Declaration[] {
  const out: Declaration[] = [];
  let depth = 0;
  let buffer = "";

  for (const character of body) {
    if (character === "{") depth += 1;
    if (character === "}") depth -= 1;
    if (depth === 0 && character === ";") {
      const match = /^\s*(--[\w-]+)\s*:\s*([\s\S]+)$/.exec(buffer);
      if (match) out.push({ name: (match[1] as string).slice(2), value: (match[2] as string).replace(/\s+/g, " ").trim() });
      buffer = "";
      continue;
    }
    if (depth >= 0) buffer += character;
  }
  return out;
}

/** Every top-level block of a stylesheet, with its declarations parsed out. */
export function parseBlocks(css: string): { selector: string; declarations: Declaration[] }[] {
  return blocks(css.replace(/\/\*[\s\S]*?\*\//g, "")).map((block) => ({ selector: block.selector, declarations: declarations(block.body) }));
}

/** The selectors the token file uses for each mode, for anything emitting CSS. */
export const MODE_SELECTORS = { light: LIGHT, dark: DARK } as const;

const blockFor = (selector: string) => declarations(blocks(source()).find((block) => block.selector === selector)?.body ?? "");

/** The hand-written `:root` block: palette scales, font stacks, theme identity. */
export const rootDeclarations = () => blockFor(":root");

/** Semantic tokens for one mode, as authored. */
export const modeDeclarations = (mode: "light" | "dark") => blockFor(mode === "light" ? LIGHT : DARK);

/** The `@theme inline` block: the Tailwind bridge, layering, motion. */
export const themeDeclarations = () => blockFor("@theme inline").filter((declaration) => declaration.value !== "initial");

/**
 * Resolve a value to a literal, following one `var(--…)` hop into the palette.
 * Everything in the file is either a literal or a single reference, so one hop
 * is the whole chain — and if that ever stops being true the value is shown as
 * authored rather than guessed at.
 */
export function resolveValue(value: string, palette: Map<string, string>): string {
  const reference = /^var\(--([\w-]+)\)$/.exec(value)?.[1];
  return (reference && palette.get(reference)) || value;
}

/** Every literal declared in `:root`, for resolving one-hop references. */
export function paletteMap(): Map<string, string> {
  return new Map(rootDeclarations().map((declaration) => [declaration.name, declaration.value]));
}
