# Component Axes — Target

**Status: target.** Steps 1-2 have landed (vocabulary renames; Button's neutral/brand split); steps 3-7 have not. `component-authoring.md` describes the system as it is today; this describes where the axes are going and why. Fold sections of this into `component-authoring.md` as they land, and delete them from here.

---

## The three axes

Every primitive's appearance factors into at most three independent props. Each names a property of the **content**, never of the rendering.

```ts
intent    = neutral | brand | danger | success | warning
emphasis  = subtle | normal | strong
size      = xs | sm | md | lg | xl
```

| Axis | Question it answers | Property of |
|---|---|---|
| `intent` | What does this *mean*? | The thing itself — a delete is destructive alone in an empty room |
| `emphasis` | How much attention should this claim, relative to its surroundings? | The thing's importance in context |
| `size` | How much room does it occupy? | Layout |

Two booleans sit beside them for geometry that isn't on any ramp:

```ts
inline?:   boolean   // renders as inline text, not a box (was variant="link")
iconOnly?: boolean   // squares the box at the current size (was size="icon")
```

## Why these names

The house rule is stated in `design-philosophy.md`: **`intent="danger"`, not `color="red"`.** Name the meaning; let the theme decide the rendering. The `intent` axis has followed that rule since the component-token layer landed. The second axis never did — `variant="solid"` is `color="red"` for shape.

That naming actively defeats the layer beneath it. The point of `theming/recipes/*.css` is that a consumer repoints rendering without a release. But `variant="outline"` **pins the rendering at the call site**: a brand that decides its middle rung should be a tinted fill rather than a border has to edit every call site, because the decision was baked into JSX. `emphasis="normal"` puts that decision in one recipe cell, where the rest of the system already keeps its decisions.

It also matters that the name survives a re-skin. If a consumer brand expresses its middle rung as a 3px offset shadow with no border, a prop named `outline` is **false in the JSX** — the call site asserts a rendering that isn't happening. `emphasis="normal"` stays true under any theme, for the same reason `intent="danger"` stayed true when the danger palette changed.

### Why not `primary | secondary | tertiary`

It was the first candidate, and it means something real: rank in a decision hierarchy. It was rejected because it is only true for competing actions, and most of the axis isn't that.

Of the sixteen non-story `variant=` call sites in the library today, ten are genuine rank — the footer button rows in `TimePicker`, `CalendarView`, `DateTimePicker` and `DateTimeRangePicker`, each pairing a `solid` Apply against `ghost` Cancel/Today/Now. The others are not. `Toast`'s dismiss is quiet because it is chrome, not because it is third-most-important; it is the only control for its job. `TabsTrigger`'s count badge and `TagChip` have no siblings to rank against at all — a status label has no place in a decision hierarchy. And `Toast.tsx:115` breaks the reading outright: the action button is the most important thing in the toast and gets the quietest treatment, because of placement. Even within the ten, the ordering is loose — `CalendarView` puts Today *and* Cancel on the same rung, so it is "recommended vs not", not a three-step ranking.

So `primary` would fail the same way `solid` does, inverted. `solid` names a rendering truthfully and lies about being universal; `primary` names a rank truthfully and lies about applying to things that have no rank.

Attention weight is what all seventeen sites actually express, and it is still a content property — an "Overdue" badge deserves more attention than a "Paid" one regardless of how either is drawn. `subtle | normal | strong` is already the house word for it in the token tiers.

**Known cost:** `emphasis="strong"` suggests `--bg-*-strong` and will not deliver it (Button's loudest rung reaches for `--bg-brand`). The association is loose and deliberate. Also lost: "one primary per view" is a real design rule that these names do not carry — it belongs in prose review guidance, which is where it was enforceable anyway.

## Rules

1. **A name means one thing system-wide.** A component ships a subset; it never redefines a member. `intent="neutral"` is grey everywhere, including on Button.
2. **`intent` names a token family.** Nothing joins the menu without `--bg-*` / `--fg-on-*` / `--border-*` behind it. This is what keeps `info`, `accent`, `primary`, `muted`, `healthy`, `error` out permanently.
3. **`emphasis` never carries colour, `intent` never carries weight.** Every combination stays expressible.
4. **Neither axis switches rendering mode.** A component with two distinct render paths gets its own prop for that.
5. **`size` never carries shape.** Shape is a boolean.
6. **Every component ships all three emphasis rungs.** How each renders is the recipe's call, not the axis's.
7. **Types are `Loose<T>`, closed unions exported alongside.** A consumer adds a rung or an intent in CSS with no release; downstream code that must narrow builds on the closed `*Name` union.

## What the shipped theme renders

The mapping is the recipe's business — this table records the default theme's choices, not the meaning of the axis. A consumer repoints any cell.

| | `subtle` | `normal` | `strong` |
|---|---|---|---|
| Button | ghost — no fill until hover | outline — border, no fill | solid fill |
| Badge | outline — border, resting surface | soft tint | solid fill |

Both components have exactly three treatments today, already ordered by weight, so nothing collapses. The arbitrary gaps disappear as a side effect: Button currently has no `soft` and Badge no `ghost`, and `design-tokens.md` shrugs at this with "values are component-specific". Under `emphasis` every component has all three rungs and chooses how to draw them.

## Per-component subsets

| Component | `intent` | `emphasis` | `size` | Notes |
|---|---|---|---|---|
| Button | all 5, default `neutral` | all 3, default `strong` | `xs`–`xl`, default `md` | `+ inline`, `+ iconOnly` |
| Toggle | inherits Button | inherits Button | inherits Button | |
| ToggleGroup | `ButtonIntent` (widened) | all 3 | `xs`–`lg` | |
| Badge | all 5, default `brand` | all 3, default `strong` | `sm \| md`, default `md` | new size axis |
| TagChip | — | — | forwards Badge's | own `--tag-chip-fg` |
| Message | `neutral \| danger \| success \| warning`, default `neutral` | — | `sm \| md` | |
| Toast | inherits Message | — | — | |
| ProgressBar | all 5, default `brand` | — | — | |
| Spinner | — | — | `sm`–`xl` | recolour via `--spinner-fg` |
| Modal | — | — | `sm \| md \| lg \| full` | already compliant |
| Sheet | — | — | `sm \| md \| lg` | already compliant |

## Migration

### Intent vocabulary

| From | To | Cost |
|---|---|---|
| `primary` | `brand` | **Zero call sites.** `intent="primary"` never appears — Badge only receives it as an implicit default. Touches Badge.tsx, badge.css, docs. |
| Button `neutral` = brand | `neutral` = grey, new `brand` cells, default stays `neutral` | Button is the lone outlier — `neutral` already means grey in Badge (`bg-strong`) and Message (`bg-normal`). **A bare `<Button>` does change**: it was brand-filled, it is now grey. See the note below on why no default could have avoided that. |
| `muted` | deleted | Badge loses three cells. TagChip renders `intent="neutral"` and supplies its own `--tag-chip-fg`. See the specificity note below. |
| ProgressBar (hardcoded `bg-fg-success`) | `intent`, default `brand` | Progress is not an outcome; a bar at 40% is not succeeding. Changes the rendering from green to brand. |

#### Why the default intent stays `neutral`

The first attempt made `brand` the default, reasoning that a bare `<Button>` would then render unchanged. That is false, and the visual suite caught it: `neutral` only ever meant *brand* for `solid` and `link`. For `outline` and `ghost` it was already grey. So no single default preserves both — `brand` turns every unqualified outline and ghost button brand-tinted (`Card`'s BillCard "View Details"), and `neutral` turns every unqualified solid button grey.

With rendering-preservation off the table, the principle decides it: **the default of an axis should be the value that means "unspecified."** `neutral` is the absence of a colour family; `brand` is an affirmative choice. A primary action now says `intent="brand"` out loud — four call sites in this repo, all Apply buttons in the date/time pickers.

An override demo in `src/stories/component-tokens/` scoped on `[data-intent="neutral"]` with a bare `<Button>` is what pinned this down: with a `brand` default its selector silently stopped matching, and `component-tokens.visual.test.tsx` failed. That test exists precisely to catch a demo that stops demonstrating anything.

**Open:** `Badge` still defaults to `brand` (its old default was `primary`, unambiguously the brand colour, so keeping it preserves rendering). That leaves `<Button>` grey and `<Badge>` brand. Defensible — a badge with no intent still needs colour presence — but it is an inconsistency in defaults worth ruling on.

### Emphasis

`variant` → `emphasis`, values `solid|outline|ghost` → `strong|normal|subtle`. **Rename the prop, do not just change its values** — a downstream `variant="solid"` must fail to compile rather than silently become an unrecognised value landing on the recipe floor.

Sixteen non-story call sites in this repo — `ghost` 9, `solid` 4, `outline` 1, `link` 1, `soft` 1 (a seventeenth `outline` match is a doc comment in `TagChip.tsx:26`). Everything else is stories exercising the matrix.

`variant="link"` leaves the axis and becomes `inline`. It was never a quieter rung — it is different geometry: inline text, no button box. `Toast.tsx:115` gives this away already, hand-rolling `variant="link" className="h-auto p-0"`, a button apologising for having a box. `inline` is terminal: it overrides the box and takes `intent` for colour, and ignores `emphasis`, since an "inline strong" draws a distinction few designs make.

With `link` off the axis, `ToggleGroup`'s `Exclude<ButtonVariantName, "link">` disappears and it can take the widened `ButtonEmphasis` directly. The closed `*Name` unions stay exported for other narrowing, but their driving use case is gone.

Knock-on renames: `ButtonVariantName` → `ButtonEmphasisName`, `data-variant` → `data-emphasis`, `variantStructure` deleted (see below), recipe selectors `[data-variant="solid"]` → `[data-emphasis="strong"]`.

### Size

`default` → `md` across Button, Spinner, Message, TagChip. Modal and Sheet already comply. No alias is kept — the library has no external consumers yet, so every rename in this document is a clean break.

`md` over `default` because `default` encodes *which value is the default* — separate information that goes stale the moment a component's default moves, leaving `default` sitting between `sm` and `lg` while the real default is elsewhere. `md` cannot lie.

`size="icon"` → `iconOnly`, which squares the box at whatever size is set. `size="sm" iconOnly` was unexpressible while `icon` was a fixed `h-9 w-9` on the size union. `iconOnly` is threaded through `Toggle` and `ToggleGroup` too, so no component loses the icon-only shape.

Badge gains `size: sm | md` so TagChip forwards it instead of injecting padding and font-size through `className`.

### Mode props

`CheckboxGroup` and `RadioButtonGroup` currently pair `variant: "default" | "button"` with `appearance: "segmented" | "separate"`, where `appearance` is meaningless unless `variant="button"`. Collapse both into one prop, so the illegal state is unrepresentable:

```ts
appearance?: "control" | "segmented" | "separate"
```

`ToggleGroup` keeps its existing two values — same prop, same meanings, it simply has no `control` path.

### Types and callbacks

- `ToggleGroup.intent` widens to `ButtonIntent`. Only `variant` needed the closed union, and that need is gone.
- `FormFieldFeedback.intent` becomes `Exclude<MessageIntentName, "neutral">` instead of a hand-rolled parallel union.
- `Code/Workspace/Toolbar.tsx` imports `ButtonEmphasisName` instead of re-declaring the union as a literal.
- `SearchInput` and `TagInput`: `onChange` → `onValueChange`. Both take a bare value rather than a `ChangeEvent`, which is the ambiguity `onValueChange` exists to remove.

## Prerequisite: a structural token tier

**The axis rename is cosmetic without this.** Renaming `variantStructure`'s keys to `strong|normal|subtle` renames the problem.

The system themes colour and nothing else:

- `tokens.css` has **zero** structural tokens. No radius, no shadow, no border-width, no font-weight — the only non-colour entries are `--font-sans` and `--font-mono`.
- All twenty recipe files are colour-only.
- Structure is compiled into the `.tsx`: `Button.tsx`'s `variantStructure` lookup (`solid: "shadow"`, `outline: "border shadow-xs"`) and the cva base literals (`rounded-md` on Button, `rounded-md border` on Badge — so every Badge carries a 1px border regardless of variant).

`Button.tsx`'s own comment claims the seam is open: *"an unrecognised variant stays a legal value that contributes no structure, leaving a consumer's CSS free to define it."* That works only by **omission**. A consumer can add a rung and get nothing; they cannot redefine what the middle rung renders as, because `border shadow-xs` is baked in.

Across the library: **38 components hardcode radius, 21 hardcode shadow, 20 hardcode border-width.**

The fix is the one colour already had — structure moves into the cell:

```css
/* tokens.css — new tier */
--radius-sm/md/lg/full, --shadow-xs/sm/md/lg, --border-width-thin/thick

/* recipes/button.css */
.btn {
  --button-radius: var(--radius-md);
  --button-border-width: 0;
  --button-shadow: var(--shadow-sm);
}
.btn[data-emphasis="normal"] {
  --button-border-width: var(--border-width-thin);
  --button-shadow: none;
}
```

```tsx
// Button.tsx — variantStructure deleted entirely
rounded-(--button-radius) border-(length:--button-border-width) shadow-(--button-shadow)
```

The `.tsx` then holds no rendering opinion at all, which is what the component-token commit set out to achieve. Colour made the trip; structure did not.

This also repairs `Loose<T>`, currently half-working: a consumer adding `emphasis="brutalist"` today gets a colour cell and then fights `variantStructure`'s silence with `className`. With structural tokens, `[data-emphasis="brutalist"]` defines the whole thing.

**Open within this:** how much structure belongs in the shared tier versus per-component. A brand wanting square badges but round buttons needs `--badge-radius` not to be simply `var(--radius-md)`. The component-token grammar handles it; it needs deciding per property.

## Suggested order

The intent and size work is independently correct and does not get cheaper by waiting on the structural tier.

1. **Vocabulary renames** — `primary`→`brand`, `default`→`md`, `icon`→`iconOnly`. ~~Done.~~ Clean break, no aliases: the library has no external consumers, so a deprecation window would only preserve names nobody uses.
2. **Button's neutral/brand swap** — the one real behaviour change, isolated to `button.css` and `toggle.css`.
3. **ProgressBar onto a recipe** — replaces its hardcoded `bg-fg-success` fill. StatsCard and MetricRow, which held the last raw-palette colours, are no longer in the library.
4. **`appearance` collapse, `onValueChange`, ToggleGroup / FormField / Toolbar type fixes.**
5. **Structural token tier** — its own design pass, not a passenger on a rename.
6. **`variant` → `emphasis`** — last, once the recipes can actually express what a rung means.
7. Fold the settled parts into `component-authoring.md`.

## Implementation notes

**TagChip's foreground.** Setting `--badge-fg` in `.tag-chip` will not work — `.badge[data-emphasis="subtle"][data-intent="neutral"]` is specificity 0,3,0 against `.tag-chip`'s 0,1,0, so the Badge cell wins. Pass a `text-(--tag-chip-fg)` utility through `className`: Tailwind's utilities layer beats the components layer and `cn()` puts it last. Confirm `tailwind-merge` dedupes it against `.badge`'s own `text-(--badge-fg)` rather than emitting both.

**Stale docs to fix alongside.** `design-tokens.md`'s intent table lists `neutral` → colour "Brand", which reflects only Button's current meaning and is wrong for Badge and Message. `modals.md` instructs `intent="brand"` on a confirm button, which does not exist today and lands on the recipe floor — correct once this target lands.
