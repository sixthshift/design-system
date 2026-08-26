import type { editor } from "monaco-editor";

export const PA_THEME_LIGHT = "pa-light";
export const PA_THEME_DARK = "pa-dark";

const lightTheme: editor.IStandaloneThemeData = {
  base: "vs",
  inherit: true,
  rules: [
    // Monarch tokenizer rules
    { token: "comment", foreground: "a0a1a7", fontStyle: "italic" },
    { token: "keyword", foreground: "a626a4" },
    { token: "string", foreground: "50a14f" },
    { token: "number", foreground: "986801" },
    { token: "delimiter", foreground: "383a42" },
    { token: "delimiter.bracket", foreground: "383a42" },
    { token: "tag", foreground: "e45649" },
    { token: "attribute.name", foreground: "986801" },
    { token: "attribute.value", foreground: "50a14f" },
    { token: "operator", foreground: "0184bc" },
    { token: "identifier", foreground: "e45649" },

    // Semantic token rules (TypeScript language service)
    { token: "variable", foreground: "e45649" },
    { token: "variable.readonly", foreground: "986801" },
    { token: "parameter", foreground: "383a42" },
    { token: "property", foreground: "e45649" },
    { token: "property.readonly", foreground: "986801" },
    { token: "function", foreground: "4078f2" },
    { token: "method", foreground: "4078f2" },
    { token: "type", foreground: "c18401" },
    { token: "type.identifier", foreground: "c18401" },
    { token: "class", foreground: "c18401" },
    { token: "interface", foreground: "c18401" },
    { token: "enum", foreground: "c18401" },
    { token: "enumMember", foreground: "986801" },
    { token: "namespace", foreground: "e45649" },
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
    { token: "comment", foreground: "5c6370", fontStyle: "italic" },
    { token: "keyword", foreground: "c678dd" },
    { token: "string", foreground: "98c379" },
    { token: "number", foreground: "d19a66" },
    { token: "delimiter", foreground: "abb2bf" },
    { token: "delimiter.bracket", foreground: "abb2bf" },
    { token: "tag", foreground: "e06c75" },
    { token: "attribute.name", foreground: "d19a66" },
    { token: "attribute.value", foreground: "98c379" },
    { token: "operator", foreground: "56b6c2" },
    { token: "identifier", foreground: "e06c75" },

    // Semantic token rules (TypeScript language service)
    { token: "variable", foreground: "e06c75" },
    { token: "variable.readonly", foreground: "d19a66" },
    { token: "parameter", foreground: "abb2bf" },
    { token: "property", foreground: "e06c75" },
    { token: "property.readonly", foreground: "d19a66" },
    { token: "function", foreground: "61afef" },
    { token: "method", foreground: "61afef" },
    { token: "type", foreground: "e5c07b" },
    { token: "type.identifier", foreground: "e5c07b" },
    { token: "class", foreground: "e5c07b" },
    { token: "interface", foreground: "e5c07b" },
    { token: "enum", foreground: "e5c07b" },
    { token: "enumMember", foreground: "d19a66" },
    { token: "namespace", foreground: "e06c75" },
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
  monaco.editor.defineTheme(PA_THEME_LIGHT, lightTheme);
  monaco.editor.defineTheme(PA_THEME_DARK, darkTheme);
}
