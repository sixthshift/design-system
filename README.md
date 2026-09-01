# design-system

Personal design system: design tokens, theme pipeline, and a React component library. Consumed as a versioned dependency (MUI-style), configured through the theme surface — never by editing component source in the consumer.

A single package, `@sixthshift/design-system`: ~80 components (primitives, overlays, forms, pickers, charts, typography) + a two-layer CSS token pipeline + Tailwind config. Built on [shadcn/ui](https://ui.shadcn.com) patterns.

Browse the components: **[sixthshift.github.io/design-system](https://sixthshift.github.io/design-system/)** — Storybook, rebuilt from `main` by `.github/workflows/pages.yml`.

## Orientation

**Owns:** The component library — 80+ exports via subpath imports, design tokens, theme system (two CSS token layers — semantic and component — authored over a palette convention), Tailwind config, and Storybook stories. Components span primitives, composites, typography, charts, and overlays.

**Boundaries:** Bundles a `./date-time` module (`@sixthshift/design-system/date-time`, wrapping `@js-temporal/polyfill`) used internally by the date/time components — those components exchange ISO 8601 strings, so consuming one does not require adopting Temporal. Also Floating UI (popover/tooltip positioning) and CVA (variant styling). Peer-depends on React 18 or 19. No app/domain coupling — domain-specific components live in consuming apps.

**Surprise:** All components are imported via subpath exports (`@sixthshift/design-system/button`), never from a barrel root — there is no main export. Positioning uses Floating UI, not Radix. Variants use the `variant` (visual) + `intent` (semantic) orthogonal prop pattern via CVA, not className-based styling. Compound components (e.g. Tabs) use `Object.assign` to attach sub-components. Check `src/components/` before creating any new UI element.

## Consuming from a project

```bash
npm install @sixthshift/design-system
```

```css
/* your CSS entry — Tailwind 4 is a required peer */
@import "tailwindcss";
@import "@sixthshift/design-system/themes/linen.css";
@source "../node_modules/@sixthshift/design-system";
```

That second line is opinionated: it replaces Tailwind's default palette with this
system's tokens and takes over a few globals. See
[what the theme takes over](#what-the-theme-takes-over) before adopting it.

```tsx
// anywhere — components via subpath exports (no barrel root)
import { Button } from "@sixthshift/design-system/button";
```

**What ships:** compiled ESM (`.js`) plus type declarations (`.d.ts`) in `dist/`, and the tokens as CSS. No prebuilt stylesheet: the components are Tailwind classes, so your build compiles them from the `@theme` block the theme import brings with it. Nothing runs on install and no consumer toolchain has to transpile this package. The module tree is preserved rather than bundled, so subpath imports still tree-shake.

That last sentence is measured, not asserted. `bun run check:size` bundles ten
representative subpaths in isolation and holds each to a committed budget —
`/button` is 9.9 kB gzipped and cannot reach Floating UI, Temporal or Monaco;
`/code-editor` is 2.5 kB because Monaco stays an optional peer. Tree-shaking is
doing real work: lucide-react is 1.4 MB of source and contributes 1.6 kB to
`/date-picker`. `bun run scripts/check-size.ts --why ./button` breaks any entry
down by what actually survives into the bundle.

TypeScript sources are published too, but only as the target of the declaration and source maps — nothing resolves to them. Go-to-definition lands on real `.tsx`, and stack traces map back to it.

**Module resolution:** subpath types only resolve under `"moduleResolution": "bundler"`, `"node16"`, or `"nodenext"` in `tsconfig.json`. The older `"node"` setting ignores the `exports` map entirely and fails with `TS2307` on every subpath. The package is also ESM-only — every `exports` entry has an `"import"` condition and nothing else, so `require("@sixthshift/design-system/button")` fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`. A CJS test runner (e.g. Jest without ESM configured) needs to be set up for ESM before it can import this package.

Those four sentences are enforced, not just written down. `bun run check:consumer-resolution`
type-checks [a real consumer](fixtures/consumer-resolution/consumer.tsx) — importing
by package name, so resolution goes through `exports` — under each of
`bundler`, `node16` and `nodenext`, and asserts that `node10` still fails with
`TS2307` on every subpath. `bun run check:published` runs
[publint](https://publint.dev) and [arethetypeswrong](https://arethetypeswrong.github.io)
over the packed tarball and holds all 69 subpath entries to the same
`{ types, import }` shape, so an accidental `require` condition cannot slip in.
Both run in CI.

### Server Components / Next.js App Router

Nothing to configure — import components straight into a server file:

```tsx
// app/page.tsx — a Server Component, no "use client" needed
import { Button } from "@sixthshift/design-system/button";
import { Heading } from "@sixthshift/design-system/heading";
```

Every module that needs a client boundary carries its own `"use client"`
prologue, placed on the implementation module rather than the subpath entry. So
the boundary starts where the interactivity does: `Heading`, `Body`, `Text`,
`Badge`, `Input`, `Spinner` and the rest of the static surface render on the
server and ship no JS, while `Switch`, `Select`, `Card`, the pickers and the
overlays become client components at the point you use them.

Two consequences worth knowing:

- **Event handlers still can't cross the boundary.** `<Button onClick={...} />`
  needs `"use client"` in *your* file — that is React's rule about passing
  functions to Client Components, not something this package can lift.
- **Hooks are client-only.** `@sixthshift/design-system/hooks`,
  `useModal`/`useToast`, and `OverlayProvider` have to be called from a client
  component.

A DOM-less `renderToString` pass over every component story runs in CI
(`bun run test`, the `ssr` project), and `bun run check:use-client` fails the
build on a missing or spurious directive.

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
// Primitives (Button, Badge, Card, Input, Textarea, Checkbox, Switch, ...)
import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";

// Composites (FormField, Tabs, ...)
import { FormField } from "@sixthshift/design-system/form-field";

// Charts (LineChart, BarChart, Sparkline)
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

Tokens are CSS. The theme is a folder under `src/theme/` — `palette.css` (raw
scales) plus `theme.css` (semantic tokens per mode) — plus one import of the
shared, theme-independent system (`theming/tailwind.css`, which carries the
component recipes and the Tailwind config), published as `themes/linen.css`. **Linen** is
the system's one theme: one warm temperature through everything, the grey
included, consolidated from the `plans/10` palette explorations (the six
alternatives live at the `themes-exploration` git tag). The artifact holds the palette, the semantic tokens for each mode, and the
`@theme` block that tells Tailwind which utilities exist — so a token and its
utility can never disagree.

Light/dark switch via the `data-theme` attribute on the root element. Consumers
restyle by overriding CSS variables at runtime — component source stays
untouched. The
[Theme page in Storybook](https://sixthshift.github.io/design-system/?path=/docs/design-system-theme--docs)
emits a starting theme file for you to copy — every token, pre-filled with the
shipped values — and lists every variable the system declares. The
[Theming page](https://sixthshift.github.io/design-system/?path=/docs/design-system-theming--docs)
is the guide to what the names mean; [docs/design-tokens.md](docs/design-tokens.md)
is the architecture behind both.

Tokens come in two layers, and the one you reach for depends on the *kind* of
change you are making:

| Layer | Example | Change it to | Scope |
| --- | --- | --- | --- |
| Semantic (`theme.css`) | `--bg-brand` | **re-skin** — brand is now purple | every surface that means "brand" |
| Component (recipes) | `--button-bg` | **re-wire** — *this* part uses a different meaning | one component, or one subtree |

The semantic layer *is* the theme, and it is the default way to restyle anything
that has a name and recurs. Re-skinning is a token *value* change and it is
global by design. Re-wiring is a recipe change, the exception card — if you find
yourself writing the same component-token override in more than one scope,
you are doing semantic work at the component layer: hoist it.

Behind the semantic layer sits a palette (`--color-blue-600` and friends). It is
an authoring convention that keeps the theme's values coordinated — not a third
layer: components never reference it, and it is not API for consumers either.
Reach for a semantic token or bring your own value.

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
semantic token directly. `Button` paints `var(--button-bg)`, and a recipe in the
published stylesheet decides what that resolves to for each cell:

```css
/* what ships, in @layer components */
.btn[data-variant="solid"][data-intent="brand"] {
  --button-bg: var(--bg-brand);
  --button-bg-hovered: var(--bg-brand-hovered);
  --button-fg: var(--fg-on-brand);
}
```

That recipe is data, not compiled-in class names, so any cell can be re-pointed
from your own stylesheet — one instance, one subtree, one cell app-wide, or
every instance. **Write component-token overrides in `@layer overrides`** — a
layer the theme declares last, so it outranks the recipes (`components`) and
the utilities by layer order alone:

```css
@layer overrides {
  .checkout-confirm {
    --button-bg: var(--bg-success);
    --button-bg-hovered: var(--bg-success-hovered);
    --button-bg-pressed: var(--bg-success-pressed);
    --button-fg: var(--fg-on-success);
  }
}
```

No selector mimicry, no `!important`: the cascade compares layers before
specificity, so one plain class beats the recipe's three-attribute selector.
Unlayered CSS still wins over everything, so existing unlayered overrides keep
working. One asymmetry to know: **semantic-token re-skins stay unlayered** —
the theme's own `:root` blocks are unlayered, and unlayered library CSS beats
any layered rule of yours, so a re-skin wrapped in `@layer` silently loses.
Rule of thumb: component vars → `@layer overrides`; semantic tokens → plain
CSS after the import.

**The semantic layer — the naming grammar, what each token means, the
utilities they compile into, light and dark, and re-skinning — is the
[Theming page in Storybook](https://sixthshift.github.io/design-system/?path=/docs/design-system-theming--docs).**
The component-token techniques above are running live, with controls, under
[Component Tokens](https://sixthshift.github.io/design-system/?path=/docs/design-system-component-tokens--docs).
Component token names are public API and change only under semver;
`bun run check:recipes --list` prints them all.

### What the theme takes over

This is a design system, not a component grab-bag: importing a theme adopts
its opinions across your whole app, not just inside its components. All of it is
deliberate, and all of it is worth knowing before you commit.

| What | Effect on your app |
| --- | --- |
| **Tailwind's default palette is removed** | `bg-red-500`, `text-gray-700`, `border-gray-200` and the rest stop compiling — in your own markup too. What remains is this system's tokens (`bg-bg-brand`, `text-fg-subtle`, `border-border-normal`, …) plus `white`, `black`, `transparent` and `current`. A colour that was never designed should not be one class away. |
| **`dark:` means `[data-theme="dark"]`** | Not `prefers-color-scheme`. Theming here is a runtime attribute swap, so every `dark:` utility in your app follows the attribute instead of the OS setting. |
| **`font-sans` and `font-mono`** | Resolve to Inter Variable and JetBrains Mono. Install the [font peers](#fonts) or the stacks fall through to the system defaults. |
| **Three global rules** | `*` gets `border-color: var(--border-normal)`, so a bare `border` is the token colour rather than `currentColor`; `:focus-visible` gets the system focus ring; and under `prefers-reduced-motion` every animation and transition is pinned to `0.01ms`. These apply to your elements as well as ours. |
| **`--color-{blue,green,amber,red}-*`** | 44 variable names shared with Tailwind's palette hold this system's values. Only reachable if you read the variables directly in your own CSS — don't: the palette is an authoring convention, not API, and its names can change without a major version. |

If you want a specific stock colour back, re-declare it in your own `@theme`
block after the import — everything you do not name stays gone:

```css
@import "tailwindcss";
@import "@sixthshift/design-system/themes/linen.css";

@theme {
  --color-red-500: oklch(63.7% 0.237 25.331);
}
```

## Development

```bash
bun install           # `prepare` builds JS, types and styles into dist/
bun run dev           # component workbench on :6006
bun run test          # unit + date-time + server-render (ssr) tests
bun run test:coverage # the same suite, with the coverage gate CI enforces
bun run type-check    # tsc --noEmit (src and tests)
bun run check         # biome lint + format
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

[`api/public-api.txt`](api/public-api.txt) is what makes that checkable rather
than merely stated: every subpath's exports, the resolved shape of every type,
and all 443 token names, in one committed file. `bun run check:api` regenerates
it from `dist/` and fails if it differs, so a rename or removal arrives as a diff
in the pull request. `bun run api:update` accepts an intentional change. This is
worth more here than in most packages because the bump is derived from the commit
*subject* and releases are unattended — a rename filed as `refactor:` cuts a
patch and ships to consumers with no human in between.

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
