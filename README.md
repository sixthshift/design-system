# design-system

Personal design system: design tokens, theme pipeline, and a React component library. Harvested from the Personal Assistant project; consumed as a versioned dependency (MUI-style), configured through the theme surface — never by editing component source in the consumer.

A single package, `@sixthshift/design-system`: ~80 components (primitives, overlays, forms, pickers, charts, typography) + a JSON-driven token/theme pipeline + Tailwind config. Built on [shadcn/ui](https://ui.shadcn.com) patterns.

## Orientation

**Owns:** The component library — 80+ exports via subpath imports, design tokens, theme system (JSON-driven CSS generation), Tailwind config, and Storybook stories. Components span primitives, composites, typography, charts, and overlays.

**Boundaries:** Bundles a `./temporal` date/time module (`@sixthshift/design-system/temporal`, wrapping `@js-temporal/polyfill`) used by the date/time components, Floating UI (popover/tooltip positioning), and CVA (variant styling). Peer-depends on React 18. No app/domain coupling — domain-specific components live in consuming apps.

**Surprise:** All components are imported via subpath exports (`@sixthshift/design-system/button`), never from a barrel root — there is no main export. Positioning uses Floating UI, not Radix. Variants use the `variant` (visual) + `intent` (semantic) orthogonal prop pattern via CVA, not className-based styling. Compound components (e.g. Tabs) use `Object.assign` to attach sub-components. Check `src/components/` before creating any new UI element.

## Consuming from a project

Not published to npm. Consume via git-tag dependency:

```jsonc
// package.json
{
  "dependencies": {
    "@sixthshift/design-system": "git+ssh://git@github.com/sixthshift/design-system.git#v0.1.0"
  }
}
```

```tsx
// app entry — styles once
import "@sixthshift/design-system/theme.css";   // CSS variables (light/dark via data-theme on <html>)
import "@sixthshift/design-system/styles.css";  // compiled Tailwind + base styles

// anywhere — components via subpath exports (no barrel root)
import { Button } from "@sixthshift/design-system/button";
```

**Current consumption constraint:** components ship as TypeScript source (only CSS is prebuilt), so consumers need TS/JSX-compatible tooling (Vite, Bun, Next, etc.). Shipping compiled JS is a planned foundations improvement.

## Available exports

```tsx
// Primitives (Button, Badge, Card, Input, Textarea, Checkbox, Switch, Avatar, ...)
import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";

// Composites (FormField, NavSide, Tabs, Pagination, ...)
import { FormField } from "@sixthshift/design-system/form-field";

// Charts (LineChart, BarChart, Sparkline, HeatMap)
import { LineChart } from "@sixthshift/design-system/line-chart";

// Pickers (Calendar, DatePicker, TimePicker, DateTimePicker, DateTimeRangePicker)
import { DatePicker } from "@sixthshift/design-system/date-picker";

// Overlays (Modal, Sheet, Toast, Tooltip, Popover, HoverCard)
import { Modal } from "@sixthshift/design-system/modal";

// Typography (Heading, SectionTitle, Caption, Code, Lead, ...)
import { Heading } from "@sixthshift/design-system/heading";

// Utilities
import { cn } from "@sixthshift/design-system/utils";
import { useTheme, useLocalStorage } from "@sixthshift/design-system/hooks";
```

The full list is the `exports` map in [`package.json`](package.json); the catalog is [`docs/component-catalog.md`](docs/component-catalog.md).

## Component API

Components use two orthogonal props:

- **`variant`** — visual treatment (how it looks): `solid`, `outline`, `ghost`, `link`
- **`intent`** — semantic meaning (what it means): `neutral`, `danger`, `success`, `warning`

```tsx
<Button variant="solid" intent="danger">Delete</Button>
<Button variant="outline" intent="success">Approve</Button>
<Badge variant="soft" intent="warning">Pending</Badge>
```

## Theming

Tokens are JSON (`src/theme/{palette,theme,typography}.json`) compiled to CSS variables (`theme.css`). Light/dark switch via `data-theme` attribute on the root element. Consumers restyle by overriding CSS variables at runtime — component source stays untouched. See [docs/design-tokens.md](docs/design-tokens.md) for the full token reference.

### Tailwind integration

If your app uses Tailwind and you want to extend the theme:

```ts
// tailwind.config.ts
import uiConfig from "@sixthshift/design-system/tailwind.config";

export default {
  presets: [uiConfig],
  content: ["./src/**/*.{ts,tsx}", "./node_modules/@sixthshift/design-system/src/**/*.{ts,tsx}"],
};
```

## Development

```bash
bun install          # postinstall builds theme + styles CSS
bun run storybook    # component workbench on :6006
bun run dev          # watch-rebuild theme + Tailwind CSS
bun run test         # unit + temporal tests
bun run type-check   # tsc --noEmit (src and tests)
bun run check        # biome lint + format
```

## Structure

```
src/
├── components/   # One directory per component (Button/, Modal/, DatePicker/, ...)
├── typography/   # Typography presets (Heading, Caption, etc.)
├── hooks/        # React hooks (useTheme, useLocalStorage, useControllableState, ...)
├── internal/     # Internal-only primitives (Slot)
├── temporal/     # Date/time utilities wrapping @js-temporal/polyfill
├── theme/        # Token JSONs + schemas + generator types
├── styles/       # Tailwind entry (base.css)
├── stories/      # Design-system doc stories (palette, theme)
└── lib/          # Utilities (cn, format, boundaries, overlay/components contexts)
```

## Versioning

Semver via git tags (`v0.1.0`, ...). Component props **and token names** are public API — renaming a token is a breaking change.

## Docs

Design-system knowledge lives in [`docs/`](docs/): [design tokens](docs/design-tokens.md), [component catalog](docs/component-catalog.md), [component authoring](docs/component-authoring.md), [component API design](docs/component-api-design.md), [composition](docs/composition.md), [visual hierarchy](docs/visual-hierarchy.md), [spacing](docs/spacing.md), [motion](docs/motion.md), [states](docs/states.md), [overlays](docs/overlay-primitives.md), [forms](docs/forms.md), [modals](docs/modals.md), [responsive](docs/responsive.md), [density](docs/density.md), [copy](docs/copy-conventions.md), [time formatting](docs/time-formatting.md), [UX principles](docs/ux-principles.md), [design philosophy](docs/design-philosophy.md).
