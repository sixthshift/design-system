/**
 * Public surface of `@sixthshift/design-system/date-picker`.
 *
 * `DateRangeValue` and `DisabledDateMatcher` used to be exported from here as
 * Temporal-shaped types. They are now internal; the public equivalents are
 * `ISODateRange` and `DisabledDates`, re-exported below so a consumer typing
 * their own range state does not need a second import.
 */

export type { DisabledDates, ISODate, ISODateRange } from "../../date-time";
export type { PresetOption } from "../Calendar/calendar.types";
export { DatePicker } from "./DatePicker";
export type { DatePickerMode, DatePickerMultipleProps, DatePickerProps, DatePickerRangeProps, DatePickerSingleProps } from "./datepicker.types";
