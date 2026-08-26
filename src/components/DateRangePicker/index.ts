/**
 * Public surface of `@sixthshift/design-system/date-range-picker`.
 *
 * `DateRangeValue` and `DisabledDateMatcher` were Temporal-shaped and are gone;
 * the ISO equivalents `ISODateRange` and `DisabledDates` are re-exported here.
 */

export type { DisabledDates, ISODate, ISODateRange } from "../../date-time";
export { DateRangePicker } from "./DateRangePicker";
export type { DateRangePickerProps, PresetOption } from "./daterangepicker.types";
