# Time & Date Formatting

How the design system displays time and dates in the UI. Relative vs absolute, the format scale, and when each applies.

Time shows up everywhere — "2d ago" on an index row, "Yesterday at 4pm" on a detail page, "March 5, 2026" in a date picker. Currently each surface formats its own way; this doc codifies which format applies in which context.

## The two axes

Time display has two questions, asked in order:

1. **Relative or absolute?** "2 hours ago" vs "March 5, 4:00 PM".
2. **How precise?** Days vs hours-and-minutes; year-included vs year-omitted.

## When to use relative

Use relative time when the user is reading **rhythm**: how recent, how stale, how active. The exact moment doesn't matter; the *closeness to now* matters.

- Last interaction on an index row
- Last updated on a document
- Activity log entries
- "Just now" indicators
- Staleness signals

Relative is for the **scanning** mood — the user is flowing through items.

## When to use absolute

Use absolute time when the user needs to **anchor** to a specific moment: when something happened, when something is scheduled, comparing two events.

- Scheduled events ("2pm tomorrow")
- Deadlines
- Detail-page metadata blocks (createdAt, updatedAt)
- Activity log timestamps that need precision
- Anything the user might say aloud ("the meeting at 3:30")

Absolute is for the **deciding** mood — the user is making a plan.

## Relative scale

There is one canonical relative scale:

| Days since | Display |
|---|---|
| 0 | `today` |
| 1–60 | `1d`, `2d`, … `60d` |
| 61–364 | `2mo`, `3mo`, … `11mo` (rounded to nearest month) |
| 365+ | `1y`, `2y`, … |

Never `"yesterday"`, `"2 days ago"`, `"3 weeks ago"`. The short form scans better in rows and stays compact at any width.

For sub-day precision (when used — typically only in activity log or chat-like UIs):

| Time since | Display |
|---|---|
| <1 minute | `now` |
| <1 hour | `5m`, `12m`, `45m` |
| <24 hours | `2h`, `8h`, `23h` |
| ≥24 hours | falls back to days (`1d`, `2d`, …) |

## Absolute formats

The `@sixthshift/design-system/date-time` package exports a family of formatters in `src/date-time/format.ts`. Pick the one that matches what the user is doing:

### Dates only

| Function | Output | When |
|---|---|---|
| `formatDateShort` | `Mar 5` | Compact contexts, this year |
| `formatDateShortYear` | `Mar 5, 2026` | When year ambiguity matters |
| `formatDateMedium` | `March 5` | Detail-page metadata |
| `formatDateMediumYear` | `March 5, 2026` | Detail-page metadata, prior years |
| `formatDateLong` | `Thursday, March 5, 2026` | Full prose contexts (rare in UI) |
| `formatDateNumeric` | `3/5` | Tables, very compact contexts |

### Times only

| Function | Output | When |
|---|---|---|
| `formatTime` | `4:00 PM` | Default time-of-day display |
| `formatTimePadded` | `04:00 PM` | Tables where alignment matters |
| `formatTimeCompact` | `4pm` | Inline, casual contexts |

### Combined (date + time)

Compose `formatDateShort` + `formatTime` with a separator:

```ts
const dt = parseDateTime(item.lastInteraction);
const display = `${formatDateShortYear(dt.toPlainDate())} ${formatTime(dt)}`;
// "Mar 5, 2026 4:00 PM"
```

This pattern shows up on detail pages; if it spreads, consider lifting a `formatDateTime` helper to `@sixthshift/design-system/date-time`.

## Smart format ("today / yesterday / date")

For surfaces where time matters but doesn't deserve a full date, use a smart format that adapts:

| Days from now | Display |
|---|---|
| 0 | `Today` |
| -1 | `Yesterday` |
| 1 | `Tomorrow` |
| Within ±7 days | Day of week (`Thursday`) |
| Within this year | `Mar 5` |
| Other years | `Mar 5, 2026` |

**Open question:** lift this to `@sixthshift/design-system/date-time` as `formatDateSmart`?

## Insight strips and counts

For insight-strip-style text ("18 items · 8 active this week"), prefer phrases over symbols:

| Use | Not |
|---|---|
| `8 active this week` | `8 active in 7d` |
| `3 due today` | `3 due 0d` |
| `7 needing review` | `7 stale 30d+` |

The strip is reading-mode, not scanning-mode — natural language reads better here than the compact scale.

## Rules

1. **Pick relative OR absolute per surface.** Don't mix on the same row ("2d ago at 4pm" is noise).
2. **Use the canonical relative scale.** No "yesterday" / "2 days ago" / "a week ago" variants. Use `1d` / `2d` / `1w` consistently.
3. **All formatters go through `@sixthshift/design-system/date-time`.** Never roll your own with `toLocaleDateString` or template strings.
4. **Year is shown when ambiguous.** If a date could be this year or another year and that matters, include the year. Otherwise omit.
5. **Timezones are user-local.** Use `Temporal.Now.timeZoneId()` for all display. No UTC in the UI.
6. **Persist instants, display formats.** The database stores `Temporal.Instant`. The UI converts and formats at render time.

## Anti-patterns

- **Raw ISO strings in the UI** (`2026-05-19T14:30:00Z`). Always format. This is about what the *user* sees — the date/time components exchange ISO strings at their prop boundary by design, and format for display internally.
- **Verbose relative phrases** in scannable contexts ("approximately 2 hours ago", "a few days ago"). Use the scale.
- **`new Date()`** in component code. Use `Temporal.Now` via `@sixthshift/design-system/date-time`.
- **Per-page format functions.** If you find yourself writing `formatX` in a page utils file, the helper belongs in `@sixthshift/design-system/date-time` or is a sign the existing helpers don't fit. Push the gap upstream.

## Related

- `src/date-time/format.ts` — the formatter family
- [Copy Conventions](copy-conventions.md) — punctuation in inline date phrases
