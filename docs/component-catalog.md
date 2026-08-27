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
**Purpose:** A typeable date field + Calendar popover, as one control.

| Prop | Type | Notes |
|------|------|-------|
| `mode` | `"single" \| "range" \| "multiple"` | Selection mode |
| `value` / `defaultValue` | `ISODate \| ISODateRange \| ISODate[]` | Depends on mode |
| `onChange` | `(value) => void` | Depends on mode. Never fires a partial date; fires `undefined` when a segment is cleared |
| `segmentOrder` | `"mdy" \| "dmy" \| "ymd"` | `single` mode only. Default `mdy`. Never inferred from the locale |
| `minDate` / `maxDate` | `ISODate` | Date bounds, inclusive |
| `disabled` | `DisabledDates \| DisabledDates[]` | See [Disabling dates](#disabling-dates) |
| `presets` | `PresetOption[]` | Quick-pick sidebar |
| `clearable` | `boolean` | Default: `true` |
| `placeholder` | `string` | `range` / `multiple` only — the segmented field shows `mm/dd/yyyy` instead |
| `align` | `"start" \| "end"` | Popover alignment |

In `single` mode the trigger is three `role="spinbutton"` segments, not a text
box, and it is built to be typed straight through: `152026` is January the 5th
2026, because a digit that cannot extend the segment being typed rolls into the
next one rather than restarting it. Separators (`/`, `-`, `.`) advance a segment,
arrows step it, `Backspace` takes back one digit (then clears it, then steps
back), `Alt+ArrowDown` opens the grid and moves focus there, and a paste fills
all three (ISO always, otherwise the configured order). `range` and `multiple`
keep their own triggers: `range` renders the two ends as two separate segmented
fields (see below), and `multiple` keeps a read-only text trigger, since a list
of dates has no sensible typed form.

**Range mode** renders `Start date` and `End date` as two independent fields,
each typed and cleared on its own, sharing one popover that anchors to whichever
half is being edited. Clearing the last remaining end reports `undefined` rather
than a range with two empty ends.

`onChange` is held while a number is still being typed — a year arrives one digit
at a time, and `2` is the start of 2026, not the year 2 — and flushed when the
field loses focus.

Typing and picking move one value: the segments show the popover's draft while
it is open and the committed value while it is closed, so typing moves the grid
and picking a day shows in the segments. `Enter` in a segment is Apply.

#### TimePicker

**Import:** `@sixthshift/design-system/time-picker`
**Purpose:** A typeable time field + scrollable hour/minute/second columns.

| Prop | Type | Notes |
|------|------|-------|
| `value` / `defaultValue` | `ISOTime` | `"09:30"` or `"09:30:00"` |
| `onChange` | `(value: ISOTime \| undefined) => void` | Always emits `HH:MM:SS` |
| `clockFormat` | `"12h" \| "24h"` | Clock display format |
| `format` | `"HH:mm" \| "HH:mm:ss"` | Include seconds column |
| `minuteStep` | `number` | Minute increment (default: 1) |
| `minTime` / `maxTime` | `ISOTime` | Time bounds, inclusive |
| `presets` | `TimePresetOption[]` | Quick-pick sidebar |

The trigger is spinbutton segments: `0230p` is half past two in the afternoon,
`345` in a 24-hour field is 03:45 (there is no 30th hour, so the digit rolls
into the minute), `a`/`p` set the meridiem, and `Alt+ArrowDown` opens the columns
on the hour. `minuteStep` sets the column increment and does **not** constrain
typing. A typed time outside `minTime`/`maxTime` is flagged (`aria-invalid` and
the danger border) and still reported, so the caller's own validation sees it.

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
| `segmentOrder` | `"mdy" \| "dmy" \| "ymd"` | Order of the date half. Default `mdy` |
| `clearable` | `boolean` | Default: `true` |

One field carries both halves, so the digits roll straight from the year into the
hour: `1520260330p` is January 5th 2026 at 3:30pm, typed without a tab.

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
| `segmentOrder` | `"mdy" \| "dmy" \| "ymd"` | Order of each date half. Default `mdy` |

Two typeable fields, one per end — each a full date-and-time, each with its own
clear button, sharing one popover that anchors to whichever half is being edited.
Clearing the last remaining end reports `undefined`.

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
**Purpose:** One tag, rendered prettily (`project:x` → "project: x"). Pure presentation — a consuming app's `TagRef` resolves entity-reference tags to a name chip before they reach here (never a raw id).

| Prop | Type | Notes |
|------|------|-------|
| `tag` | `string` | The tag string |
| `onRemove` | `() => void` | When set, renders an × (removable mode); omit for navigable chips |
| `size` | `"sm" \| "default"` | Row vs detail sizing |

#### Card

**Import:** `@sixthshift/design-system/card`
**Purpose:** Bordered container with optional header. Becomes interactive when `onClick` is provided.

| Prop | Type | Notes |
|------|------|-------|
| `title` | `ReactNode` | Optional header title |
| `headerAction` | `ReactNode` | Element in header right side |
| `onClick` | `(event) => void` | Makes card clickable with hover/focus states |

#### Separator

**Import:** `@sixthshift/design-system/separator`
**Purpose:** Horizontal or vertical divider line.

| Prop | Type | Notes |
|------|------|-------|
| `orientation` | `"horizontal" \| "vertical"` | Default: `"horizontal"` |
| `decorative` | `boolean` | When `false`, adds `role="separator"` |

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
**Purpose:** Renders a markdown string to styled HTML using the design system's typography components.

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

### Layout & Feedback

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
**Purpose:** Monaco-based code editor with TypeScript support, semantic tokens, and the design system theme.

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
