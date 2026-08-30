# 07 — Logical properties and RTL readiness

**Effort:** M–L · **Risk:** medium (touches every component's classnames) · **Decision item**

## Problem

There is no RTL support and no use of CSS logical properties anywhere:

```bash
grep -rn "dir=\|rtl\|logical" src/theme src/components   # no matches
```

Every horizontal spacing utility in the library is physical — `ml-*`, `mr-*`,
`pl-*`, `pr-*`, `left-*`, `right-*`, `text-left`, `border-l`, and so on. In an
RTL locale (`dir="rtl"`), all of it stays pinned to the wrong side: icon gaps,
input affordances, dropdown alignment, the Sheet's slide direction, chevron
placement in Select and the pickers.

## The decision

Do this **only if** i18n into RTL locales (Arabic, Hebrew, Farsi, Urdu) is ever
plausibly on the table. If it genuinely is not, close this item — the work is not
free and unused abstraction is its own cost.

But note the asymmetry: converting 42 components' classnames is *cheap now and
miserable later*. Tailwind 4 supports logical utilities natively, so the change
is mostly mechanical, and doing it early means every component authored
afterwards is correct by default. Doing it after another year of components is a
large, risky, entirely-visual diff.

If undecided, a reasonable middle path is **step 1 only** (adopt the logical
utilities as the house style going forward, convert opportunistically) and defer
the rest.

## Approach

### 1. Swap physical utilities for logical ones

Tailwind 4 equivalents:

| Physical | Logical |
| --- | --- |
| `ml-*` / `mr-*` | `ms-*` / `me-*` |
| `pl-*` / `pr-*` | `ps-*` / `pe-*` |
| `left-*` / `right-*` | `start-*` / `end-*` |
| `text-left` / `text-right` | `text-start` / `text-end` |
| `border-l` / `border-r` | `border-s` / `border-e` |
| `rounded-l-*` / `rounded-r-*` | `rounded-s-*` / `rounded-e-*` |

Mostly mechanical, but **not** blindly so. Some physical values are genuinely
physical and must stay: chart axes and gridlines, the code editor's gutter,
anything mirroring a real-world physical direction. Review each rather than
running a global replace.

This will move pixels. Land it **after** `02` (visual regression coverage) so the
baselines catch anything that shifts — this is precisely the change that suite
exists to police. In LTR, correct conversions should produce a **zero-pixel**
diff; any diff at all is a bug in the conversion.

### 2. Fix directional geometry in code

Beyond classnames:
- `src/components/Sheet` — slide-in direction and the `side` prop's semantics
- Floating UI placements (`@floating-ui/react`) in Popover, Tooltip, HoverCard,
  Select, the pickers — `start`/`end` placements are already logical, but any
  hardcoded `left`/`right` placement is not
- Keyboard navigation: `ArrowLeft`/`ArrowRight` in Tabs, ToggleGroup,
  RadioButtonGroup and Calendar must invert under RTL. This is a real
  accessibility requirement, not polish
- Icon direction: chevrons and arrows in Breadcrumb-like affordances, Calendar
  prev/next, Tabs overflow

### 3. Test it

- Storybook: a `direction` global alongside the existing theme global, set via a
  decorator in `.storybook/preview.tsx` in the same shape as
  `withThemeByDataAttribute`
- Visual: extend `src/testing/visual.tsx` with a direction axis, or add a
  `THEMES × DIRECTIONS` matrix. Be deliberate — this doubles the baseline count
  again, so consider RTL baselines for a representative subset rather than
  everything
- Unit: arrow-key inversion tests for the roving-tabindex components

### 4. Document it

`docs/responsive.md` or a new `docs/internationalisation.md`: state that the
system is direction-agnostic, that logical utilities are the house style, and
what a consumer must do (`dir="rtl"` on a container) to get it.

## Acceptance criteria

- [ ] No physical inline-axis utilities remain except deliberately-physical ones, each with a reason
- [ ] LTR visual baselines are **unchanged** by the conversion (zero-pixel diff)
- [ ] Sheet, Floating UI placements, and arrow-key navigation all invert correctly under `dir="rtl"`
- [ ] Storybook has a direction toggle
- [ ] House style recorded in `docs/component-authoring.md`

## Notes

- Commit type: `refactor:` for the classname sweep (patch — it changes shipped
  bytes), `feat:` for actual RTL behaviour.
- If the decision is "not doing this", say so in `docs/` and delete this file.
  A recorded "no" is worth more than an open item nobody revisits.
