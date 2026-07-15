# @sixthshift/temporal

Date/time utilities wrapping `@js-temporal/polyfill`. **Not** Temporal.io workflows -- this is the JavaScript Temporal API proposal (Stage 3) for replacing the broken native `Date`.

## Orientation

**Owns:** All date/time operations in the design system: re-exports `Temporal` from `@js-temporal/polyfill`, plus parsing (ISO strings to Temporal types), formatting (Temporal to display strings), serialization (Temporal to API-safe strings), comparison, arithmetic, boundaries (start/end of day/week/month), duration helpers, and timezone utilities.

**Boundaries:** Depends only on `@js-temporal/polyfill`. Consumed by `@sixthshift/ui` (all date/time components) and available to consuming apps directly. This is the lowest-level package in the repo.

**Surprise:** Never import `Temporal` directly from `@js-temporal/polyfill` -- always import from `@sixthshift/temporal`. This is the sole import point so that when native Temporal ships in V8/Bun, the switch happens in one file. Also, despite the name similarity, this has nothing to do with Temporal.io (the workflow engine).

## Why this exists

JavaScript's `Date` is famously broken. The Temporal proposal fixes it. Until Temporal ships natively in V8/Node/Bun, the polyfill carries the standard API today. Code here is written against the polyfill so it is ready when Temporal goes native.

## Modules

| File             | Purpose                                                  |
| ---------------- | -------------------------------------------------------- |
| `now.ts`         | Current `Instant`, `PlainDate`, `PlainTime` helpers     |
| `parse.ts`       | Parse ISO 8601 / common formats into Temporal types     |
| `format.ts`      | Format Temporal types as strings                         |
| `serialize.ts`   | JSON-safe serialization                                  |
| `arithmetic.ts`  | Add/subtract durations, period math                      |
| `compare.ts`     | Comparison helpers                                       |
| `boundaries.ts`  | startOfDay, endOfDay, startOfWeek, etc.                  |
| `duration.ts`    | Duration construction and conversion                     |
| `timezone.ts`    | Timezone resolution and IANA timezone utilities           |
| `validate.ts`    | Input validation for date/time strings                   |
| `index.ts`       | Public exports                                            |

## Usage

```typescript
import { now, parseInstant, formatDateShort } from "@sixthshift/temporal";

const right_now = now();                        // Temporal.Instant
const event = parseInstant("2026-04-10T12:00:00Z");
const display = formatDateShort(right_now.toZonedDateTimeISO("Australia/Sydney").toPlainDate());
```
