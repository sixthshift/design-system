# design-system

Personal design system: design tokens, theme pipeline, and a React component library. Consumed as a versioned dependency (MUI-style), configured through the theme surface — never by editing component source in the consumer.

A single package, `@sixthshift/design-system`: ~80 components (primitives, overlays, forms, pickers, charts, typography) + a JSON-driven token/theme pipeline + Tailwind config. Built on [shadcn/ui](https://ui.shadcn.com) patterns.

## Orientation

**Owns:** The component library — 80+ exports via subpath imports, design tokens, theme system (JSON-driven CSS generation), Tailwind config, and Storybook stories. Components span primitives, composites, typography, charts, and overlays.

**Boundaries:** Bundles a `./date-time` module (`@sixthshift/design-system/date-time`, wrapping `@js-temporal/polyfill`) used internally by the date/time components — those components exchange ISO 8601 strings, so consuming one does not require adopting Temporal. Also Floating UI (popover/tooltip positioning) and CVA (variant styling). Peer-depends on React 18 or 19. No app/domain coupling — domain-specific components live in consuming apps.

**Surprise:** All components are imported via subpath exports (`@sixthshift/design-system/button`), never from a barrel root — there is no main export. Positioning uses Floating UI, not Radix. Variants use the `variant` (visual) + `intent` (semantic) orthogonal prop pattern via CVA, not className-based styling. Compound components (e.g. Tabs) use `Object.assign` to attach sub-components. Check `src/components/` before creating any new UI element.

## Consuming from a project

```bash
npm install @sixthshift/design-system
```

```css
/* your CSS entry — Tailwind 4 is a required peer */
@import "tailwindcss";
@import "@sixthshift/design-system/theme.css";
@source "../node_modules/@sixthshift/design-system";
```

That second line is opinionated: it replaces Tailwind's default palette with this
system's tokens and takes over a few globals. See
[what the theme takes over](#what-the-theme-takes-over) before adopting it.

```tsx
// anywhere — components via subpath exports (no barrel root)
import { Button } from "@sixthshift/design-system/button";
```

**What ships:** compiled ESM (`.js`) plus type declarations (`.d.ts`) in `dist/`, and the tokens as CSS. No prebuilt stylesheet: the components are Tailwind classes, so your build compiles them from the `@theme` block `theme.css` brings with it. Nothing runs on install and no consumer toolchain has to transpile this package. The module tree is preserved rather than bundled, so subpath imports still tree-shake.

TypeScript sources are published too, but only as the target of the declaration and source maps — nothing resolves to them. Go-to-definition lands on real `.tsx`, and stack traces map back to it.

**Module resolution:** subpath types only resolve under `"moduleResolution": "bundler"`, `"node16"`, or `"nodenext"` in `tsconfig.json`. The older `"node"` setting ignores the `exports` map entirely and fails with `TS2307` on every subpath. The package is also ESM-only — every `exports` entry has an `"import"` condition and nothing else, so `require("@sixthshift/design-system/button")` fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`. A CJS test runner (e.g. Jest without ESM configured) needs to be set up for ESM before it can import this package.

### Peer dependencies

`react`, `react-dom` and `tailwindcss` are the required peers — React at **18 or 19**, Tailwind at **4**. CI runs the type-check and the full unit suite against both React versions on every change, so that range is verified rather than merely declared.

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

// Pickers (Calendar, DatePicker, TimePicker, DateTimePicker, DateRangePicker, DateTimeRangePicker)
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

Tokens are CSS (`src/theme/tokens.css`), published as `theme.css`. That one file
holds the palette, the semantic tokens for each mode, and the `@theme` block that
tells Tailwind which utilities exist — so a token and its utility can never
disagree.

Light/dark switch via the `data-theme` attribute on the root element. Consumers
restyle by overriding CSS variables at runtime — component source stays
untouched. See [docs/design-tokens.md](docs/design-tokens.md) for the full token
reference.

Tokens come in three tiers, and the one you reach for depends on the *kind* of
change you are making:

| Tier | Example | Change it to | Scope |
| --- | --- | --- | --- |
| Palette | `--color-ocean-600` | add or alter a hue | everything downstream |
| Semantic | `--bg-brand` | **re-skin** — brand is now purple | every surface that means "brand" |
| Component | `--button-bg` | **re-wire** — *this* part uses a different meaning | one component, or one subtree |

Re-skinning is a token *value* change and it is global by design. Re-wiring is a
recipe change, and it is the one that used to be impossible.

### Tailwind integration

The three lines above are the whole integration. The theme import carries the
token variables *and* the `@theme` block declaring the library's utilities, so
`bg-bg-brand`, `z-modal`, `animate-fade-in` and `dark:*` compile in your build
alongside your own classes — same pass, same tree-shaking, and
`className="mt-8"` on a library component works like any other Tailwind class.

**The `@source` line is required.** Tailwind 4's automatic content detection
never scans `node_modules`, so without it none of this library's classes are
found and every component renders unstyled.

The path is a filesystem path resolved relative to the CSS file that declares
it — not a package specifier, so a bare `"@sixthshift/design-system"` silently
matches nothing. Adjust the depth to wherever your CSS entry lives; in a
monorepo with hoisted dependencies that is often `"../../node_modules/…"`. A
symlinked install (pnpm) needs no special handling: `@source` follows the link
into the store.

Beyond that there is no preset, no `@config`, and no prebuilt stylesheet to
import.

**Tailwind 4 is required, not optional.** Every component is a set of Tailwind
classes, so without it they render unstyled. That is why `tailwindcss` is a
non-optional peer dependency.

### Restyling a component

Every component reads its colours from its own tokens rather than naming a
semantic token directly. `Button` resolves `--button-bg`, whose value is decided
by a recipe in the published stylesheet:

```css
/* what ships, in @layer components */
.btn[data-variant="solid"][data-intent="neutral"] {
  --button-bg: var(--bg-brand);
  --button-bg-hovered: var(--bg-brand-hovered);
  --button-fg: var(--fg-on-brand);
}
```

That recipe is data, not compiled-in class names, so you can re-point any cell.
Four granularities, narrowest to broadest:

```tsx
// one instance — inline styles outrank layers and specificity both
<Button style={{ "--button-bg": "var(--bg-strong)" } as React.CSSProperties} />
```

```css
/* one subtree — impossible with token values, which are global */
.checkout .btn[data-intent="neutral"] { --button-bg: var(--bg-success); }

/* one cell, app-wide — reject a house opinion */
.btn[data-variant="link"][data-intent="neutral"] { --button-fg: var(--fg-normal); }

/* every button */
.btn { --button-bg-hovered: var(--button-bg); }   /* no hover shift, anywhere */
```

**Write your overrides unlayered.** The cascade compares layers *before*
specificity, and unlayered author CSS outranks any layered author CSS — which is
why a bare `.btn { … }` beats the library's three-attribute selector without an
`!important`. The corollary is the trap: wrap the same rule in
`@layer components` (a Tailwind 3 habit) and it lands in the library's own layer,
where specificity decides again and your override silently loses on every cell
the library ships.

#### Adding an intent the library never shipped

```css
/* 1. the semantic tokens — both modes, mirroring the library's own selectors */
:root:not([data-theme]),
:root[data-theme="light"] { --bg-info: var(--color-ocean-700); --fg-on-info: #fff; }
:root[data-theme="dark"]  { --bg-info: var(--color-ocean-400); --fg-on-info: #06121f; }

/* 2. the recipe cell */
.btn[data-variant="solid"][data-intent="info"] {
  --button-bg: var(--bg-info);
  --button-fg: var(--fg-on-info);
}
```

```tsx
<Button intent="info">Details</Button>   // type-checks; no library release needed
```

`variant` and `intent` are typed as the shipped union *plus* `string`, so a value
you invent is accepted while the built-ins still autocomplete. Note that no
`@theme` entry is needed: recipes read `var(--bg-info)` as plain CSS, never
through a Tailwind utility. You own the contrast of tokens you add —
`bun run check:contrast` only sees the library's own.

#### Finding the token names

`bun run check:recipes --list` prints every component token grouped by
component. The names follow `--{component}[-{part}]-{context}[-{state}]`, where
context is `bg`/`fg`/`border`/`ring` and state is `hovered`/`pressed`/`disabled`
— e.g. `--modal-overlay-bg`, `--input-placeholder-fg`, `--card-border-hovered`.

Intent and variant never appear in a token *name*; they select via the `data-*`
attributes. That is what lets you add one.

**These names are public API** and change only under semver, like any export.

### What the theme takes over

This is a design system, not a component grab-bag: importing `theme.css` adopts
its opinions across your whole app, not just inside its components. All of it is
deliberate, and all of it is worth knowing before you commit.

| What | Effect on your app |
| --- | --- |
| **Tailwind's default palette is removed** | `bg-red-500`, `text-gray-700`, `border-gray-200` and the rest stop compiling — in your own markup too. What remains is this system's tokens (`bg-bg-brand`, `text-fg-subtle`, `border-border-normal`, …) plus `white`, `black`, `transparent` and `current`. A colour that was never designed should not be one class away. |
| **`dark:` means `[data-theme="dark"]`** | Not `prefers-color-scheme`. Theming here is a runtime attribute swap, so every `dark:` utility in your app follows the attribute instead of the OS setting. |
| **`font-sans` and `font-mono`** | Resolve to Inter Variable and JetBrains Mono. Install the [font peers](#fonts) or the stacks fall through to the system defaults. |
| **Three global rules** | `*` gets `border-color: var(--border-normal)`, so a bare `border` is the token colour rather than `currentColor`; `:focus-visible` gets the system focus ring; and under `prefers-reduced-motion` every animation and transition is pinned to `0.01ms`. These apply to your elements as well as ours. |
| **`--color-{emerald,sky,slate}-*`** | 33 variable names shared with Tailwind's palette hold this system's values. Only reachable if you read the variables directly in your own CSS. |

If you want a specific stock colour back, re-declare it in your own `@theme`
block after the import — everything you do not name stays gone:

```css
@import "tailwindcss";
@import "@sixthshift/design-system/theme.css";

@theme {
  --color-red-500: oklch(63.7% 0.237 25.331);
}
```

## Development

```bash
bun install          # `prepare` builds JS, types and styles into dist/
bun run dev          # component workbench on :6006
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
a consumer receives, and `build:` changes what lands in `dist/`. Tests,
workflows, formatting and prose either do not ship or are not user-visible, so
they release nothing.

Two consequences worth knowing:

- A subject with no conventional prefix cuts a **patch** rather than being
  dropped. Shipping a change unversioned is worse than shipping it undersized.
- A renamed or removed export needs `feat!:` or a `BREAKING CHANGE:` footer.
  Filed as `refactor:` it cuts a patch, which understates it.

No repository secret is required. Publishing goes through npm trusted
publishing (OIDC): GitHub Actions mints a short-lived token scoped to the run,
npm exchanges it against the trusted publisher configured on the package, and
provenance is attached automatically. There is nothing to leak and nothing to
rotate. npm authorises the *calling* workflow rather than the one containing
the publish step, so `version.yml` has to stay the sole entry point — see
[`.github/workflows/release.yml`](.github/workflows/release.yml) for the
detail.

Tagging by hand still works and goes through the same publish path:

```bash
git tag v0.2.0 && git push origin v0.2.0
```

## Docs

Design-system knowledge lives in [`docs/`](docs/): [design tokens](docs/design-tokens.md), [component catalog](docs/component-catalog.md), [component authoring](docs/component-authoring.md), [component API design](docs/component-api-design.md), [composition](docs/composition.md), [visual hierarchy](docs/visual-hierarchy.md), [spacing](docs/spacing.md), [motion](docs/motion.md), [states](docs/states.md), [overlays](docs/overlay-primitives.md), [forms](docs/forms.md), [modals](docs/modals.md), [responsive](docs/responsive.md), [density](docs/density.md), [copy](docs/copy-conventions.md), [time formatting](docs/time-formatting.md), [design philosophy](docs/design-philosophy.md).
