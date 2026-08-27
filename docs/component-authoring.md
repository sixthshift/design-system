# Component Authoring

Construction conventions for authoring a primitive in `@sixthshift/design-system` — the "house style" you'd otherwise only learn by reading source. These are the rules every primitive in `src/components/` already follows; new ones must too.

This is the **construction-side** reference. Its companions:

- [Component API Design](component-api-design.md) — decides prop *shape* (array prop vs compound children).

Each rule below is stated as an imperative, backed by current code, with the rationale where it isn't obvious.

---

## Color goes in `intent`, never in `variant`

A primitive's appearance is factored into **independent axes**, and `variant` is not allowed to carry color:

- **`variant`** — fill and shape: `solid`, `outline`, `ghost`, `link`, `soft`. How the surface is drawn, color-free.
- **`intent`** — semantic color: `neutral`, `primary`, `danger`, `success`, `warning`, `muted`. What the surface *means*, shape-free.
- **`size`** — the third axis where the primitive has one.

The vocabulary above is the shared menu, not a fixed enum — each primitive declares the subset it supports. `Button` (`Button.tsx:65-66`) ships `solid|outline|ghost|link` × `neutral|danger|success|warning` × six sizes; `Badge` (`Badge.tsx:43-44`) ships `solid|soft|outline` × `neutral|primary|danger|success|warning|muted` with no size axis. Pick from the menu; don't invent a parallel name.

The cross-product does **not** live in cva. It lives in a recipe — `src/theme/recipes/<component>.css` — as one cell per `(variant, intent)` pair, selected by `data-*` attributes the component renders:

```css
/* recipes/button.css, in @layer components — the colour is selected by the
   (variant, intent) pair, not baked into either axis */
.btn[data-variant="solid"][data-intent="danger"] {
  --button-bg: var(--bg-danger);
  --button-bg-hovered: var(--bg-danger-hovered);
  --button-bg-pressed: var(--bg-danger-pressed);
  --button-fg: var(--fg-on-danger);
}
```

```tsx
// Button.tsx:21 — geometry only; not one colour is named here (excerpt;
// the real string is a single sorted literal)
"btn … bg-(--button-bg) … text-(--button-fg) … hover:bg-(--button-bg-hovered) …"
```

So a component's cva holds only axis-orthogonal, non-colour styling — `size`, and a plain lookup for the structural half of `variant` (`solid: "shadow"`, `outline: "border shadow-xs"`). `intent` is not a cva variant at all any more: it was never anything but colour.

Emit the attributes through the component's `*Recipe()` helper (`buttonRecipe`, `badgeRecipe`), which returns the class string together with `data-variant`/`data-intent`. Anything reusing another component's look — `Toggle` and `ToggleGroupItem` build on Button — must call that helper rather than reproducing the classes, or it lands on the recipe's floor instead of a cell.

Two rules the validator enforces (`bun run check:recipes`):

- **Never put an intent or variant value in a token name.** `--button-bg-danger` is wrong; `.btn[data-intent="danger"] { --button-bg: … }` is right. The name enumerating the values is exactly what stops a consumer adding one.
- **Every token a component reads must be declared by a recipe.** An undeclared token computes to its initial value — `transparent` for a background — with no error anywhere.

Type the axes as the shipped union *plus* `string` (`Loose<T>`), so a consumer can add an intent in CSS with no release. Export the closed union too (`ButtonIntentName`): once `string` is in a union you can no longer `Exclude` from it, and downstream code that needs to narrow — `ToggleGroup` excluding `link`, `ValidationStatus` keying a map by intent — has to build on the closed names.

`defaultVariants` **must set every axis**, and the component must default `variant`/`intent` in its destructure, so a bare `<Button />` renders a real cell rather than the floor.

**Why this is rule #1:** it's the convention most often violated. The reflex is to add a `variant="danger"`, which collapses the two axes and makes "outline danger" unexpressible. Keeping color in `intent` means every fill works in every color for free, and a new color is one new value across all variants — not a new variant per color.

---

## Style with Tailwind + cva + `cn()` only

Tokens and utility classes are the only styling mechanism. No CSS modules, no styled-components, no inline style objects except where layout demands a computed value (e.g. floating-ui's `floatingStyles`).

`cn` is the single merge helper (`lib/utils.ts:8-10`):

```tsx
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

`clsx` resolves conditionals; `twMerge` dedupes conflicting Tailwind classes so the last one wins. Never reference raw palette values. Colour belongs in the component's recipe, read back as `bg-(--button-bg)`; a bare semantic class like `bg-bg-brand` in component source is a colour decision a consumer cannot reach. See [design-tokens.md](design-tokens.md).

One more trap: keep a base class string in a **single** literal. Biome's `useSortedClasses` unsafe fix strips the trailing space before a `+` in a concatenated string, welding the last class of one fragment to the first of the next.

---

## `className` is the universal override, merged last

Every primitive accepts `className` and merges it **last** so a consumer can always override. There are two correct placements:

- **cva components** — pass `className` *into* the variant call so tailwind-merge dedupes against the generated classes:

  ```tsx
  // Button.tsx:83-89 — `buttonRecipe` wraps this, returning the class string
  // together with the `data-variant`/`data-intent` the recipe selects on
  className: cn(variantStructure[variant], buttonVariants({ size, className }))
  ```

- **plain components** — `className` is the last argument to `cn()`:

  ```tsx
  // Avatar.tsx:5
  className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
  ```

Both put consumer classes last in the merge order. Don't prepend `className` or concatenate with a template string — that defeats `twMerge` and a consumer override silently loses to the base classes.

---

## Polymorphism: `asChild` + `Slot` for wrappers, `as` for text

Two idioms, chosen by what the primitive is:

**`asChild?: boolean` + the in-house `Slot`** — for interactive/structural primitives that need to *become* the consumer's element while keeping all behavior (a Button rendering as a router `<Link>`, a HoverCard trigger wrapping an existing inline element):

```tsx
// Button.tsx:101
const Comp = asChild ? Slot : "button";
```

`Slot` (`internal/Slot.tsx`) clones the single child and merges props onto it — composing event handlers (`childValue` then `parentValue`), concatenating `className`, shallow-merging `style`, and merging refs (`Slot.tsx:21-50`).

**Use the in-house `Slot`, not Radix's.** It's ~75 lines with no dependency, and the in-house merge semantics are deliberate (handler order, className concat). Pulling in `@radix-ui/react-slot` would add a dependency for behavior already owned here, and would couple the override semantics to an external package's choices.

**`as?` + a typed element union** — for text/display primitives where polymorphism means "render a different tag," not "become the child":

```tsx
// Text.tsx:19-25
export type TextElement = "span" | "p" | "div" | "label" | "code" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
const Text = React.forwardRef<HTMLElement, TextProps>(({ as: Comp = "span", ... }, ref) => <Comp ... />);
```

Rule of thumb: if the consumer supplies the element (`<Button asChild><Link/></Button>`), use `asChild` + `Slot`. If the primitive picks from a fixed set of tags, use `as`.

---

## Controlled/uncontrolled via `useControllableState` — never hand-rolled

Any primitive with internal state a consumer might want to control exposes the triad and delegates to the one hook:

- `value` (controlled) / `defaultValue` (uncontrolled seed) / `onValueChange`
- domain-named variants follow the same shape: `checked`/`defaultChecked`/`onCheckedChange` (Checkbox), `open`/`defaultOpen`/`onOpenChange` (HoverCard).

```tsx
// HoverCard.tsx:37-41
const [open, setOpen] = useControllableState({
  value: controlledOpen,
  defaultValue: defaultOpen,
  onChange: onOpenChange,
});
```

The hook (`hooks/useControllableState.ts`) returns `[value, setValue]`, mirrors writes to `onChange`, and only mutates internal state when uncontrolled. In dev it emits `console.warn` for the three classic mistakes (`useControllableState.ts:26-40`): switching controlled↔uncontrolled mid-life, and a controlled `value` with no `onChange` (read-only). Multi-mode primitives run one hook per mode and route by a discriminant — see `Select.tsx:57-68` (single vs multiple).

**Why one hook:** the controlled/uncontrolled handshake (when to read the prop, when to call back, how to detect the switch) is subtle and identical everywhere. Hand-rolling it per component reintroduces the same off-by-one bugs and drops the dev warnings.

---

## `forwardRef` + `displayName` for single-node wrappers

A primitive that renders **one DOM node and forwards its props** must use `forwardRef` with the ref typed to the rendered tag, and set `displayName`:

```tsx
// Input.tsx:14, 46
const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => ...);
Input.displayName = "Input";
```

The ref element type matches the tag: `HTMLButtonElement` for Button, `HTMLSpanElement` for Avatar, `HTMLInputElement` for Input. For polymorphic text the ref is `HTMLElement` and cast at the spread (`Text.tsx:25-28`).

**Carve-out — plain function components (no `forwardRef`):**

- **Context roots** — `Tabs`, `Modal`, `HoverCard`. They render a `Context.Provider`, not a DOM node, so there's nothing to forward a ref to (`Tabs.tsx:21`, `HoverCard.tsx:27`).
- **Config-leaves** — `Badge`, `EmptyState`. They render a fixed element from props and no consumer needs the node ref (`Badge.tsx:70`, `EmptyState.tsx:18`).

If a primitive is neither a context root nor a pure config-leaf, it forwards a ref.

---

## One subpath export per component — no barrel

Components are consumed by kebab-case subpath, declared in `package.json` `exports`:

```tsx
import { Button } from "@sixthshift/design-system/button";
```

There is **no aggregate `@sixthshift/design-system` barrel** — every component is its own entry (`package.json:15-93`). The folder is PascalCase (`components/Button/`); the export subpath is kebab-case (`./button`).

Each `index.ts` re-exports the component, its `Props` type, and any `*Variants` cva function:

```tsx
// Button/index.ts
export { Button, type ButtonProps, buttonVariants } from "./Button";
```

Compound primitives also re-export their parts (`Tabs/index.ts` exports `TabsList`, `TabsListProps`, etc.).

**Why subpaths, not a barrel:** per-subpath imports keep the dependency graph precise — importing `@sixthshift/design-system/button` doesn't pull every other component into the consumer's bundle, and Storybook/test builds stay scoped.

**Flag:** adding the folder + `index.ts` is not enough. **Forgetting the `package.json` exports entry breaks the import silently** — TypeScript can't resolve `@sixthshift/design-system/your-component` and there's no aggregate to fall back to. Every new primitive needs its `"./kebab-name": "./src/components/PascalName/index.ts"` line.

---

## Fixed per-component file layout

Every primitive folder follows the same shape:

```
Button/
  Button.tsx        # implementation
  Button.test.tsx   # Vitest unit tests
  Button.stories.tsx# Storybook stories
  index.ts          # re-exports
```

Complex primitives add a `components/` subdir for sub-parts and colocate `useX*.ts` hooks beside the root:

```
Select/
  Select.tsx  SelectDropdown.tsx  SelectTrigger.tsx
  useSelectKeyboard.ts            # colocated hook
  Select.test.tsx  Select.stories.tsx  index.ts
HoverCard/
  HoverCard.tsx
  components/                      # HoverCardTrigger, HoverCardContent, HoverCardContext
  index.ts
```

Sub-parts and component-specific hooks live with their owner, not in the shared `hooks/` or `lib/` dirs — those are for primitives shared *across* components (`useControllableState`, `cn`).

---

## Compound assembly: `Object.assign` + a dedicated context

A compound primitive attaches its parts to the root with `Object.assign`, and shares state through a dedicated `*Context`:

```tsx
// Tabs.tsx:44-47
export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Panels: TabsPanels,
});
```

The root renders only `<XContext.Provider>`; parts consume it via a `useXContext()` hook (`HoverCard.tsx:72`, `HoverCardTrigger.tsx:11`). Type the assembled value explicitly where the parts' types matter (`HoverCard.tsx:75-83`).

---

## Bake accessibility into the primitive

The primitive owns its a11y so consumers can't forget it:

- **Custom form controls render a real semantic role + `data-state`, plus a hidden native input for form submission.** Checkbox is a `<button role="checkbox">` with `aria-checked` (`"mixed"` when indeterminate) and `data-state`, and emits a visually-hidden `<input type="checkbox">` only when `name` is set, so it posts in a form (`Checkbox.tsx:86-126`).
- **Interactivity affordances are added only when interactive.** Card attaches `role="button"`, `tabIndex={0}`, and Enter/Space key handling **only when `onClick` is present** (`Card.tsx:12, 34`) — a static card stays a plain `<div>`.
- **Decorative SVGs are `aria-hidden`.** The Button spinner and Checkbox icons carry `aria-hidden="true"` (`Button.tsx:106`, `Checkbox.tsx:33`).
- **Label association uses `useId()`.** Checkbox generates an id only when it renders its own `<label>`, and wires `htmlFor`/`id` (`Checkbox.tsx:71-72, 135`).

When the lint rule for a deliberate a11y choice fires, suppress it with a `biome-ignore` that explains *why* it's correct (e.g. `Checkbox.tsx:85` documents the WAI-ARIA styled-checkbox pattern) — don't restructure to silence the linter.

---

## Authoring checklist

Before opening a PR for a new primitive:

- [ ] Color lives in `intent`, fill/shape in `variant`; `defaultVariants` sets every axis, and the component defaults `variant`/`intent` in its destructure.
- [ ] **No colour named in the `.tsx`.** Every colour reads a `--{component}-*` token; the mapping lives in `src/theme/recipes/<component>.css`, inside `@layer components`, selected by `data-variant`/`data-intent`.
- [ ] Recipe file created **and** imported by `src/theme/recipes/index.css`; `bun run check:recipes` passes.
- [ ] Axis types widened with `Loose<T>`, and the closed `*Name` unions exported too so downstream code can still narrow.
- [ ] Geometry stays in cva; base class string is a **single** literal (a `+` concatenation gets welded by biome's unsafe class sorter).
- [ ] Styled with Tailwind + cva + `cn()` — no CSS modules / styled-components / raw palette.
- [ ] `className` accepted and merged **last** (into the variant call for cva; last `cn()` arg otherwise).
- [ ] Polymorphism uses `asChild`+`Slot` (wrapper) or `as`+typed union (text) — not Radix Slot.
- [ ] Any controllable state goes through `useControllableState` with the `value`/`defaultValue`/`on*Change` triad.
- [ ] `forwardRef` + `displayName`, ref typed to the rendered tag — unless it's a context root or config-leaf.
- [ ] Folder is `PascalCase/`; files are `X.tsx` + `X.test.tsx` + `X.stories.tsx` + `index.ts`; sub-parts in `components/`, hooks colocated.
- [ ] `index.ts` re-exports component + `Props` + any `*Variants` + the `*Recipe` helper and axis types.
- [ ] **`package.json` `exports` has the `"./kebab-name"` entry** (the silent-failure step).
- [ ] Compound parts attached via `Object.assign` + a dedicated `*Context`.
- [ ] A11y baked in: semantic role + `data-state` + hidden native input for custom controls; interactive affordances only when interactive; decorative SVGs `aria-hidden`; `useId()` for labels.

---

## Related

- [Component API Design](component-api-design.md) — prop shape (array vs compound).
- [Design tokens](design-tokens.md) — the token vocabulary referenced by every primitive.
