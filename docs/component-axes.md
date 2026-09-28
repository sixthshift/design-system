# Component Axes — Target

**Status: landed.** Structure is partly themeable — see [Structure](#structure-radius-shadow-border) for the radius scale and the known limits. The axes, the intent-slot layer and every migration item below are in the code; `component-authoring.md` carries the working rules. This file stays as the record of *why* the axes are named as they are, so the question does not get reopened, plus the one piece of work still ahead.

---

## The axes

Every primitive's appearance factors into at most three props, plus two booleans for shape. Each prop is named for **what the caller knows at the call site** — that is the one rule that decides every name below.

```ts
intent   = neutral | brand | danger | success | warning   // what it means
variant  = solid | outline | ghost | soft | …             // how it is drawn — per component
size     = xs | sm | md | lg | xl                         // how much room it takes

inline?:   boolean   // inline text, no box (was variant="link")
iconOnly?: boolean   // squares the box at the current size (was size="icon")
```

| Axis | The caller knows… | Chosen from |
|---|---|---|
| `intent` | what the thing *means* — a delete is destructive alone in an empty room | the content |
| `variant` | what the design specifies — "ghost buttons in this toolbar" | the spec |
| `size` | how much room it has | the layout |

## Why these names

### `intent` names a meaning

The house rule is stated in `design-philosophy.md`: **`intent="danger"`, not `color="red"`.** The caller knows the meaning; the colour is the theme's call. It survives a re-skin — `intent="danger"` stayed true when the danger palette changed.

`neutral` is the absence of a colour family: the grey ramp, on every component. `brand` is the one member that names an identity rather than a meaning — in practice it means "the primary action" or "this is ours". That is kept deliberately: the name is honest, and the `brand` prop (`<Button intent="brand" brand="mint">`, rendering `data-brand`) scopes it to one of a theme's named brands.

### `variant` names a rendering — deliberately

This axis was going to be renamed `emphasis: subtle | normal | strong`, on the argument that `variant="outline"` pins the rendering at the call site and becomes false in a theme that draws its middle rung as, say, an offset shadow. That rename is **dropped**. There are three ways to name the axis, and the literal one is the only one that holds up:

| Naming | Example | States | Why not |
|---|---|---|---|
| **Effect** | `emphasis="strong"` | how it should come across | Emphasis is a *result* of how a component is styled, not an input — nobody asks for "a strong button". And it cannot answer the question a recipe has to: what does a strong button do on hover? |
| **Reason** | `role="primary"` | why it is drawn that way | The only genuinely semantic option, and it fails on the call sites. See below. |
| **Rendering** | `variant="ghost"` | what it looks like | Wrong in a theme that has no ghost — but see below for why that cost is small. |

**States belong to the treatment, not to an attention level.** `solid` moves its fill along its own ramp (`bg-brand` → `-hovered` → `-pressed`). `outline` keeps its border and gains a tint wash. `ghost` has nothing at rest and the same wash on hover. Every state is defined relative to a *resting surface*; `strong` names no surface, so `strong-hovered` means nothing, and the recipe could only answer by quietly translating `strong` back into `solid`. The abstraction would be a synonym plus an indirection.

**The re-skin argument does not survive this.** A brand that redraws the middle rung as a shadow must redefine its hover, pressed and focus states too — they are treatment-bound. That work happens in the recipe CSS regardless of what the JSX says, so the abstract name never bought portability where it mattered. What is left is a name that is false in one theme, and that theme can map `outline` to its nearest treatment, or add its own (`variant="shadow"`, see `Loose<T>` below) without a release. In this system a brand is colour-only anyway: `data-brand` re-points `--bg-brand` and nothing else; treatment lives in the library's recipes.

**Why not `primary | secondary | tertiary`.** It means something real — rank in a decision hierarchy — but only for competing actions, and most of the axis is not that. Of the sixteen non-story `variant=` call sites, ten are genuine rank: the footer rows in `TimePicker`, `CalendarView`, `DateTimePicker` and `DateTimeRangePicker`, each pairing a `solid` Apply against `ghost` Cancel/Today/Now. The others are not. `Toast`'s dismiss is quiet because it is chrome, not because it is third-most-important. `TabsTrigger`'s count badge and `TagChip` have nothing to rank against. `Toast.tsx:115` inverts it outright: the action is the most important thing in the toast and gets the quietest treatment, because of placement. And where rank does fit, it collapses to rendering anyway — `primary` is always `solid`.

So the caller states the meaning (`intent`) and copies the treatment from the spec (`variant`). "One primary action per view" is a real design rule these names do not carry; it belongs in review guidance, which is where it was enforceable anyway.

**The prop stays `variant`.** It is what every call site already says, so keeping it is free. `appearance` is less vague but is taken by the group mode prop below, and the two must not share a name.

## Rules

1. **A value means one thing system-wide.** A component ships a subset; it never redefines a member. `intent="neutral"` is grey everywhere.
2. **`intent` names a token family.** Nothing joins the menu without `--bg-*` / `--fg-on-*` / `--border-*` behind it. This keeps `info`, `accent`, `primary`, `muted`, `healthy`, `error` out permanently — `info` by explicit decision: an informational `Message` is `neutral`.
3. **`variant` never carries colour, `intent` never carries treatment.** Every combination stays expressible.
4. **Neither axis switches rendering mode.** A component with two distinct render paths gets its own prop for that.
5. **`size` never carries shape.** Shape is a boolean.
6. **A component ships the treatments that make sense for it.** There is no shared rung count. Badge has `soft`; Button does not need it.
7. **Types are `Loose<T>`, closed unions exported alongside.** A consumer adds a treatment or an intent in CSS with no release; downstream code that must narrow builds on the closed `*Name` union.
8. **The default of an axis is the value that means "unspecified".** For `intent` that is `neutral` on every component. A brand-coloured primary action says `intent="brand"` out loud.

## Per-component subsets

| Component | `intent` | `variant` | `size` | Flags |
|---|---|---|---|---|
| Button | all 5, default `neutral` | `solid \| outline \| ghost`, default `solid` | `xs`–`xl`, default `md` | `inline`, `iconOnly` |
| Toggle | inherits Button | inherits Button | inherits Button | `iconOnly` |
| ToggleGroup | all 5 (widened) | `solid \| outline \| ghost` | `xs`–`lg` | `iconOnly` |
| Badge | all 5, default `neutral` | `solid \| soft \| outline`, default `solid` | `sm \| md`, default `md` | |
| TagChip | — | — | forwards Badge's | own `--tag-chip-fg` |
| Message | `neutral \| danger \| success \| warning`, default `neutral` | — | `sm \| md` | |
| Toast | inherits Message | — | — | |
| FormField feedback | `danger \| success \| warning` | — | — | |
| ProgressBar | all 5, default `brand` | — | — | |
| Spinner | — | — | `sm`–`xl` | recolour via `--spinner-fg` |
| Modal | — | — | `sm \| md \| lg \| full` | |
| Sheet | — | — | `sm \| md \| lg` | |

ProgressBar's `brand` default is the one deliberate exception to rule 8. A progress bar exists to show motion, and a grey fill on a grey track reads as inert; `neutral` is available (it fills with `fg-subtle`, see its recipe) but is not the default. Progress is not an outcome either — a bar at 40% is not succeeding, which is why the default is not `success`.

## Migration

**All done.** No alias was kept for any rename below — the library had no external consumers, so every change was a clean break.

### Intent

| Change | Cost |
|---|---|
| `primary` → `brand` | **Done.** |
| Button `neutral` = brand → `neutral` = grey, new `brand` cells | **Done.** A bare `<Button>` changed from brand-filled to grey. |
| Badge default `brand` → `neutral` | **Done.** A bare `<Badge>` turned from brand-filled to grey. No library call site relied on the default; the scoped-brands stories now say `intent="brand"`. |
| `muted` deleted | **Done.** TagChip renders `intent="neutral"` and supplies its own `--tag-chip-fg` (`fg-subtle`) — see the specificity note under Implementation notes. Pixel-identical. |
| ProgressBar: hardcoded `bg-fg-success` → `intent`, default `brand` | **Done**, via a new `progress-bar.recipe.css`. Rendering changed from green to brand. |
| FormField feedback: hand-rolled union → `Exclude<MessageIntentName, "neutral">` | **Done.** Types only. |

#### Why no default preserves a bare `<Button>`

The first attempt made `brand` Button's default, reasoning that a bare `<Button>` would then render unchanged. That is false, and the visual suite caught it: `neutral` only ever meant *brand* for `solid` and `link`. For `outline` and `ghost` it was already grey. So no single default preserves both — `brand` turns every unqualified outline and ghost button brand-tinted (`Card`'s BillCard "View Details"), and `neutral` turns every unqualified solid button grey. With preservation off the table, rule 8 decides it. Four call sites in this repo say `intent="brand"`, all Apply buttons in the date/time pickers.

An override demo in `src/stories/component-tokens/` scoped on `[data-intent="neutral"]` with a bare `<Button>` is what pinned this down: with a `brand` default its selector silently stopped matching, and `component-tokens.visual.test.tsx` failed. That test exists precisely to catch a demo that stops demonstrating anything.

### Variant

The prop and its values stay. Two things leave the axis:

- **`variant="link"` → `inline`.** **Done.** It was never a quieter treatment — it is different geometry: inline text, no button box. `Toast.tsx:115` gives this away, hand-rolling `variant="link" className="h-auto p-0"`, a button apologising for having a box. `inline` is terminal: it drops the box, takes `intent` for colour, and ignores `variant`. With `link` gone, `ToggleGroup`'s `Exclude<ButtonVariantName, "link">` disappeared and it takes the widened `ButtonVariant` directly. `inline` drops `data-variant` and renders `data-inline="true"`, so no variant cell can match it.
- **Badge `soft` stays.** It was slated to become the middle of three rungs; with rule 6 it is simply one of Badge's treatments.

### Size

- `default` → `md` across Button, Spinner, Message, TagChip. **Done.** `md` over `default` because `default` encodes *which value is the default* — information that goes stale the moment a default moves.
- `size="icon"` → `iconOnly`, which squares the box at whatever size is set, so `size="sm" iconOnly` is expressible. **Done** on Button, Toggle and ToggleGroup.
- Badge gains `size: sm | md` so TagChip forwards it instead of injecting padding and font-size through `className`. **Done.** TagChip's `md` picked up Badge's `md` padding (`px-2.5`, was `px-2`).

### Mode props

**Done.** `CheckboxGroup` and `RadioButtonGroup` paired `variant: "default" | "button"` with `appearance: "segmented" | "separate"`, where `appearance` was meaningless unless `variant="button"`. Both collapsed into one prop, default `control`, so the illegal state is unrepresentable:

```ts
appearance?: "control" | "segmented" | "separate"
```

`ToggleGroup` keeps its existing two values — same prop, same meanings, it simply has no `control` path.

### Types and callbacks

- `ToggleGroup.intent` widens to `ButtonIntent`. **Done.**
- `Code/Workspace/Toolbar.tsx` takes `ButtonVariant` instead of re-declaring the union as a literal. **Done.**
- `SearchInput` and `TagInput` already exposed `onValueChange` — nothing to do.

## The intent-slot layer

**Landed.** Rule 3 says the axes are independent, but the recipes used not to be: `button.recipe.css` wrote one cell per `(variant, intent)` pair — 25 cell rules — Badge 19, and `toggle.recipe.css` re-stated Button's grid under `[data-state="on"]` for 15 more. Adding an intent was a job per component.

Now each intent is defined **once**, in `src/theming/intents.css`, as a fixed set of slots named by treatment, and each recipe maps its variants onto the slots:

```css
/* intents.css — one block per intent */
[data-intent="danger"] {
  --intent-solid-bg: var(--bg-danger);        /* + -hovered, -pressed */
  --intent-solid-fg: var(--fg-on-danger);
  --intent-tint-bg:  var(--bg-danger-subtle); /* + -hovered, -pressed */
  --intent-tint-fg:  var(--fg-on-danger-subtle); /* + -pressed */
  --intent-fg:       var(--fg-danger);
  --intent-border:   var(--border-danger);
}

/* button.recipe.css — one cell per variant */
.btn[data-variant="solid"] { --button-bg: var(--intent-solid-bg); --button-fg: var(--intent-solid-fg); … }
```

Button, Toggle, Badge, Message and ProgressBar paint this way; Button went from 25 cells to 4, Badge from 19 to 3, Toggle from 15 to 2, Message from 3 to 2.

Decisions made while landing it:

- **The neutral block is also the floor.** It is selected by bare `[data-intent]` as well as `[data-intent="neutral"]`, so an intent a consumer names but has not defined renders as neutral — legible, and interactive — rather than unstyled. Every intent-bearing element therefore resets the whole slot set, which is also what stops a component inheriting its parent's intent.
- **Slots resolve on the element carrying `data-intent`,** which every `*Recipe()` helper renders on the component itself. That is also where `data-brand` sits, so `--intent-solid-bg: var(--bg-brand)` sees the element's own scoped brand.
- **One single-intent override exists:** `.message[data-intent="neutral"]` sits on `bg-normal` rather than the grey tint — a neutral note is a plain bordered surface, and a grey wash reads as disabled. ProgressBar has the other, `neutral` filling with `fg-subtle` because `fg-normal` barely separates from its `bg-strong` track.
- **`check:recipes` guards the layer:** it is imported and layered, every named intent only re-points slots the floor declares, every slot references a semantic token defined in both modes, and every `--intent-*` a recipe reads is a real slot.
- **The component-token tables expand slot-based cells per intent,** reading the intent list from the stylesheet, so an intent added in CSS gets rows in every component's table.

It landed as a pure refactor. The visual suite's default comparator could not prove that on its own (see Implementation notes), so it was checked with an A/B run at `threshold: 0` against baselines freshly recorded at the parent commit: no component moved.

## Structure: radius, shadow, border

**Radius landed as a scale; the rest is a known limit.**

The theme used to own colour and nothing else. The fix considered first was a layer of role-named structural tokens (`--radius-control`, `--radius-surface`, `--shadow-raised`, …) in front of Tailwind's scale. It was **rejected as indirection without a payoff**: radius has no meaning to name the way colour does — there is no "danger radius", only small and large — so for radius the scale step *is* the semantic name. And "control" broke on Badge and TagChip, which use the same radius and are not controls.

**What landed:** the theme owns a five-step scale, `--border-radius-xs | sm | md | lg | xl`, `md` the middle and the default, mode-free. `src/theming/tailwind.css` resets Tailwind's own radius scale and points each `--radius-*` at the theme's step, so every `rounded-*` class reads the theme and a theme reshapes the whole library in five lines. `rounded-none` and `rounded-full` are geometry, not steps. Values are Tailwind's, unchanged, so this was pixel-identical — except Card `size="xl"`, which used the only off-scale step (`rounded-2xl`) and now uses `xl`. Seven bare `rounded` classes (a fixed `0.25rem` no theme could reach) became `rounded-sm`. `bun run check:radius` fails on bare `rounded` or an off-scale step, and on a theme or bridge missing a step.

**Known limits, deliberately not built:**

- **Per-component radius.** The scale changes every `rounded-md` at once; it cannot give Button different corners from Input. Overriding `.btn { border-radius }` directly also breaks segmented groups, whose joins use `rounded-l-md` / `rounded-none`. If that is ever needed, add `--button-radius: var(--border-radius-md)` in the recipe and read it as `rounded-(--button-radius)` (and `rounded-l-(--button-radius)` in the groups) — `check:radius` already allows that form.
- **Shadows.** Tailwind inlines shadow values into `.shadow-*` at build, so no variable exists to theme.
- **Border width.** `border` is a fixed 1px.
- **What a treatment draws.** `Button.tsx`'s `variantStructure` (`solid: "shadow"`, `outline: "border shadow-xs"`) and Badge's always-on border live in the `.tsx`, so a theme can re-colour `outline` but not redefine it, and a consumer's `variant="shadow"` gets colour but no shape. The fix is component tokens in the recipe cells (`.btn[data-variant="outline"] { --button-border-width: 1px; --button-shadow: … }`), on the few components whose structure varies by variant — Button, Toggle, Badge.

Worth building only when a second theme or brand needs to change shape, not just colour and corners.

## What is left

Nothing on the axes. The structural limits above are recorded, not scheduled.

## Implementation notes

**TagChip's foreground.** Setting `--badge-fg` in `.tag-chip` does not work — `.badge[data-variant="outline"]` is specificity 0,2,0 against `.tag-chip`'s 0,1,0, so the Badge cell wins. TagChip passes a `text-(--tag-chip-fg)` utility through `className` instead: Tailwind's utilities layer beats the components layer, and `tailwind-merge` drops `.badge`'s own `text-(--badge-fg)` (checked).

**The visual suite is blind to same-lightness hue changes.** `allowedMismatchedPixelRatio: 0` counts *pixels*, but pixelmatch's per-pixel colour `threshold` stays at its default 0.1, and a change between two families at the same ramp step can sit under it — ProgressBar's dark-mode fill going green-300 → blue-300 passed. Lowering the threshold is not an option against the committed baselines: at `0` or `0.02`, ~200 untouched screenshots fail on antialiasing noise between machines. For a change that must be colour-exact, do the A/B described above: record at the parent commit with `threshold: 0`, apply the change, compare, then restore the committed baselines. At `threshold: 0` on one machine, run-to-run noise is a few focus-ring edge pixels.

