# Responsive Design

How PA handles different viewport sizes. Breakpoints, when to collapse, when to stack.

PA has a small set of breakpoints, a top-level form-factor hook, and a strong preference for **layout-level adaptation** over component-level media queries.

## Breakpoints

PA recognizes three form factors, defined in `src/hooks/useDeviceFormFactor.ts`:

| Form factor | Width | Tailwind prefix |
|---|---|---|
| **Mobile** | 0–639px | (default, no prefix) |
| **Tablet** | 640–1023px | `sm:` |
| **Desktop** | 1024px+ | `lg:` |

`md:` and `xl:` exist in Tailwind but aren't part of PA's adaptive vocabulary. If you find yourself reaching for one, the rule is probably wrong at the form-factor level.

## Layout-level vs component-level

PA prefers **layout-level adaptation** — the top-level layout swaps based on form factor — over component-level media queries.

### Layout-level (preferred)

The `AppLayout` (`packages/web/src/layouts/AppLayout/AppLayout.tsx`) picks one of three sibling layouts at runtime:

```tsx
const formFactor = useDeviceFormFactor();
if (formFactor === "mobile") return <AppLayoutMobile />;
if (formFactor === "tablet") return <AppLayoutTablet />;
return <AppLayoutDesktop />;
```

This means **chrome** (sidebar, header, navigation) is form-factor-specific by design — not by media query.

### Component-level (sparingly)

Inside a component, media queries via Tailwind prefixes (`sm:`, `lg:`) handle small visual tweaks: hiding a secondary label, switching from horizontal to vertical layout, adjusting padding.

Rule of thumb: if the component looks meaningfully different on mobile vs desktop, it should *be* a different component (or accept a `formFactor` prop). If it's a small adjustment, use a media query.

## Mobile patterns

### Header degradation

Index page headers need to handle narrow widths gracefully. Options, in order of preference:

1. **Hide secondary actions.** "Filters" can become an icon-only button; "Add Person" can stay labeled (it's primary).
2. **Stack the actions.** Action buttons drop below the title.
3. **Wrap the insight strip.** A long strip "18 people · 8 active this week · 7 to reach out" can collapse to just the total on mobile.

The People page currently does *none* of these well — its header overflows on mobile. This is a known regression to be fixed when responsive treatment lands.

### Row content

Rows should hide non-essential metadata on mobile. Pattern:

```tsx
{person.relationship && (
  <span className="hidden shrink-0 text-fg-subtle text-xs capitalize sm:inline">
    {person.relationship}
  </span>
)}
```

The relationship label disappears on mobile; name + signal remain. This is the right kind of media-query use — small visual adjustment, not a layout rebuild.

### Navigation

Mobile uses a bottom nav (in `AppLayoutMobile`), not the sidebar. This is layout-level — the sidebar component doesn't exist on mobile.

## Tablet patterns

Tablet is the awkward middle. PA's approach:

- **Sidebar** collapses to icon-only (no labels).
- **Content** uses the full available width up to `max-w-3xl`, which fits comfortably at 768px.
- **Multi-column grids** drop one column (e.g., `sm:grid-cols-2 lg:grid-cols-4` → tablet shows 2 columns).

## Desktop patterns

- Full sidebar with labels.
- Content centered at `max-w-3xl` (or wider for some surfaces — TBD).
- All affordances visible (no progressive disclosure required by viewport).

## Anti-patterns

- **Reaching for `xl:` / `2xl:`** — PA doesn't have a four-tier responsive system. Pick one of mobile/tablet/desktop.
- **Hiding the primary action on mobile.** Secondary actions can collapse; the primary must remain reachable.
- **Component-level media queries that change the layout shape.** If a component fundamentally restructures by viewport, it should be split into per-form-factor components or accept the form factor as a prop.
- **Pixel-pixel breakpoints.** Don't write `min-width: 768px` directly — use the Tailwind prefix `sm:` so it maps to a known form factor.

## Open questions

- **Wide-screen utilization.** `max-w-3xl` centered on a 1440px viewport wastes ~50% of horizontal space. PA hasn't decided whether to widen on larger screens or to commit to narrow-centered as the look.
- **Print styles.** Not yet considered.
- **Foldables / aspect-ratio edge cases.** Not yet considered.

## Related

- `src/hooks/useDeviceFormFactor.ts` — the form factor hook
- `packages/web/src/layouts/AppLayout/` — the top-level adaptive layout
- [Spacing](spacing.md) — gap conventions that survive form-factor changes
