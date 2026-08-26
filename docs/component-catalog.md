# Component Catalog

Index of all components in `@sixthshift/design-system`. Use this to find the right component for a task and understand its API at a glance.

For design token details (colors, spacing, variants/intents), see [design-tokens.md](design-tokens.md).

---

## Primitives

### Button

**Import:** `@sixthshift/design-system/button`
**Purpose:** Primary interactive element for actions and navigation.

| Prop | Type | Notes |
|------|------|-------|
| `variant` | `"solid" \| "outline" \| "ghost" \| "link"` | Visual treatment (CVA) |
| `intent` | `"neutral" \| "danger" \| "success" \| "warning"` | Semantic meaning (CVA) |
| `size` | `"xs" \| "sm" \| "default" \| "lg" \| "xl" \| "icon"` | Height scale (CVA) |
| `asChild` | `boolean` | Render as child element (Slot pattern) |
| `disabled` | `boolean` | Standard disabled state |

---

### Form Inputs

#### Input

**Import:** `@sixthshift/design-system/input`
**Purpose:** Standard text input with optional icon slots.

| Prop | Type | Notes |
|------|------|-------|
| `iconLeft` | `ReactNode` | Icon rendered inside left edge |
| `iconRight` | `ReactNode` | Icon or button inside right edge |
| `type` | `string` | HTML input type |

Extends `React.InputHTMLAttributes`.

#### Textarea

**Import:** `@sixthshift/design-system/textarea`
**Purpose:** Multi-line text input.

No custom props beyond `React.TextareaHTMLAttributes`. Default `min-h-[60px]`.

#### TagInput

**Import:** `@sixthshift/design-system/tag-input`
**Purpose:** Token field for tags — existing tags as removable chips, type + Enter/comma to add, Backspace to remove the last. Controlled. Used by the create/edit modals.

| Prop | Type | Notes |
|------|------|-------|
| `value` | `string[]` | Current tags (controlled) |
| `onChange` | `(tags: string[]) => void` | Fired on add/remove |
| `placeholder` | `string` | Shown when empty |

#### Select

**Import:** `@sixthshift/design-system/select`
**Purpose:** Single-value dropdown with keyboard navigation, optional search and clear.

| Prop | Type | Notes |
|------|------|-------|
| `options` | `SelectOption<T>[]` | `{ value: T; label: string }` |
| `value` / `defaultValue` | `T` | Controlled/uncontrolled |
| `onChange` | `(value: T) => void` | Selection callback |
| `searchable` | `boolean` | Enables type-to-filter |
| `clearable` | `boolean` | Shows clear button |
| `collapsed` | `boolean` | Abbreviates trigger to first letter |
| `placeholder` | `string` | Default: `"Select..."` |

Generic over string value type (`<T extends string>`).

#### SearchInput

**Import:** `@sixthshift/design-system/search-input`
**Purpose:** Input with search icon and clearable value.

| Prop | Type | Notes |
|------|------|-------|
| `value` | `string` | Controlled value (required) |
| `onChange` | `(value: string) => void` | String callback, not event |
| `onClear` | `() => void` | Optional custom clear handler |

Wraps `Input` internally.

#### Checkbox

**Import:** `@sixthshift/design-system/checkbox`
**Purpose:** Toggle for boolean or indeterminate state.

| Prop | Type | Notes |
|------|------|-------|
| `checked` / `defaultChecked` | `boolean \| "indeterminate"` | Tri-state support |
| `onCheckedChange` | `(checked: boolean) => void` | Callback |
| `label` | `ReactNode` | Inline label with auto `<Label>` wrapping |
| `name` | `string` | Hidden input for form submission |

#### CheckboxGroup

**Import:** `@sixthshift/design-system/checkbox-group`
**Purpose:** Multi-select group of checkboxes.

| Prop | Type | Notes |
|------|------|-------|
| `options` | `CheckboxGroupOption[]` | `{ value, label, disabled? }` |
| `value` / `defaultValue` | `string[]` | Selected values |
| `onChange` | `(value: string[]) => void` | Callback |
| `orientation` | `"vertical" \| "horizontal"` | Layout direction |
| `variant` | `"default" \| "button"` | Checkbox dots or button-style |
| `appearance` | `"segmented" \| "separate"` | Only when `variant="button"` |

#### RadioButton

**Import:** `@sixthshift/design-system/radio-button`
**Purpose:** Single radio option (usually used inside RadioButtonGroup).

| Prop | Type | Notes |
|------|------|-------|
| `checked` | `boolean` | Selection state |
| `onCheckedChange` | `(checked: boolean) => void` | Callback |
| `label` | `ReactNode` | Inline label |

#### RadioButtonGroup

**Import:** `@sixthshift/design-system/radio-button-group`
**Purpose:** Single-select group of radio options.

| Prop | Type | Notes |
|------|------|-------|
| `options` | `RadioButtonGroupOption[]` | `{ value, label, disabled? }` |
| `value` / `defaultValue` | `string` | Selected value |
| `onChange` | `(value: string) => void` | Callback |
| `orientation` | `"vertical" \| "horizontal"` | Layout direction |
| `variant` | `"default" \| "button"` | Radio dots or button-style |
| `appearance` | `"segmented" \| "separate"` | Only when `variant="button"` |

#### Switch

**Import:** `@sixthshift/design-system/switch`
**Purpose:** Boolean toggle with optional pending spinner.

| Prop | Type | Notes |
|------|------|-------|
| `checked` / `defaultChecked` | `boolean` | On/off state |
| `onCheckedChange` | `(checked: boolean) => void` | Callback |
| `pending` | `boolean` | Shows spinner in thumb, blocks interaction |
| `label` | `ReactNode` | Inline label |

#### Toggle

**Import:** `@sixthshift/design-system/toggle`
**Purpose:** Button that toggles between pressed/unpressed states.

| Prop | Type | Notes |
|------|------|-------|
| `pressed` / `defaultPressed` | `boolean` | Toggle state |
| `onPressedChange` | `(pressed: boolean) => void` | Callback |
| `variant` | `"solid" \| "outline" \| "ghost" \| "link"` | Inherits Button variants (CVA) |
| `intent` | `"neutral" \| "danger" \| "success" \| "warning"` | Inherits Button intents (CVA) |
| `size` | Button size scale | Inherits Button sizes (CVA) |

#### ToggleGroup

**Import:** `@sixthshift/design-system/toggle-group`
**Purpose:** Group of toggles for single or multi-select.

| Prop | Type | Notes |
|------|------|-------|
| `type` | `"single" \| "multiple"` | Discriminated union |
| `options` | `ToggleGroupOption[]` | `{ value, label, ariaLabel?, disabled? }` |
| `value` / `defaultValue` | `string \| string[]` | Depends on `type` |
| `onValueChange` | `(value) => void` | Depends on `type` |
| `appearance` | `"segmented" \| "separate"` | Visual grouping |
| `variant` | `"solid" \| "outline" \| "ghost"` | No `"link"` |

---

### Date/Time Pickers

Every date/time component accepts and emits **canonical ISO 8601 strings**, never
Temporal objects. Adopting a date picker does not mean adopting a date library.

| Type | Shape | Example |
|------|-------|---------|
| `ISODate` | `YYYY-MM-DD` | `"2026-08-26"` |
| `ISOTime` | `HH:MM` or `HH:MM:SS` in, `HH:MM:SS` out | `"09:30"` |
| `ISOInstant` | `YYYY-MM-DDTHH:MM:SSZ`, always UTC | `"2026-08-26T00:30:00Z"` |
| `ISODateRange` | `{ from?: ISODate, to?: ISODate }` | |
| `ISOInstantRange` | `{ from?: ISOInstant, to?: ISOInstant }` | |

Input is normalised on entry: `"09:30"` and `"09:30:00"` are both valid times, and
an instant written with a numeric offset (`"2026-08-26T10:30:00+10:00"`) is
converted to the `Z` form. **Callbacks always emit the canonical form**, so a value
that round-trips through a component comes back in exactly one shape.

Types come from `@sixthshift/design-system/date-time`, and are also re-exported
from each picker's own subpath for convenience.

#### Disabling dates

`disabled` (and `disabledDates` on the datetime pickers) takes any of:

| Form | Meaning |
|------|---------|
| `"2026-08-26"` | one date |
| `["2026-08-26", "2026-08-27"]` | several dates |
| `{ before: "2026-01-01" }` | everything earlier |
| `{ after: "2026-12-31" }` | everything later |
| `{ from: "2026-08-01", to: "2026-08-07" }` | an inclusive span |
| `{ dayOfWeek: ["sat", "sun"] }` | by weekday name |
| `(date: ISODate) => boolean` | anything else |

The declarative forms exist so the predicate is rarely needed — it receives an ISO
string, so answering "is this a weekend?" inside one would otherwise require date
arithmetic. `dayOfWeek` uses names rather than numbers because `weekStartsOn`
counts from 0 = Sunday while ISO-8601 day numbers start at 1 = Monday.

#### Computing dates without Temporal

`@sixthshift/design-system/date-time` carries ISO-native helpers for the
arithmetic `presets` and `disabled` values usually need:

```ts
import { addDaysISO, isWeekendISO, startOfMonthISO, todayISO } from "@sixthshift/design-system/date-time";

const presets = [
  { label: "Last 7 days", value: { from: addDaysISO(todayISO(), -6), to: todayISO() } },
  { label: "This month",  value: { from: startOfMonthISO(todayISO()), to: todayISO() } },
];
```

Also available: `addMonthsISO`, `addMinutesISO`, `addHoursISO`, `endOfMonthISO`,
`startOfWeekISO` / `endOfWeekISO`, `startOfYearISO` / `endOfYearISO`,
`weekdayISO`, `compareISO`, and the `isDateString` / `isTimeString` /
`isInstantString` guards for validating values that arrive from an API.

For arithmetic beyond that — quarters, timezone-aware boundaries — widen to
Temporal with `fromISODate` / `fromISOInstant`, compute, and narrow back with
`toISODate` / `toISOInstant`. That is the intended escape hatch, not a workaround.

#### Calendar

**Import:** `@sixthshift/design-system/calendar`
**Purpose:** Inline calendar grid for date selection (used internally by DatePicker).

| Prop | Type | Notes |
|------|------|-------|
| `mode` | `"single" \| "range" \| "multiple"` | Selection mode |
| `value` | `ISODate \| ISODateRange \| ISODate[]` | Depends on mode |
| `onSelect` | `(value) => void` | Depends on mode |
| `month` / `onMonthChange` | `ISODate` | Controlled month navigation; the day is ignored |
| `minDate` / `maxDate` | `ISODate` | Date bounds, inclusive |
| `disabled` | `DisabledDates \| DisabledDates[]` | See [Disabling dates](#disabling-dates) |
| `presets` | `PresetOption[]` | Sidebar of quick picks |
| `weekStartsOn` | `0-6` | Week start day |
| `showFooter` | `boolean` | Today/Cancel/Apply buttons |

#### DatePicker

**Import:** `@sixthshift/design-system/date-picker`
**Purpose:** Input trigger + Calendar popover for picking dates.

| Prop | Type | Notes |
|------|------|-------|
| `mode` | `"single" \| "range" \| "multiple"` | Selection mode |
| `value` / `defaultValue` | `ISODate \| ISODateRange \| ISODate[]` | Depends on mode |
| `onChange` | `(value) => void` | Depends on mode |
| `minDate` / `maxDate` | `ISODate` | Date bounds, inclusive |
| `disabled` | `DisabledDates \| DisabledDates[]` | See [Disabling dates](#disabling-dates) |
| `presets` | `PresetOption[]` | Quick-pick sidebar |
| `clearable` | `boolean` | Default: `true` |
| `placeholder` | `string` | Default: `"Select date"` |
| `align` | `"start" \| "end"` | Popover alignment |

#### TimePicker

**Import:** `@sixthshift/design-system/time-picker`
**Purpose:** Input trigger + scrollable hour/minute/second columns for picking time.

| Prop | Type | Notes |
|------|------|-------|
| `value` / `defaultValue` | `ISOTime` | `"09:30"` or `"09:30:00"` |
| `onChange` | `(value: ISOTime \| undefined) => void` | Always emits `HH:MM:SS` |
| `clockFormat` | `"12h" \| "24h"` | Clock display format |
| `format` | `"HH:mm" \| "HH:mm:ss"` | Include seconds column |
| `minuteStep` | `number` | Minute increment (default: 1) |
| `minTime` / `maxTime` | `ISOTime` | Time bounds, inclusive |
| `presets` | `TimePresetOption[]` | Quick-pick sidebar |

#### DateTimePicker

**Import:** `@sixthshift/design-system/datetime-picker`
**Purpose:** Combined date + time picker. The value is an absolute instant, edited
in the viewer's local timezone and exchanged in UTC.

| Prop | Type | Notes |
|------|------|-------|
| `value` / `defaultValue` | `ISOInstant` | Combined date+time, UTC |
| `onChange` | `(value: ISOInstant \| undefined) => void` | Always emits the `Z` form |
| `clockFormat` | `"12h" \| "24h"` | Clock display |
| `showSeconds` | `boolean` | Include seconds |
| `minDate` / `maxDate` | `ISODate` | Date bounds, inclusive |
| `minTime` / `maxTime` | `ISOTime` | Time bounds, inclusive |
| `disabledDates` | `DisabledDates \| DisabledDates[]` | See [Disabling dates](#disabling-dates) |
| `clearable` | `boolean` | Default: `true` |

#### DateTimeRangePicker

**Import:** `@sixthshift/design-system/datetime-range-picker`
**Purpose:** Start/end datetime picker for ranges. Both ends are absolute instants
in UTC.

| Prop | Type | Notes |
|------|------|-------|
| `value` / `defaultValue` | `ISOInstantRange` | `{ from?: ISOInstant, to?: ISOInstant }`; `DateTimeRangeValue` is an alias |
| `onChange` | `(value: ISOInstantRange \| undefined) => void` | Always emits the `Z` form |
| `minDate` / `maxDate` | `ISODate` | Date bounds, inclusive |
| `minTime` / `maxTime` | `ISOTime` | Time bounds, inclusive |
| `disabledDates` | `DisabledDates \| DisabledDates[]` | See [Disabling dates](#disabling-dates) |
| `clockFormat` | `"12h" \| "24h"` | Clock display |
| `showSeconds` | `boolean` | Include seconds |
| `presets` | `DateTimeRangePresetOption[]` | Quick-pick sidebar |

---

### Overlays

#### Modal

**Import:** `@sixthshift/design-system/modal`
**Purpose:** Centered dialog with backdrop overlay. Compound component.

| Prop | Type | Notes |
|------|------|-------|
| `onClose` | `(event) => void` | Close handler |
| `size` | `"sm" \| "md" \| "lg" \| "full"` | Width on desktop |
| `dismissable` | `boolean` | Click-outside closes (default: `true`) |
| `closable` | `boolean` | Show X button in header |
| `align` | `"center" \| "top"` | Vertical position on desktop |

**Sub-components:** `Modal.Header`, `Modal.Body`, `Modal.Footer`

Mobile: slides up from bottom. Desktop: centered overlay. Enter/exit animations included.

#### Sheet

**Import:** `@sixthshift/design-system/sheet`
**Purpose:** Side panel that slides in from an edge. Compound component.

| Prop | Type | Notes |
|------|------|-------|
| `open` / `onOpenChange` | `boolean` / `(open) => void` | Controlled open state |
| `side` | `"right" \| "left"` | Slide-in edge |
| `size` | `"sm" \| "md" \| "lg"` | Width on desktop |
| `dismissable` | `boolean` | Esc closes (default: `true`) |
| `dismissOnOutsidePress` | `boolean` | Default: `false` |
| `closable` | `boolean` | Show X button |

**Sub-components:** `Sheet.Header`, `Sheet.Body`, `Sheet.Footer`

#### Popover

**Import:** `@sixthshift/design-system/popover`
**Purpose:** Click-triggered floating content panel. Compound component.

| Prop | Type | Notes |
|------|------|-------|
| `open` / `onOpenChange` | `boolean` / `(open) => void` | Controlled state |
| `defaultOpen` | `boolean` | Uncontrolled default |
| `placement` | Floating UI `Placement` | Position relative to trigger |
| `offsetPx` | `number` | Gap from trigger (default: 8) |

**Sub-components:** `Popover.Trigger`, `Popover.Body`, `Popover.Close`

#### Tooltip

**Import:** `@sixthshift/design-system/tooltip`
**Purpose:** Hover-triggered informational popup. Compound component.

| Prop | Type | Notes |
|------|------|-------|
| `placement` | Floating UI `Placement` | Position (default: `"top"`) |
| `delayShow` | `number` | Ms before showing (default: 300) |
| `delayHide` | `number` | Ms before hiding (default: 0) |
| `offsetPx` | `number` | Gap from trigger (default: 8) |

**Sub-components:** `Tooltip.Trigger`, `Tooltip.Body`

#### Toast

**Import:** `@sixthshift/design-system/toast`
**Purpose:** Temporary notification with optional action button.

| Prop | Type | Notes |
|------|------|-------|
| `intent` | `"neutral" \| "success" \| "warning" \| "danger"` | Semantic color (CVA via Message) |
| `title` | `string` | Bold heading line |
| `action` | `string` | Action button label |
| `onAction` | `() => void` | Action callback |
| `onClose` | `() => void` | Dismiss callback |
| `standalone` | `boolean` | Self-positions in portal (default: `true`) |

Built on top of `Message`. Enter/exit animations included.

---

### Data Display

#### Badge

**Import:** `@sixthshift/design-system/badge`
**Purpose:** Small label for status, category, or count.

| Prop | Type | Notes |
|------|------|-------|
| `variant` | `"solid" \| "soft" \| "outline"` | Visual treatment (CVA) |
| `intent` | `"neutral" \| "primary" \| "danger" \| "success" \| "warning" \| "muted"` | Semantic color (CVA) |

#### TagChip

**Import:** `@sixthshift/design-system/tag-chip`
**Purpose:** One tag, rendered prettily (`project:x` → "project: x"). Pure presentation — the web `TagRef` resolves `person:` tags to a name chip before they reach here (never a raw id).

| Prop | Type | Notes |
|------|------|-------|
| `tag` | `string` | The tag string |
| `onRemove` | `() => void` | When set, renders an × (removable mode); omit for navigable chips |
| `size` | `"sm" \| "default"` | Row vs detail sizing |

#### Avatar

**Import:** `@sixthshift/design-system/avatar`
**Purpose:** Circular container for user images with fallback initials.

**Sub-components:**
- `Avatar` -- container (default 40x40)
- `AvatarImage` -- `<img>` that fills the avatar
- `AvatarFallback` -- centered text/initials shown when no image

No variant props. Style via `className`.

#### Card

**Import:** `@sixthshift/design-system/card`
**Purpose:** Bordered container with optional header. Becomes interactive when `onClick` is provided.

| Prop | Type | Notes |
|------|------|-------|
| `title` | `ReactNode` | Optional header title |
| `headerAction` | `ReactNode` | Element in header right side |
| `onClick` | `(event) => void` | Makes card clickable with hover/focus states |

#### Breadcrumb

**Import:** `@sixthshift/design-system/breadcrumb`
**Purpose:** Navigation trail showing hierarchy path.

| Prop | Type | Notes |
|------|------|-------|
| `items` | `BreadcrumbItem[]` | `{ label: ReactNode, href?: string }` |

Uses `ComponentsContext` for link rendering (router integration).

#### ColorDot

**Import:** `@sixthshift/design-system/color-dot`
**Purpose:** Small colored circle for status or category indicators.

| Prop | Type | Notes |
|------|------|-------|
| `color` | `string` | Intent name (`"brand"`, `"success"`, etc.) or CSS color |
| `size` | `"sm" \| "md" \| "lg"` | Dot diameter (CVA) |
| `pulse` | `boolean` | Animated pulse effect (CVA) |

#### StatsCard

**Import:** `@sixthshift/design-system/stats-card`
**Purpose:** Card with title, description, status border, and metric content area.

| Prop | Type | Notes |
|------|------|-------|
| `title` | `string` | Card heading |
| `description` | `string` | Subtitle text |
| `icon` | `ReactNode` | Header icon |
| `status` | `"healthy" \| "warning" \| "error" \| "neutral"` | Left border color |

#### MetricList

**Import:** `@sixthshift/design-system/metric-list`
**Purpose:** Vertical stack container for metric rows.

Children-only API. Wrap metric items as children.

#### Pagination

**Import:** `@sixthshift/design-system/pagination`
**Purpose:** Page navigation with rows-per-page selector and prev/next buttons.

| Prop | Type | Notes |
|------|------|-------|
| `page` | `number` | Current page (0-based) |
| `pageSize` | `number` | Items per page |
| `total` | `number` | Total item count |
| `onPageChange` | `(page: number) => void` | Page navigation |
| `onPageSizeChange` | `(size: number) => void` | Page size change |
| `pageSizeOptions` | `number[]` | Default: `[10, 25, 50, 100]` |

#### Separator

**Import:** `@sixthshift/design-system/separator`
**Purpose:** Horizontal or vertical divider line.

| Prop | Type | Notes |
|------|------|-------|
| `orientation` | `"horizontal" \| "vertical"` | Default: `"horizontal"` |
| `decorative` | `boolean` | When `false`, adds `role="separator"` |

#### Skeleton

**Import:** `@sixthshift/design-system/skeleton`
**Purpose:** Pulsing placeholder for loading states.

No custom props. Apply dimensions via `className` (e.g., `className="h-4 w-32"`).

#### Spinner

**Import:** `@sixthshift/design-system/spinner`
**Purpose:** Animated loading indicator.

| Prop | Type | Notes |
|------|------|-------|
| `size` | `"sm" \| "default" \| "lg" \| "xl"` | Diameter (CVA) |

---

### Typography

All typography components extend `TextProps` (`{ as?: TextElement, className?, ...HTMLAttributes }`).

The base `Text` component is a polymorphic wrapper. The named typography components below are semantic presets that apply specific size, weight, and color defaults.

| Component | Import | Default Styles | Default Element |
|-----------|--------|---------------|----------------|
| `Text` | `@sixthshift/design-system/text` | None (raw polymorphic wrapper) | `<span>` |
| `TextInline` | `@sixthshift/design-system/text-inline` | Inline flex with gap/align variants (CVA) | `<span>` |
| `Heading` | `@sixthshift/design-system/heading` | Semibold, tracking-tight, size by level (`h1`=4xl..`h6`=base) | `<h2>` |
| `Display` | `@sixthshift/design-system/display` | Bold, 3xl | `<span>` |
| `Subtitle` | `@sixthshift/design-system/subtitle` | Subtle color | `<span>` |
| `Lead` | `@sixthshift/design-system/lead` | Subtle, lg, relaxed leading | `<p>` |
| `Body` | `@sixthshift/design-system/body` | Normal color, sm | `<p>` |
| `Caption` | `@sixthshift/design-system/caption` | Subtle, xs | `<span>` |
| `Muted` | `@sixthshift/design-system/muted` | Subtle, sm | `<span>` |
| `Emphasis` | `@sixthshift/design-system/emphasis` | Medium weight, sm | `<span>` |
| `Label` | `@sixthshift/design-system/label` | Medium weight, sm | `<label>` |
| `SectionTitle` | `@sixthshift/design-system/section-title` | Subtle, sm, uppercase, wide tracking | `<span>` |
| `Code` | `@sixthshift/design-system/code` | Mono font, subtle bg, sm | `<code>` |
| `Mono` | `@sixthshift/design-system/mono` | Mono font, subtle, sm | `<span>` |
| `Timestamp` | `@sixthshift/design-system/timestamp` | Mono font, subtle, xs | `<span>` |

#### TextInline (CVA)

**Import:** `@sixthshift/design-system/text-inline`
**Purpose:** Inline flex container for text + icon combos with controlled gap and alignment.

| Prop | Type | Notes |
|------|------|-------|
| `gap` | `"none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl"` | Gap between children (CVA) |
| `align` | `"start" \| "center" \| "end" \| "baseline"` | Cross-axis alignment (CVA) |

#### Markdown

**Import:** `@sixthshift/design-system/markdown`
**Purpose:** Renders a markdown string to styled HTML using PA typography components.

| Prop | Type | Notes |
|------|------|-------|
| `children` | `string` | Raw markdown content |

Uses `react-markdown` internally. Maps headings to `Heading`/`Emphasis`, paragraphs to `Body`.

---

### Charts

All chart components are SVG-based with no external charting library.

#### LineChart

**Import:** `@sixthshift/design-system/line-chart`
**Purpose:** Multi-series line chart with grid, axes, tooltips, and area fill.

| Prop | Type | Notes |
|------|------|-------|
| `series` | `LineChartSeries[]` | `{ data: { label, value }[], name?, color? }` |
| `height` | `number` | SVG height (default: 200) |
| `interpolation` | `"linear" \| "monotone" \| "stepBefore" \| "stepAfter"` | Curve type |
| `fillArea` | `boolean` | Fill under the line |
| `showGrid` / `showAxes` / `showDots` / `showLabels` / `showValues` | `boolean` | Toggle visual elements |
| `showTooltip` | `boolean` | Hover tooltips (uses `Tooltip` component) |
| `yMin` / `yMax` / `yTicks` | `number` | Axis scale control |
| `formatValue` | `(value: number) => string` | Value formatter |

#### BarChart

**Import:** `@sixthshift/design-system/bar-chart`
**Purpose:** Horizontal bar chart for comparing values.

| Prop | Type | Notes |
|------|------|-------|
| `data` | `BarChartItem[]` | `{ label, value, color? }` |
| `showValues` | `boolean` | Show value text (default: `true`) |
| `maxValue` | `number` | Scale ceiling (auto-detected if omitted) |
| `barHeight` | `number` | Pixel height per bar (default: 24) |
| `formatValue` | `(value: number) => string` | Value formatter |

#### Sparkline

**Import:** `@sixthshift/design-system/sparkline`
**Purpose:** Compact inline trend line for embedding in tables or cards.

| Prop | Type | Notes |
|------|------|-------|
| `data` | `number[]` | Data points (min 2) |
| `width` / `height` | `number` | SVG dimensions (default: 80x24) |
| `color` | `string` | Line color (default: `var(--fg-brand)`) |
| `fillArea` | `boolean` | Fill under curve |
| `interpolation` | `Interpolation` | Curve type (default: `"monotone"`) |

#### HeatMapCalendar

**Import:** `@sixthshift/design-system/heat-map`
**Purpose:** GitHub-style contribution calendar heatmap.

| Prop | Type | Notes |
|------|------|-------|
| `data` | `HeatMapCell[]` | `{ date: string, value: number }` (ISO dates) |
| `colorScale` | `string[]` | Color stops from low to high |
| `cellSize` / `cellGap` | `number` | Grid dimensions |
| `formatTooltip` | `(cell: HeatMapCell) => string` | Tooltip formatter |

#### HeatMapMatrix

**Import:** `@sixthshift/design-system/heat-map`
**Purpose:** Simple matrix heatmap with day-of-week rows and week columns.

| Prop | Type | Notes |
|------|------|-------|
| `data` | `HeatMapCell[]` | Same as HeatMapCalendar |
| `colorScale` | `string[]` | Color stops |
| `showDayLabels` | `boolean` | Show Mon/Tue/etc labels |
| `cellSize` / `cellGap` | `number` | Grid dimensions |

---

### Layout & Feedback

#### EmptyState

**Import:** `@sixthshift/design-system/empty-state`
**Purpose:** Centered placeholder for lists/pages with no data.

| Prop | Type | Notes |
|------|------|-------|
| `icon` | `ReactNode` | Optional icon |
| `message` | `string` | Main message text |
| `description` | `string` | Supporting detail |
| `action` | `ReactNode` | CTA button or link |

#### Message

**Import:** `@sixthshift/design-system/message`
**Purpose:** Alert-style banner for feedback (info, success, warning, error).

| Prop | Type | Notes |
|------|------|-------|
| `intent` | `"neutral" \| "success" \| "warning" \| "danger"` | Color/meaning (CVA) |
| `size` | `"default" \| "sm"` | Padding scale (CVA) |
| `title` | `ReactNode` | Simple API: bold heading |
| `icon` | `ReactNode` | Simple API: left icon |

Also supports compound children: `Message.Icon`, `Message.Body`, `Message.Title`, `Message.Description`.

#### Tabs

**Import:** `@sixthshift/design-system/tabs`
**Purpose:** Tab navigation with content panels. Compound component.

| Prop | Type | Notes |
|------|------|-------|
| `items` | `TabItem[]` | `{ value, label, disabled?, content }` |
| `value` / `defaultValue` | `string` | Controlled/uncontrolled selected tab |
| `onValueChange` | `(value: string) => void` | Selection callback |

**Sub-components:** `Tabs.List`, `Tabs.Panels`

---

## Composites

### FormField

**Import:** `@sixthshift/design-system/form-field`
**Purpose:** Wraps a form input with label, description, and validation feedback.

| Prop | Type | Notes |
|------|------|-------|
| `label` | `string` | Field label |
| `description` | `string` | Help text below label |
| `feedback` | `{ message, intent }` | Validation message |
| `required` | `boolean` | Shows red asterisk |

Auto-generates `id` and wires `aria-describedby`/`aria-invalid` onto the child input.

### NavSide

**Import:** `@sixthshift/design-system/nav-side`
**Purpose:** Vertical sidebar navigation with sections, icons, and expand/collapse.

| Prop | Type | Notes |
|------|------|-------|
| `sections` | `NavSection[]` | `{ id, items: NavItem[] }` |
| `expanded` | `boolean` | Show labels or icon-only (default: `true`) |
| `isActive` | `(item: NavItem) => boolean` | Active state callback |
| `renderLink` | `RenderLinkFn` | Router integration |

### NavBottom

**Import:** `@sixthshift/design-system/nav-bottom`
**Purpose:** Mobile bottom tab bar navigation.

| Prop | Type | Notes |
|------|------|-------|
| `sections` | `NavSection[]` | Same sections as NavSide |
| `isActive` | `(item: NavItem) => boolean` | Active state callback |
| `maxItems` | `number` | Max visible items (default: 5) |
| `renderLink` | `RenderLinkFn` | Router integration |

### ProgressBar

**Import:** `@sixthshift/design-system/progress-bar`
**Purpose:** Horizontal completion bar with optional fraction text.

| Prop | Type | Notes |
|------|------|-------|
| `completed` | `number` | Completed count |
| `total` | `number` | Total count |
| `showFraction` | `boolean` | Show "3/10" text (default: `true`) |

### Code Editor

**Import:** `@sixthshift/design-system/code-editor`
**Purpose:** Monaco-based code editor with TypeScript support, semantic tokens, and PA theme.

| Prop | Type | Notes |
|------|------|-------|
| `value` | `string` | Editor content |
| `onChange` | `(value: string) => void` | Content change callback |
| `onValidate` | `(errors: ValidationError[]) => void` | TypeScript error callback |
| `readOnly` | `boolean` | Prevent editing |
| `typeDefinitions` | `string` | Custom type declarations for IntelliSense |

### Code Editor Workspace

**Import:** `@sixthshift/design-system/code-editor-workspace`
**Purpose:** Full editor workspace with toolbar, validation status, and status bar.

| Prop | Type | Notes |
|------|------|-------|
| `value` / `onChange` | `string` / `(value) => void` | Core editor props |
| `toolbar` | `{ actions?, primaryAction?, leftContent?, rightContent? }` | Toolbar config |
| `statusBar` | `{ items?, leftContent?, rightContent? }` | Status bar config |

**Sub-exports:** `Workspace`, `Toolbar`, `StatusBar`

---

## Infrastructure

### Hooks

**Import:** `@sixthshift/design-system/hooks`

| Hook | Purpose |
|------|---------|
| `useControllableState` | Controlled/uncontrolled state pattern |
| `usePresence` | Enter/exit animation lifecycle |
| `useTheme` | Current theme (light/dark) and toggle |
| `useDeviceFormFactor` | Responsive breakpoint detection |
| `useDebouncedState` | State that debounces updates |
| `useDebouncedCallback` | Callback that debounces invocations |
| `useLocalStorage` | Persistent state in localStorage |
| `useCollapsible` | Expand/collapse with animation |
| `useStack` | Stack data structure for overlays |

### Contexts

| Context | Import | Purpose |
|---------|--------|---------|
| `OverlayContext` | `@sixthshift/design-system/overlay` | Modal/toast/sheet stack management |
| `ComponentsContext` | `@sixthshift/design-system/components` | Inject router `Link` component |

### Utilities

| Export | Import | Purpose |
|--------|--------|---------|
| `cn()` | `@sixthshift/design-system/utils` | Tailwind class merging (`clsx` + `tailwind-merge`) |
| Format helpers | `@sixthshift/design-system/format` | Number/date formatting utilities |
| `ErrorBoundary` | `@sixthshift/design-system/error-boundary` | React error boundary wrapper |
| `withSuspense` | `@sixthshift/design-system/with-suspense` | HOC for Suspense wrapping |
| `withErrorBoundary` | `@sixthshift/design-system/with-error-boundary` | HOC for error boundary wrapping |
| `withSuspenseAndErrorBoundary` | `@sixthshift/design-system/with-suspense-and-error-boundary` | Combined HOC |
| `EmptyBoundary` / `withEmpty` | `@sixthshift/design-system/empty-boundary` / `@sixthshift/design-system/with-empty` | Empty state boundary |
