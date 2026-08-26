# design-system

Personal design system: design tokens, theme pipeline, and a React component library. Harvested from the Personal Assistant project; consumed as a versioned dependency (MUI-style), configured through the theme surface — never by editing component source in the consumer.

A single package, `@sixthshift/design-system`: ~80 components (primitives, overlays, forms, pickers, charts, typography) + a JSON-driven token/theme pipeline + Tailwind config. Built on [shadcn/ui](https://ui.shadcn.com) patterns.

## Orientation

**Owns:** The component library — 80+ exports via subpath imports, design tokens, theme system (JSON-driven CSS generation), Tailwind config, and Storybook stories. Components span primitives, composites, typography, charts, and overlays.

**Boundaries:** Bundles a `./date-time` module (`@sixthshift/design-system/date-time`, wrapping `@js-temporal/polyfill`) used internally by the date/time components — those components exchange ISO 8601 strings, so consuming one does not require adopting Temporal. Also Floating UI (popover/tooltip positioning) and CVA (variant styling). Peer-depends on React 18 or 19. No app/domain coupling — domain-specific components live in consuming apps.

**Surprise:** All components are imported via subpath exports (`@sixthshift/design-system/button`), never from a barrel root — there is no main export. Positioning uses Floating UI, not Radix. Variants use the `variant` (visual) + `intent` (semantic) orthogonal prop pattern via CVA, not className-based styling. Compound components (e.g. Tabs) use `Object.assign` to attach sub-components. Check `src/components/` before creating any new UI element.

## Consuming from a project

```bash
npm install @sixthshift/design-system
```

```tsx
// app entry — styles once
import "@sixthshift/design-system/theme.css";   // CSS variables (light/dark via data-theme on <html>)
import "@sixthshift/design-system/styles.css";  // compiled Tailwind + base styles

// anywhere — components via subpath exports (no barrel root)
import { Button } from "@sixthshift/design-system/button";
```

**What ships:** compiled ESM (`.js`) plus type declarations (`.d.ts`) in `dist/`, alongside the prebuilt CSS — every export subpath resolves to build output, so no build runs on install and no consumer toolchain needs to transpile this package. The module tree is preserved rather than bundled, so subpath imports still tree-shake.

TypeScript sources are published too, but only as the target of the declaration and source maps — nothing resolves to them. Go-to-definition lands on real `.tsx`, and stack traces map back to it.

### Peer dependencies

`react` and `react-dom` are the only required peers, at **18 or 19**. CI runs the type-check and the full unit suite against both on every change, so the range is verified rather than merely declared.

Everything else is an **optional** peer — install it only if you import the entry point that needs it. Nothing else in the library imports them, and package managers do not warn about a missing optional peer.

| Entry point | Optional peer |
| --- | --- |
| `/code-editor`, `/code-editor-workspace` | `monaco-editor`, `@monaco-editor/react` |
| `/markdown` | `react-markdown` |
| The default typefaces (see [Fonts](#fonts)) | `@fontsource-variable/inter`, `@fontsource-variable/jetbrains-mono` |

```bash
npm install monaco-editor @monaco-editor/react   # only for /code-editor
npm install react-markdown                       # only for /markdown
```

Keeping Monaco out of the default install matters: it is ~74 MB on disk, and until now every consumer of `/button` paid for it.

### Fonts

The typography tokens name **Inter Variable** and **JetBrains Mono Variable**, but the package does not bundle font files — that would mean redistributing them, and it lets you self-host or swap faces instead. To get the intended typography, install the two optional font peers and import them in your app entry:

```bash
npm install @fontsource-variable/inter @fontsource-variable/jetbrains-mono
```

```tsx
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
```

Skip this and text falls back to the next family in the stack (`ui-sans-serif` / `ui-monospace`) — everything still works, it just will not match Storybook. To use different faces, override `--font-sans` / `--font-mono` rather than editing component source.

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
// — all values are ISO 8601 strings, never date objects
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

## Dates and times

Every date/time component takes and returns canonical ISO 8601 strings. There is no
date library to adopt, and the engine behind the components stays an implementation
detail.

```tsx
<DatePicker value="2026-08-26" onChange={(date) => save(date)} />
<TimePicker value="09:30" onChange={(time) => save(time)} />
<DateTimePicker value="2026-08-26T00:30:00Z" onChange={(instant) => save(instant)} />
<DatePicker mode="range" value={{ from: "2026-08-01", to: "2026-08-07" }} onChange={setRange} />
```

| Type | Shape | Notes |
| --- | --- | --- |
| `ISODate` | `"2026-08-26"` | |
| `ISOTime` | `"09:30"` or `"09:30:00"` | callbacks emit `HH:MM:SS` |
| `ISOInstant` | `"2026-08-26T00:30:00Z"` | always UTC; an offset like `+10:00` is accepted and normalised |

The types are template literals, so a literal in the wrong shape is a compile error
— a datetime passed to a `DatePicker`, an offset where `Z` is required. Values
arriving as `string` from an API are checked at runtime instead, and a value
carrying a time where a date belongs throws rather than being silently truncated.

Disabling dates is declarative, so the common cases need no date arithmetic:

```tsx
<DatePicker disabled={{ dayOfWeek: ["sat", "sun"] }} />
<DatePicker disabled={[{ before: "2026-01-01" }, "2026-12-25"]} />
```

For building `presets` and bounds, `@sixthshift/design-system/date-time` carries
ISO-native helpers (`todayISO`, `addDaysISO`, `startOfMonthISO`, `isWeekendISO`,
`compareISO`, …) so you never need Temporal at a call site. It also still exports
Temporal itself, for arithmetic the ISO surface deliberately does not carry —
widen with `fromISODate`, compute, narrow back with `toISODate`.

See [docs/component-catalog.md](docs/component-catalog.md#datetime-pickers) for the
full prop tables.

### Upgrading from 0.2.x

The pickers previously took and returned `Temporal` objects. At a call site, wrap
existing values with `serialize()` and parse what comes back, or — better — drop
Temporal from your own code entirely:

```tsx
// before
<DatePicker value={Temporal.PlainDate.from(dueDate)} onChange={(d) => save(d?.toString())} />

// after
<DatePicker value={dueDate} onChange={(d) => save(d)} />
```

`DateRangeValue` and `DisabledDateMatcher` are no longer exported; use
`ISODateRange` and `DisabledDates`. `DateTimeRangeValue` survives as an alias of
`ISOInstantRange`. The Temporal-typed helpers that `@sixthshift/design-system/calendar`
re-exported (`isDateDisabled`, `temporalToISO`, and friends) are now internal — the
ISO helpers above cover what they were reachable for.

## Theming

Tokens are JSON (`src/theme/{palette,theme,typography}.json`) compiled to CSS variables (`theme.css`). Light/dark switch via `data-theme` attribute on the root element. Consumers restyle by overriding CSS variables at runtime — component source stays untouched. See [docs/design-tokens.md](docs/design-tokens.md) for the full token reference.

### Tailwind integration

If your app uses Tailwind and you want to extend the theme:

```ts
// tailwind.config.ts
import uiConfig from "@sixthshift/design-system/tailwind.config";

export default {
  presets: [uiConfig],
  content: ["./src/**/*.{ts,tsx}", "./node_modules/@sixthshift/design-system/dist/**/*.js"],
};
```

## Development

```bash
bun install          # `prepare` builds JS, types, theme and styles into dist/
bun run storybook    # component workbench on :6006
bun run dev          # watch-rebuild theme + Tailwind CSS
bun run test         # unit + date-time tests
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
├── date-time/    # Date/time utilities wrapping @js-temporal/polyfill
├── theme/        # Token JSONs + schemas + generator types
├── styles/       # Tailwind entry (base.css)
├── stories/      # Design-system doc stories (palette, theme)
└── lib/          # Utilities (cn, format, boundaries, overlay/components contexts)
```

## Versioning

Semver via git tags (`v0.1.0`, ...). Component props **and token names** are public API — renaming a token is a breaking change.

Versioning and releasing are automatic, driven by
[Conventional Commit](https://www.conventionalcommits.org) subjects and derived
by `scripts/next-version.ts`.

| Commit | Bump |
| --- | --- |
| `feat:` | minor |
| `fix:`, `perf:`, `refactor:`, `build:`, `revert:`, **anything unrecognised** | patch |
| `feat!:`, or a `BREAKING CHANGE:` footer | breaking |
| `chore:`, `ci:`, `docs:`, `style:`, `test:` | no release |

Below `1.0.0` a breaking change moves the **minor** rather than declaring
`1.0.0` — going stable stays a deliberate act.

CI runs on every push to `main`. When it goes green, `version.yml` walks the
commits since the last `v*` tag, writes the bump into `package.json`, commits it
as `chore(release): vX.Y.Z [skip ci]`, tags it, and calls the publish workflow —
which publishes to npm with
[provenance](https://docs.npmjs.com/generating-provenance-statements), a
verifiable link from the tarball back to the commit and workflow that built it.
No release pull request and no changelog: the tag range is the record.

Versioning waits on CI rather than triggering on the push directly, so a commit
is only ever versioned after the browser and visual suites have passed on it. A
tag pointing at red `main` is a lie the registry then serves to everyone.

The **last tag is the reference point**, never `package.json`. A hand-edited
manifest therefore cannot skip or replay a version — the stamp is an output of
the mechanism, not an input to it. The one exception is the first release, which
has no tag to count from and ships the version `package.json` declares.

Preview what the next push would cut:

```bash
bun run scripts/next-version.ts --explain
```

The line between the two halves of that table is **whether the commit can reach
the published tarball**, not whether it feels important. Every code subpath is
compiled from `src/` into the tarball, so a `refactor:` still changes the bytes
a consumer receives; `build:` changes what lands in `dist/`, and
`tailwind.config.ts` is itself an exported subpath. Tests, workflows, formatting
and prose either do not ship or are not user-visible, so they release nothing.

Two consequences worth knowing:

- A subject with no conventional prefix cuts a **patch** rather than being
  dropped. Shipping a change unversioned is worse than shipping it undersized.
- A renamed or removed export needs `feat!:` or a `BREAKING CHANGE:` footer.
  Filed as `refactor:` it cuts a patch, which understates it.

One repository secret is required:

| Secret | Why |
| --- | --- |
| `NPM_TOKEN` | Publishing. Must be an npm **automation** token, so it works with 2FA. |

Tagging by hand still works and goes through the same publish path:

```bash
git tag v0.2.0 && git push origin v0.2.0
```

## Docs

Design-system knowledge lives in [`docs/`](docs/): [design tokens](docs/design-tokens.md), [component catalog](docs/component-catalog.md), [component authoring](docs/component-authoring.md), [component API design](docs/component-api-design.md), [composition](docs/composition.md), [visual hierarchy](docs/visual-hierarchy.md), [spacing](docs/spacing.md), [motion](docs/motion.md), [states](docs/states.md), [overlays](docs/overlay-primitives.md), [forms](docs/forms.md), [modals](docs/modals.md), [responsive](docs/responsive.md), [density](docs/density.md), [copy](docs/copy-conventions.md), [time formatting](docs/time-formatting.md), [UX principles](docs/ux-principles.md), [design philosophy](docs/design-philosophy.md).
