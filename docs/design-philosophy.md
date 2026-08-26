# Design Philosophy (Engineering)

This design system aims for a calm, personal, context-rich interface — spacious by default, information-dense when it matters. This doc covers how builders honor that aim as they ship features: the engineering practices that make the design language *real* in code.

The pages should feel less like a SaaS dashboard and more like Things or Linear: quiet, opinionated, warm. The mechanics below are how that shows up in the implementation.

## Component philosophy

The primitives are built around a small set of principles:

- **Orthogonal API.** `variant` × `intent` = predictable, composable. A primary danger button is `<Button variant="solid" intent="danger">`, not a custom `<DangerButton>`. If a component grows three special-case props, the orthogonal axes are wrong — refactor.
- **Polymorphic.** `asChild` pattern for flexibility without wrapper hell.
- **Type-safe.** CVA ensures valid combinations; TypeScript prevents errors at compile time.

The bar: a builder should reach for an existing primitive 90% of the time. If they're hand-rolling, either the primitive's API is incomplete or they're expressing the wrong concept.

## Semantic clarity

Token names describe **meaning**, not appearance.

- `bg-bg-normal`, not `bg-white`
- `fg-subtle`, not `text-gray-500`
- `border-danger-subtle`, not `border-red-200`
- `intent="danger"`, not `color="red"`

When a builder reaches for a raw color or value, that's a signal — either the token doesn't exist yet (add it), or the builder is expressing the wrong concept (rethink).

The reason this matters: appearance-named tokens lock the design to one theme. Semantic tokens survive a redesign.

## Information density

Three modes. A page picks one. Mixing them on the same surface creates rhythm jolt.

| Mode | When | Style |
|---|---|---|
| **Read** | Detail pages, focused viewing | Spacious. One focus per viewport. Generous padding |
| **Scan** | Index streams, dashboards | Medium. Rows with breathing whitespace gaps |
| **Browse** | Directories, search results, A–Z lists | Dense. Single-line rows, minimal padding |

If you find yourself mixing modes on one page, the page probably has two jobs — split it. See [Visual Hierarchy](visual-hierarchy.md#density-informal) for more.

## Context vs consequence

Two display strategies, each with its own trigger:

- **Context (inline).** Information about *what you're looking at*. Relationships, metadata, derived state. Never in tooltips or modals — visible at a glance, on the row, in the page.
- **Consequence (modal/dialog).** Actions that *do* something. Deletion, bulk changes, irreversible operations. The modal creates a natural pause; that pause is the design.

Friction should be proportional to consequence. A delete confirmation modal is appropriate; a "view related items" modal is not.

## Accessibility as elegance

Three baked-in practices:

- **"On-color" tokens.** `fg-on-brand-subtle` exists alongside `bg-brand`. Contrast is guaranteed by the system, not by the builder remembering.
- **Focus states are part of the design.** Every interactive element has a visible focus ring. The keyboard-only path should feel as considered as the mouse path.
- **Keyboard navigation is first-class.** If it works with mouse, it works with keyboard. Tab order matches reading order.

The bar: tab through the page with your eyes closed mentally. If you can navigate to every action and feel where you are, the design is done.

## Distinctive engineering patterns

### Context lines

Items show *why* they matter, not just what they are. Implemented as a small block beneath the main row content:

```tsx
<ItemRow>
  <Title>Send the quarterly proposal</Title>
  <Context>Due today at 2pm</Context>
</ItemRow>
```

Context comes from query-time relationships, not stored fields. The row is a view, not a record.

### Semantic tokens, not utility classes

Avoid `bg-blue-500`, `text-gray-600`, `border-red-200` in component code. Reach for the semantic token. If one doesn't exist, that's a token-system gap to fill, not a reason to escape it.

## Builder decision framework

When implementing UI, ask:

1. **Am I using a primitive or hand-rolling?** Prefer primitives. If the primitive doesn't fit, the API is the bug.
2. **Is my token semantic?** If I'm reaching for a raw value, the token system is incomplete.
3. **Have I picked one density mode for this page?** Mixing them creates jolt.
4. **Have I expressed state via intent, not color?** `intent="danger"` not `bg-red-500`.
5. **Does the focus ring look right?** If you can't tab through and feel good about it, the design isn't done.
6. **Is the right axis carrying the load?** See [Visual Hierarchy](visual-hierarchy.md#decision-guide).

## Settled decisions

Product-level UI decisions that are closed. Skills and reviews enforce these; reopening one is a product decision, not a design preference.

- **Single column, drill-in via routing.** No two-column page layouts. Reach for row encoding and whitespace before any second column; comparison UIs use stacked rows with per-row choices, not side-by-side panes.
- **Ask only real questions.** A surface presents a decision only when the system genuinely cannot make it. Anything derivable (defaults, null-filling, obvious orderings) happens silently and is *summarized*, not asked. The best modal collapses to one confirmation in the common case.
- **Empty states onramp to connecting a service.** Manual entry is the fallback, never the hero — see [States](states.md).
- **No configurable settings unless explicitly requested.** Prefer ambient defaults; configuration is overhead.
- **Irreversible actions get a plain-language consequence line and a danger-intent confirm** that restates verb + noun — see [Modals](modals.md).

## Related

- [Visual Hierarchy](visual-hierarchy.md) — surfaces, elevation, the type ramp, axes
- [Design Tokens](design-tokens.md) — named values
- [Component API Design](component-api-design.md) — how primitives encode meaning via variants
