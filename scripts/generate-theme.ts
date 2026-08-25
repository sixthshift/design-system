/**
 * Theme Generator
 *
 * Reads theme.json, palette.json, and typography.json and generates CSS variables.
 *
 * Usage:
 *   bun run scripts/generate-theme.ts -i src/theme/theme.json -p src/theme/palette.json -t src/theme/typography.json -o dist/theme.generated.css
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { program } from "commander";
import type { ThemeSchema } from "../src/theme/schema";

type Palette = Record<string, Record<string, string> | string>;
type Typography = { $schema?: string; fonts: Record<string, string> };

// =============================================================================
// CLI
// =============================================================================

program
  .name("generate-theme")
  .description("Generate CSS variables from theme.json, palette.json, and typography.json")
  .requiredOption("-i, --input <path>", "Input theme.json file")
  .requiredOption("-p, --palette <path>", "Input palette.json file")
  .requiredOption("-t, --typography <path>", "Input typography.json file")
  .requiredOption("-o, --output <path>", "Output CSS file")
  .parse();

const options = program.opts<{
  input: string;
  palette: string;
  typography: string;
  output: string;
}>();

const THEME_INPUT = resolve(options.input);
const PALETTE_INPUT = resolve(options.palette);
const TYPOGRAPHY_INPUT = resolve(options.typography);
const CSS_OUTPUT = resolve(options.output);

// =============================================================================
// GENERATOR
// =============================================================================

function loadTheme(path: string): ThemeSchema {
  const content = readFileSync(path, "utf-8");
  return JSON.parse(content) as ThemeSchema;
}

function loadPalette(path: string): Palette {
  const content = readFileSync(path, "utf-8");
  return JSON.parse(content) as Palette;
}

function loadTypography(path: string): Typography {
  const content = readFileSync(path, "utf-8");
  return JSON.parse(content) as Typography;
}

function generatePaletteCSS(palette: Palette, typography: Typography): string[] {
  const lines: string[] = [];
  lines.push(":root {");
  lines.push("  /* Color Palette */");

  for (const [scale, colors] of Object.entries(palette)) {
    if (scale === "$schema" || typeof colors === "string") continue;
    for (const [step, hex] of Object.entries(colors)) {
      lines.push(`  --color-${scale}-${step}: ${hex};`);
    }
  }

  lines.push("");
  lines.push("  /* Typography */");
  for (const [name, value] of Object.entries(typography.fonts)) {
    lines.push(`  --font-${name}: ${value};`);
  }

  lines.push("}");
  return lines;
}

function generateCSSForMode(colors: ThemeSchema["light"]): string[] {
  const lines: string[] = [];
  const entries = Object.entries(colors);

  // Group by prefix for readability
  const bgEntries = entries.filter(([key]) => key.startsWith("bg-"));
  const fgEntries = entries.filter(([key]) => key.startsWith("fg-"));
  const borderEntries = entries.filter(([key]) => key.startsWith("border-"));

  lines.push("  /* Background */");
  for (const [key, value] of bgEntries) {
    lines.push(`  --${key}: ${value};`);
  }
  lines.push("");
  lines.push("  /* Foreground */");
  for (const [key, value] of fgEntries) {
    lines.push(`  --${key}: ${value};`);
  }
  lines.push("");
  lines.push("  /* Border */");
  for (const [key, value] of borderEntries) {
    lines.push(`  --${key}: ${value};`);
  }

  return lines;
}

function generateCSS(theme: ThemeSchema, palette: Palette, typography: Typography): string {
  const lines: string[] = [];

  // Header
  lines.push("/**");
  lines.push(` * ${theme.name} Theme`);
  lines.push(` * Version: ${theme.version}`);
  lines.push(" *");
  lines.push(" * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY");
  lines.push(" * Edit src/theme/theme.json, src/theme/palette.json, or src/theme/typography.json and run: bun run build:theme");
  lines.push(" */");
  lines.push("");

  // Palette colors and typography (always available)
  lines.push(...generatePaletteCSS(palette, typography));
  lines.push("");

  // Light mode (default + explicit)
  lines.push(':root:not([data-theme]), :root[data-theme="light"] {');
  lines.push(...generateCSSForMode(theme.light));
  lines.push("}");
  lines.push("");

  // Dark mode
  lines.push(':root[data-theme="dark"] {');
  lines.push(...generateCSSForMode(theme.dark));
  lines.push("}");
  lines.push("");

  return lines.join("\n");
}

function validateColorMode(mode: "light" | "dark", colors: ThemeSchema["light"]): string[] {
  const errors: string[] = [];

  const requiredTokens = [
    // Background
    "bg-strong",
    "bg-normal",
    "bg-subtle",
    "bg-success",
    "bg-warning",
    "bg-danger",
    // Foreground
    "fg-strong",
    "fg-on-strong",
    "fg-normal",
    "fg-subtle",
    "fg-success",
    "fg-on-success",
    "fg-warning",
    "fg-on-warning",
    "fg-danger",
    "fg-on-danger",
    // Border
    "border-strong",
    "border-normal",
    "border-subtle",
    "border-success",
    "border-warning",
    "border-danger",
  ];

  for (const token of requiredTokens) {
    if (!(token in colors)) {
      errors.push(`Missing ${mode}.${token}`);
    }
  }

  return errors;
}

function validateTheme(theme: ThemeSchema): string[] {
  return [...validateColorMode("light", theme.light), ...validateColorMode("dark", theme.dark)];
}

// =============================================================================
// MAIN
// =============================================================================

function main() {
  console.log("Loading theme from:", THEME_INPUT);
  console.log("Loading palette from:", PALETTE_INPUT);
  console.log("Loading typography from:", TYPOGRAPHY_INPUT);

  const theme = loadTheme(THEME_INPUT);
  const palette = loadPalette(PALETTE_INPUT);
  const typography = loadTypography(TYPOGRAPHY_INPUT);
  console.log(`Theme: ${theme.name} v${theme.version}`);

  // Validate
  const errors = validateTheme(theme);
  if (errors.length > 0) {
    console.error("Validation errors:");
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }
  console.log("Validation passed");

  // Ensure dist directory exists
  const distDir = dirname(CSS_OUTPUT);
  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
  }

  // Generate
  const css = generateCSS(theme, palette, typography);
  writeFileSync(CSS_OUTPUT, css);
  console.log("Generated:", CSS_OUTPUT);

  // Stats
  const themeTokenCount = Object.keys(theme.light).length;
  const paletteColorCount = Object.entries(palette)
    .filter(([key, value]) => key !== "$schema" && typeof value !== "string")
    .reduce((acc, [, scale]) => acc + Object.keys(scale as Record<string, string>).length, 0);
  const typographyCount = Object.keys(typography.fonts).length;
  console.log(`Theme tokens: ${themeTokenCount} (x2 for light/dark = ${themeTokenCount * 2} CSS vars)`);
  console.log(`Palette colors: ${paletteColorCount} CSS vars`);
  console.log(`Typography: ${typographyCount} CSS vars`);
}

main();
