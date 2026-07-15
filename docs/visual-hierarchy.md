# Visual Hierarchy

Visual hierarchy is the practice of expressing structure, importance, and grouping through visual cues — not through labels or chrome. Several distinct "axes" can carry that load, and a coherent design language picks which axis is doing what.

This doc names PA's axes, states which ones are formalized, and goes deep on the surface system (the most load-bearing axis for index pages).

## The axes

| Axis | Expresses | PA tools | Codified? |
|---|---|---|---|
| **Spatial** | Grouping, flow, relationships | Position, alignment, proximity, whitespace | Partially — `max-w-3xl` centered for index pages, `gap-*` for vertical rhythm |
| **Depth** | Containment, lift, layering | Surfaces, elevation, tonal contrast, shadow | Yes — see [Surface system](#the-surface-system) |
| **Typographic** | Importance, role, voice | Type ramp (Heading → Subtitle → Body → Muted) | Yes — primitives encode the ramp |
| **Color** | Identity, state, intent | Brand for primary, semantic intents for state | Yes — see [design-tokens.md](design-tokens.md) |
| **Density** | Browse vs read vs scan modes | Padding, line-height, item count per viewport | No — informal, see [Density](#density-informal) |
| **Motion** | Causality, attention, continuity | Transitions on state change | No — minimal by principle |

Two axes are load-bearing on most pages: **depth** (this surface holds data) and **typographic** (this text is more important than that text). Color is reserved for state. Spatial does grouping. Density and motion are background concerns.

## The surface system

### Two levels, no more

PA uses **exactly two surface levels**:

| Level | Background | Border | Shadow | Used for |
|---|---|---|---|---|
| **Base** | `bg-bg-subtle` (subtle grey) | none | none | Page body, behind everything else |
| **Elevated** | `bg-bg-normal` (white) | `border-border-normal` | `shadow` | Content cards — data containers |

Modals are not a third level; they're an overlay primitive with their own elevation rules (handled by the `Modal` primitive, not by direct surface composition).

### Why two and not more

More levels create ambiguity ("is this level 2 or level 3?") and force the eye to parse depth gradations that don't carry meaning. Two levels are sufficient for PA's job — index pages and detail pages — and they read confidently:

- **Brighter on duller** signals containment.
- **Bordered + lifted** confirms it.
- Nothing more is needed to say "this is the data, that is the chrome."

If a third level ever feels necessary, the design is probably reaching for the wrong axis. Use typography or whitespace instead.

### What gets elevated

Elevated surfaces contain **data**. Base surfaces hold **chrome**.

| Lives on Base | Lives on Elevated |
|---|---|
| Page title, insight strip | Streams, lists, tables |
| Search input | Detail panels with content |
| Action buttons (Filters, Add) | Grouped content blocks |
| Lens chips, filter chips | — |
| Navigation, sidebar | — |

Rule of thumb: if removing it would still leave a functional page (titles, searches, nav), it's chrome — keep it on the base. If removing it would leave nothing to look at, it's data — elevate it.

### Tonal contrast + shadow together

Lift comes from both the **tonal contrast** between the body grey and the card white *and* the **shadow** on the card. Each one alone is weaker:

- Shadow alone on a white-on-white surface reads as a UI accident, not a deliberate layer.
- Tonal contrast alone (white card with no shadow) reads as a sectioning device, not a raised surface.

Together they read as a z-axis shift.

## Typographic ramp

PA's text primitives encode a ramp; importance is expressed by position in the ramp, not by ad-hoc weight/size changes.

| Primitive | Role |
|---|---|
| `Heading` (h1) | Page identity |
| `Heading` (h2, h3) | Section identity |
| `Subtitle` | Supporting context under a heading |
| `Emphasis` | Inline emphasis within body |
| `Body` (default text) | Default content |
| `Caption` | Metadata, secondary info |
| `Muted` | Background info, low priority |

If a piece of text feels like it needs to be bigger/heavier, the question is usually: **is it at the wrong level of the ramp?** Move it up the ramp, don't override the styles.

## Color hierarchy

Color is reserved for two things:

1. **Identity** — `brand` for primary actions only. Not for emphasis, not for highlighting, not for decoration.
2. **State** — `success`, `warning`, `danger` for meaningful states.

Neutrals (`fg-strong`, `fg-normal`, `fg-subtle`, `fg-muted`) carry everything else, including hierarchy of non-state importance.

Color is *not* used to express containment (use depth) or importance (use typography). Doubling up axes muddies the signal.

## Density (informal)

PA has three implicit density modes; they're not formalized but worth naming so we agree when we're choosing:

| Mode | When | Look |
|---|---|---|
| **Read** | Detail pages, modals, focused reading | Spacious. Generous padding, body line-height, one focus per viewport |
| **Scan** | Index streams (People, Notes, Tasks) | Medium. Tight rows, breathing whitespace bands between groups |
| **Browse** | Directories, A–Z lists, search results | Dense. Single-line rows, minimal padding, optimized for vertical scanning |

A page should pick one. Mixing them on the same surface (e.g. a "Read"-style card next to "Browse"-style rows) creates the rhythm jolt that makes pages feel clunky.

## Motion

PA uses minimal motion by principle:

- **State transitions** (hover, focus, open/close) — short, eased, just enough to convey causality.
- **Page transitions** — none. Navigation is instant.
- **Decorative animation** — none.

Formalization is open; the principle is "motion conveys causality, never decoration."

## Decision guide

When deciding how to express something visually:

| Want to express... | Use this axis |
|---|---|
| "This contains the data" | Depth (elevate to card) |
| "This is more important than that" | Typography (move up the ramp) |
| "This is in a particular state (urgent, complete, error)" | Color (semantic intent) |
| "These belong together" | Spatial (proximity, whitespace, alignment) |
| "This changed because of that" | Motion (causal transition) |
| "Scan vs read this page" | Density (pick one mode per page) |

When two axes could express the same thing, **prefer the quieter one**. Color is loud; reserve it. Depth is medium; use it for containment. Typography and whitespace are quiet; lean on them.

## Examples in PA

### Library landing
- Base: page body with title text on `bg-bg-subtle`
- Elevated: domain tiles as `Card` primitives
- Type ramp: `Heading` for "Library", `Subtitle` for description, `Emphasis` for tile titles, `Muted` for tile descriptions
- Density: Read (browsing tiles, one at a time)

### Library / People (index)
- Base: page header (title, insight strip, search, actions) on `bg-bg-subtle`
- Elevated: one `Card` containing the lens chips + person stream
- Type ramp: `Heading` for title, `Subtitle` for insight strip, body for names, `Muted` for relationship/recency
- Density: Scan (rows with breathing whitespace between active/reach-out/quiet bands)

### Modals
- Use the `Modal` primitive's built-in elevation (don't roll your own elevated surface for modal content)

## Related

- [Design Philosophy](design-philosophy.md) — how builders honor the design language (component philosophy, density, accessibility)
- [Design Tokens](design-tokens.md) — the named values that hierarchy uses
- [Component API Design](component-api-design.md) — how primitives encode hierarchy via variants
