/**
 * Public surface of `@sixthshift/design-system/calendar`.
 *
 * `CalendarView`, the `CalendarView*` prop types, and everything in
 * `calendar.hooks` are intentionally absent. The `exports` map resolves
 * `./calendar` to this file, so anything not re-exported here cannot be imported
 * by a consumer — which is what keeps Temporal out of the package's public API.
 *
 * Those helpers were previously re-exported from here, which leaked
 * `Temporal.PlainDate` into the public API through their signatures. Pickers
 * inside this package import `./CalendarView` and `./calendar.hooks` directly.
 * Consumers who want date arithmetic use
 * `@sixthshift/design-system/date-time`, whose ISO-native helpers cover the
 * cases these were reachable for.
 */

export { Calendar } from "./Calendar";
export type {
  CalendarMultipleProps,
  CalendarProps,
  CalendarRangeProps,
  CalendarSingleProps,
  DateSelectionState,
  PresetOption,
  RangePosition,
  SelectionMode,
} from "./calendar.types";
