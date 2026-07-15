# Spacing

Builder reference for spacing in PA. When to use which `gap-*`, `p-*`, and how rhythm composes.

PA uses Tailwind's 4px-scale spacing, with deliberate conventions about which values appear at which composition levels. Following these conventions creates the consistent rhythm that makes pages feel like they belong to the same product.

## The scale

PA uses a small subset of Tailwind's spacing scale. If you reach for a value not in this list, you're probably composing wrong.

| Tailwind | Pixels | Role |
|---|---|---|
| `1` | 4px | Sub-element nudges, icon-text gap inside a tag |
| `2` | 8px | Tight inline grouping — chip contents, icon+label pairs |
| `3` | 12px | Inline rhythm — between row elements (avatar gap, name-to-label gap) |
| `4` | 16px | Default rhythm — between rows in a list, content-to-content gap inside a card |
| `6` | 24px | Between major sections within a page, default card padding |
| `8` | 32px | Between distinct page regions, generous block separation |
| `12` | 48px | Page-level rhythm, between unrelated areas |
| `16` | 64px | Top-of-page breathing room, rarely needed |

Values **not** in this list (`5`, `7`, `9`, `10`, `11`, etc.) should not appear in PA UI code. If you find yourself reaching for one, the layout has an off-by-one problem you can usually fix with `4` or `6`.

## Padding conventions

### Container padding

| Container | Padding | Token |
|---|---|---|
| Card (default) | 24px | `p-6` (Card primitive default) |
| Card (dense content like a row list) | 16px | `p-4` |
| Page outer (main content area) | 24px | `p-6` (set in `MainContentLayout`) |
| Modal body | 24px | `p-6` (Modal primitive) |
| Inline element (chip, badge, button) | varies by primitive | use the primitive |

### Row padding

Rows inside a stream get small padding so a list reads dense:

| Row type | Padding | Token |
|---|---|---|
| Compact row (directory-style) | `px-2 py-1.5` | name + minimal metadata |
| Standard row (data row with state) | `px-2 py-2` | name + relationship + signal |
| Rich row (with avatar / multi-line content) | `px-3 py-3` | rare; prefer compact for index pages |

Rows are *inside* a card, which already has padding. Avoid doubling — if the card has `p-6`, the rows don't also need horizontal padding to match the card edge.

## Gap conventions

### Within a row
- Icon to text: `gap-1.5` or `gap-2`
- Avatar to content: `gap-3`
- Between row sections (name area | metadata area): `gap-3` or `gap-4`

### Between rows in a list
- Index page stream rows: no gap, rely on row padding (`py-1.5` or `py-2`) for separation
- Card grid (Library landing tiles): `gap-4`

### Between content blocks in a card
- Multiple related sections: `gap-4`
- Section dividers (e.g., chip bar above stream): `gap-4`

### Between page-level zones
- Header to content card on an index page: `gap-6`
- Between unrelated cards: `gap-6` or `gap-8`

## Rhythm rules

A page reads cleanly when its spacing forms a rhythm. The rhythm test: scan the page and count distinct vertical gaps. **If you see more than three distinct gap sizes on one page, you're probably mixing rhythms.**

Three good rhythms for an index page:

1. **Tight intra-row** (`gap-3` or `gap-4` between row elements)
2. **Medium inter-row** (row padding `py-1.5`/`py-2`)
3. **Large page-level** (`gap-6` between header and card)

This three-tier rhythm reads as one composition. Adding a fourth tier (e.g., `gap-5` somewhere) breaks the pattern.

## Banded streams (whitespace as separator)

The People page uses **larger gaps between bands** of differently-stated rows (active / reach-out / quiet) to create soft section breaks without explicit dividers.

Pattern (from `PeopleStream.tsx`):
```tsx
<div className="flex flex-col gap-6">
  {bands.map((band) => (
    <div key={band.state} className="flex flex-col">
      {band.entries.map((entry) => <PersonRow ... />)}
    </div>
  ))}
</div>
```

`gap-6` (24px) between bands; no gap between rows within a band. The whitespace alone communicates the section break — no `<hr>`, no caps headers.

## When to override the conventions

Almost never. If you find yourself wanting a non-standard value:

1. **Try the nearest standard value first.** Most "this needs to be tighter" cases are solved by going from `gap-4` to `gap-3`, not from `gap-4` to `gap-3.5`.
2. **Examine the surrounding rhythm.** If the desired value would make a fourth tier, the rhythm needs rethinking, not patching.
3. **Last resort: add a doc note.** If a non-standard value is genuinely required, leave a comment explaining why. Future maintainers should be able to see the deviation was deliberate.

## Related

- [Visual Hierarchy](visual-hierarchy.md) — spacing as one of the hierarchy axes
- [Design Tokens](design-tokens.md) — color/border tokens that complement spacing
