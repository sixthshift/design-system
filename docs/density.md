# Density Modes

Builder reference for choosing density on a PA page. Three modes: Read, Scan, Browse. Pick one per page.

PA has three implicit density tiers; this doc formalizes them with concrete rules so a builder can pick decisively. The mode shapes padding, line-height, row height, and how much information appears per viewport.

## The three modes

| Mode | Used for | Feel |
|---|---|---|
| **Read** | Detail pages, modals, focused viewing | Spacious. One focus per viewport |
| **Scan** | Index streams, dashboards | Medium. Rows with breathing whitespace |
| **Browse** | Directories, search results, A–Z lists | Dense. Single-line rows |

Pick one per **page**, not per section. A page in two modes is two pages.

## Read density

For: Detail pages (TaskDetail, PersonDetail), modals, the Now view, anywhere the user is *focusing on one thing*.

### Concrete rules

- **Card padding**: `p-6` (default Card padding)
- **Internal card gap**: `gap-6`
- **Field rows**: `py-2` or larger; comfortable space between rows
- **Section spacing**: `gap-6` to `gap-8` between content blocks
- **Line height**: relaxed body (`leading-normal` or `leading-relaxed`)
- **Items per viewport**: ~5–10 distinct elements

### Example
The Person Detail page (`packages/web/src/modules/library/people/pages/PersonDetailPage.tsx`) uses Read density: title at `text-2xl`, generous `gap-6` between sections, fields stacked with comfortable padding.

## Scan density

For: Index pages (People, Notes, Tasks), Library, dashboards. The user is *moving through items* but reading some.

### Concrete rules

- **Card padding**: `p-6`
- **Internal card gap**: `gap-4`
- **Row padding**: `px-2 py-1.5` to `py-2`
- **Inter-row spacing**: none (rely on row padding) or `gap-2` for very loose feel
- **Band separation** (banded streams): `gap-6` between bands, no gap within a band
- **Line height**: default body
- **Items per viewport**: ~15–25 rows

### Example
The People page (`packages/web/src/modules/library/people/pages/PeoplePage/PeoplePage.tsx`) uses Scan density: rows with `py-1.5` padding, `gap-6` between active/reach-out/quiet bands, relationships and recency as quiet right-aligned labels.

## Browse density

For: A–Z directories, large search-result lists, terminology references. The user is *finding* a specific item, not reading any of them.

### Concrete rules

- **Card padding**: `p-4` or `p-6` (the card is just frame)
- **Row padding**: `px-2 py-1`
- **Inter-row spacing**: none
- **Line height**: tight (`leading-tight`)
- **Items per viewport**: ~25–40 rows
- **Typography**: small (`text-sm` or `text-xs`)

### Example
None yet in PA. When the People directory grows past ~100 entries and lens-stream becomes inefficient, a Browse-density "All People A–Z" view would be the right answer.

## Mixing modes — the anti-pattern

If a page has both a *card with rich rows* and a *dense list of small rows*, the eye reads two rhythms. That's the jolt this taxonomy exists to prevent.

If a page genuinely needs both modes, that's a signal the page has two jobs. Either:

1. **Split the page** — separate routes for the two intents.
2. **Push one mode into a modal** — the inspector for a row uses Read density; the page stays Scan.
3. **Use lenses** — same page, switchable focus. The lens narrows; it doesn't change density.

## Choosing a density

A short decision tree:

1. **Is the user reading or finding?**
   - Reading → Read
   - Finding → Browse
   - Both → Scan
2. **How many items are visible at once?**
   - 1–10 → Read
   - 10–25 → Scan
   - 25+ → Browse
3. **What's the focus depth?**
   - Deep (one thing matters) → Read
   - Medium (skimming, sometimes stopping) → Scan
   - Shallow (lookup, click through) → Browse

When in doubt, prefer the next mode *down* in density. Lighter pages read better than crammed ones; PA's pillar is calm power.

## Related

- [Visual Hierarchy](visual-hierarchy.md) — density as one of the hierarchy axes
- [Spacing](spacing.md) — the values density modes consume
