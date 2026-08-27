# Composition Patterns

How primitives combine into composites, and composites into pages. The "missing middle" between component-level decisions and page-level patterns.

UI built on this design system is composed from a small set of layers. Each one consumes the layer below it. This doc names the layers and the rules for moving between them.

## The composition stack

```
Pages           — modules/<feature>/pages/<name>/<Name>.tsx
↑
Page parts      — modules/<feature>/pages/<name>/components/*.tsx
↑
Domain rows     — modules/<feature>/components/*Row.tsx
↑
Composites      — @sixthshift/design-system composites (Modal, Tabs, ToggleGroup, InfiniteList)
↑
Primitives      — @sixthshift/design-system primitives (Button, Card, Input, Heading)
↑
Tokens          — design tokens (bg-bg-normal, fg-subtle, gap-4)
```

A layer consumes the layer below; it does *not* consume the layer above. Tokens know nothing about Buttons; Buttons know nothing about pages. Composition flows up.

## Layer rules

### Tokens
Named values for color, spacing, type. The atom layer. See [Design Tokens](design-tokens.md).

### Primitives
Single-purpose components from `@sixthshift/design-system` (`Button`, `Card`, `Input`, `Heading`, `Subtitle`, `Badge`, `Spinner`). They:
- Consume tokens directly.
- Have orthogonal APIs (`variant` × `intent`), per [Component API Design](component-api-design.md).
- Don't import other primitives at composition time (a `Card` doesn't ship with a `Button` inside).

**The rule:** if you're combining two primitives every time, you've found a composite.

### Composites
Multi-primitive components that solve a recurring structural problem. `Modal`, `Tabs`, `ToggleGroup`, `InfiniteList`. They:
- Combine primitives into reusable shapes.
- Often expose sub-component slots (`Modal.Header`, `Modal.Body`).
- Live in `@sixthshift/design-system` (engineering convention: composites are domain-agnostic).

**The rule:** a composite must be domain-agnostic. If it knows about a specific entity type, it's a domain row, not a composite.

### Domain rows
Per-domain components like `ItemRow`, `ItemCard`, `DocumentCard`. They:
- Live in `modules/<feature>/components/`.
- Render *one* domain entity in one of the density modes.
- Compose from primitives and composites, never directly from tokens.
- Encode domain-specific affordances (state encoding, action buttons, metadata layout).

**The rule:** if a row shape would be useful across domains, the *shape* should be promoted to a composite — but the domain-specific row stays in its module.

### Page parts
Components specific to one page. `ItemsHeader`, `ItemsStream`, `LensChips`. They:
- Live in `modules/<feature>/pages/<name>/components/`.
- Compose domain rows + composites + primitives into the larger structures the page needs.
- Are *not* reusable outside their page; if you find yourself importing them elsewhere, they should be lifted.

**The rule:** page parts have a single consumer (the page). If a second consumer appears, the part needs to be lifted — either to the module's `components/` (for domain reuse) or to `@sixthshift/design-system` (for cross-domain reuse).

### Pages
The top-level component for a route. `Items`, `ItemDetail`, `Documents`. They:
- Live in `modules/<feature>/pages/<name>/<Name>.tsx`.
- Compose page parts.
- Wire URL state, queries, and mutations.
- Follow a pattern (Index Page Pattern, Detail Page Pattern).

**The rule:** pages should read like a sentence — header, content, modals. If the page has more than ~50 lines of layout, you have page parts you haven't extracted yet.

## When to add a layer

A useful heuristic: **does this pattern appear in two places?**

- **Once**: inline it.
- **Twice**: still inline it (premature abstraction).
- **Three times**: extract it. Pick the layer based on its scope:
  - Domain-specific → page part or domain row
  - Cross-domain → composite

The penalty for inlining is acceptable; the penalty for premature abstraction is hours of refactoring later.

## When to extract a composite

A composite is the *highest-leverage* layer to invest in — it's reusable across every page. Worth it when:

- The same primitive combination appears in 3+ domains
- The combination has stateful behavior (a modal that opens, a tab group that switches)
- The combination has a clear single responsibility

Don't extract when:

- The combination is just "Card with a header and some children" — that's just a `Card`
- The combination is one-off (page-specific shape, used once)
- The combination would require so many props that the API becomes complex

## Composition anti-patterns

### Skipping a layer

A page composing tokens directly (`<div className="bg-bg-normal p-6 ...">`) instead of using `Card`. Skip a layer once, you create drift; skip it routinely, the design system erodes.

### Domain leak into composites

An "ItemFilter" composite that imports server/database types. Composites are domain-agnostic. If filtering items needs special logic, the special logic lives in a page part — the composite stays generic (e.g., `FilterModal` with a `slots` prop).

### Wrapper-only components

An `ItemCardWrapper` that just renders `<Card><ItemRow ... /></Card>` and nothing else. If the wrapper has no logic, inline it.

### Premature primitives

A `PrimaryButton` that wraps `<Button variant="solid" intent="brand">`. The CVA variants are the primitive's API; another component wrapping them defeats the point. Just use the variants.

### Page-part reach

A page part imported from another page's directory. If `ItemsHeader` is reused on another page, it should be in its module's `components/` (if it's actually domain-specific — probably not) or `@sixthshift/design-system` (if it's a generic "filterable index header" composite).

## Composing an index page (annotated)

A typical index page is a useful walkthrough of the layers:

```tsx
// ItemsPage.tsx — the page
<div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
  <ItemsHeader ... />         // page part
  <Card ...>                  // primitive
    <LensChips ... />         // page part using ToggleGroup (composite)
    <ItemsStream ... />       // page part using ItemRow (domain row) using primitives
  </Card>
</div>
```

Each piece has a clear layer. The page itself contains no token-level styling besides the page container — every other concern is delegated downward.

## The page column

That "page container" the walkthrough leans on isn't domain-specific — it's the one piece of layout *every* primary page owns. The shape is fixed:

```tsx
<div className="mx-auto flex max-w-3xl flex-col gap-6"> … </div>
```

A single centered column, vertical stack, fixed gap. The only knobs are width and gap:

- **`max-w-3xl`** — the default. Lists, detail, settings, anything text-or-row shaped. This is the width every Index Page Pattern and Detail Page Pattern surface uses.
- **`max-w-4xl`** — wider, for dashboard/grid surfaces whose content is cards-across rather than a reading column.
- **`gap-6` vs `gap-8`** — `gap-6` is the norm; dashboards that stack large composed sections use `gap-8`.

The column is the page's *only* token-level layout. Everything below it is a part, row, composite, or primitive.

### The `<main>` owns padding

The page column sets width and gap — it does **not** set padding. Page padding belongs to the app layout's `<main>`, once, for every route:

- Desktop: `p-6`
- Mobile: `p-4 pb-20` (the `pb-20` clears the bottom nav)

**The rule:** a page must never re-pad its outer container (`p-*`, `px-*`, `py-*`). The padding is already there; adding more double-pads on every edge and the spacing no longer matches the rest of the app. This is the page-column rule most likely to be violated, because a page viewed in isolation *looks* like it's missing padding — it isn't; the `<main>` supplies it.

### The drift to watch for

The common violation is a page that writes `mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6` — it adds `px-4 py-6` *inside* the already-padded `<main>` (double padding) and widens past the `max-w-3xl`/`4xl` column. The correct form is `mx-auto flex max-w-4xl flex-col gap-6` with no padding.

A deliberate full-bleed surface that *cancels* the `<main>` padding with negative margins is a different pattern, not this drift.

## Related

- [Component API Design](component-api-design.md) — how primitives encode their API
- [Visual Hierarchy](visual-hierarchy.md) — the foundations layers consume
