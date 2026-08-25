# design-system

Personal design system: design tokens, theme pipeline, and a React component library. Harvested from the Personal Assistant project; consumed as a versioned dependency (MUI-style), configured through the theme surface — never by editing component source in the consumer.

## Packages

| Package | What it is |
|---|---|
| [`@sixthshift/ui`](packages/ui/) | ~80 components (primitives, overlays, forms, pickers, charts, typography) + JSON-driven token/theme pipeline + Tailwind config. Includes a `./temporal` date/time module (wrapping the Temporal polyfill) used by all date/time components and exported at `@sixthshift/ui/temporal` |

## Consuming from a project

Not published to npm. Consume via git-tag dependency:

```jsonc
// package.json
{
  "dependencies": {
    "@sixthshift/ui": "git+ssh://git@github.com/sixthshift/design-system.git#v0.1.0"
  }
}
```

```tsx
// app entry — styles once
import "@sixthshift/ui/theme.css";   // CSS variables (light/dark via data-theme on <html>)
import "@sixthshift/ui/styles.css";  // compiled Tailwind + base styles

// anywhere — components via subpath exports (no barrel root)
import { Button } from "@sixthshift/ui/button";
```

**Current consumption constraint:** components ship as TypeScript source (only CSS is prebuilt), so consumers need TS/JSX-compatible tooling (Vite, Bun, Next, etc.). Shipping compiled JS is a planned foundations improvement.

## Theming

Tokens are JSON (`packages/ui/src/theme/{palette,theme,typography}.json`) compiled to CSS variables (`theme.css`). Light/dark switch via `data-theme` attribute on the root element. Consumers restyle by overriding CSS variables at runtime — component source stays untouched.

## Development

```bash
bun install          # postinstall builds theme + styles CSS
bun run storybook    # component workbench on :6006
bun run test         # unit tests
bun run type-check   # tsc project references
bun run check        # biome lint + format
```

## Versioning

Semver via git tags (`v0.1.0`, ...). Component props **and token names** are public API — renaming a token is a breaking change.

## Docs

Design-system knowledge lives in [`docs/`](docs/): [design tokens](docs/design-tokens.md), [component catalog](docs/component-catalog.md), [component authoring](docs/component-authoring.md), [component API design](docs/component-api-design.md), [composition](docs/composition.md), [visual hierarchy](docs/visual-hierarchy.md), [spacing](docs/spacing.md), [motion](docs/motion.md), [states](docs/states.md), [overlays](docs/overlay-primitives.md), [forms](docs/forms.md), [modals](docs/modals.md), [responsive](docs/responsive.md), [density](docs/density.md), [copy](docs/copy-conventions.md), [time formatting](docs/time-formatting.md), [UX principles](docs/ux-principles.md), [design philosophy](docs/design-philosophy.md).
