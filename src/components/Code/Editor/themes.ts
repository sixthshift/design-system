import type { editor } from "monaco-editor";

export const EDITOR_THEME_LIGHT = "ds-light";
export const EDITOR_THEME_DARK = "ds-dark";

/**
 * The token palettes are One Light and One Dark, with every colour raised to
 * 4.5:1 against the worst background it can land on — which is the active line's
 * highlight, not the editor background, since that is the darker (light theme)
 * or lighter (dark theme) of the two.
 *
 * Stock One Light fails that on 21 of its 25 token colours: syntax highlighting
 * is text as far as axe is concerned, so it carries the full 4.5:1 obligation
 * rather than the 3:1 that non-text contrast gets. Hue and saturation are kept;
 * only lightness moves, and only as far as it has to. The most visible
 * consequence is that comments recede less than in stock One Light — #a0a1a7
 * managed 2.30.
 *
 * `scripts/check-contrast.ts` covers the design system's own tokens; these are
 * Monaco's, so they are checked by the editor stories' a11y run instead. A story
 * with a play function is what exercises it: without one, axe runs before Monaco
 * has painted and sees nothing to measure.
 */
const lightTheme: editor.IStandaloneThemeData = {
  base: "vs",
  inherit: true,
  rules: [
    // Monarch tokenizer rules
    { token: "comment", foreground: "6b6c73", fontStyle: "italic" },
    { token: "keyword", foreground: "a626a4" },
    { token: "string", foreground: "3c7a3c" },
    { token: "number", foreground: "906301" },
    { token: "delimiter", foreground: "383a42" },
    { token: "delimiter.bracket", foreground: "383a42" },
    { token: "tag", foreground: "cf2d1f" },
    { token: "attribute.name", foreground: "906301" },
    { token: "attribute.value", foreground: "3c7a3c" },
    { token: "operator", foreground: "0174a5" },
    { token: "identifier", foreground: "cf2d1f" },

    // Semantic token rules (TypeScript language service)
    { token: "variable", foreground: "cf2d1f" },
    { token: "variable.readonly", foreground: "906301" },
    { token: "parameter", foreground: "383a42" },
    { token: "property", foreground: "cf2d1f" },
    { token: "property.readonly", foreground: "906301" },
    { token: "function", foreground: "2162f0" },
    { token: "method", foreground: "2162f0" },
    { token: "type", foreground: "916301" },
    { token: "type.identifier", foreground: "916301" },
    { token: "class", foreground: "916301" },
    { token: "interface", foreground: "916301" },
    { token: "enum", foreground: "916301" },
    { token: "enumMember", foreground: "906301" },
    { token: "namespace", foreground: "cf2d1f" },
  ],
  colors: {
    "editor.background": "#fafafa",
    "editor.foreground": "#383a42",
    "editor.lineHighlightBackground": "#f2f2f2",
    // Gutter numbers are text as far as axe is concerned, so they carry the
    // full 4.5:1 obligation rather than the 3:1 one non-text contrast gets.
    // #9d9d9f managed 2.59 against this background and failed the story test.
    "editorLineNumber.foreground": "#6f6f71",
    "editorLineNumber.activeForeground": "#383a42",
    "editor.selectionBackground": "#e5e5e6",
    "editor.inactiveSelectionBackground": "#e5e5e680",
    "editorCursor.foreground": "#526fff",
    "editorIndentGuide.background": "#e8e8e8",
    "editorIndentGuide.activeBackground": "#cacacc",
    "editorBracketMatch.background": "#e5e5e6",
    "editorBracketMatch.border": "#a0a1a7",
  },
};

const darkTheme: editor.IStandaloneThemeData = {
  base: "vs-dark",
  inherit: true,
  rules: [
    // Monarch tokenizer rules
    { token: "comment", foreground: "939aa6", fontStyle: "italic" },
    { token: "keyword", foreground: "c97edf" },
    { token: "string", foreground: "98c379" },
    { token: "number", foreground: "d19a66" },
    { token: "delimiter", foreground: "abb2bf" },
    { token: "delimiter.bracket", foreground: "abb2bf" },
    { token: "tag", foreground: "e37b83" },
    { token: "attribute.name", foreground: "d19a66" },
    { token: "attribute.value", foreground: "98c379" },
    { token: "operator", foreground: "56b6c2" },
    { token: "identifier", foreground: "e37b83" },

    // Semantic token rules (TypeScript language service)
    { token: "variable", foreground: "e37b83" },
    { token: "variable.readonly", foreground: "d19a66" },
    { token: "parameter", foreground: "abb2bf" },
    { token: "property", foreground: "e37b83" },
    { token: "property.readonly", foreground: "d19a66" },
    { token: "function", foreground: "61afef" },
    { token: "method", foreground: "61afef" },
    { token: "type", foreground: "e5c07b" },
    { token: "type.identifier", foreground: "e5c07b" },
    { token: "class", foreground: "e5c07b" },
    { token: "interface", foreground: "e5c07b" },
    { token: "enum", foreground: "e5c07b" },
    { token: "enumMember", foreground: "d19a66" },
    { token: "namespace", foreground: "e37b83" },
  ],
  colors: {
    "editor.background": "#282c34",
    "editor.foreground": "#abb2bf",
    "editor.lineHighlightBackground": "#2c313a",
    // 4.77:1, up from #495162's 1.76. Same obligation as the light theme;
    // this one was never caught only because no story exercises it.
    "editorLineNumber.foreground": "#8f97a8",
    "editorLineNumber.activeForeground": "#abb2bf",
    "editor.selectionBackground": "#3e4451",
    "editor.inactiveSelectionBackground": "#3e445180",
    "editorCursor.foreground": "#528bff",
    "editorIndentGuide.background": "#3b4048",
    "editorIndentGuide.activeBackground": "#4b5263",
    "editorBracketMatch.background": "#3e4451",
    "editorBracketMatch.border": "#5c6370",
  },
};

export function defineThemes(monaco: typeof import("monaco-editor")) {
  monaco.editor.defineTheme(EDITOR_THEME_LIGHT, lightTheme);
  monaco.editor.defineTheme(EDITOR_THEME_DARK, darkTheme);
}
