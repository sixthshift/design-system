/**
 * Calendar — the public, ISO-string-typed calendar.
 *
 * A thin adapter over {@link CalendarView}: it parses incoming ISO strings and
 * serialises outgoing selections. All the behaviour lives in CalendarView.
 *
 * Every conversion is memoised on the string it came from, and every handler is
 * stable. Temporal objects have no value identity — `PlainDate.from("2026-08-26")`
 * is never `===` another PlainDate for the same day — and CalendarView keys
 * `useMemo`/`useCallback` on these values directly, so converting unmemoised
 * would invalidate the whole grid on every render.
 *
 * Props are read with `"key" in props` rather than destructured per mode,
 * because every hook here has to run unconditionally.
 */

import { useCallback, useMemo } from "react";
import {
  adaptDisabledDates,
  fromISODate,
  fromISODateOrUndefined,
  fromISODateRange,
  type ISODate,
  type ISODateRange,
  type Temporal,
  toISODate,
  toISODateOrUndefined,
  toISODateRange,
} from "../../date-time";
import { CalendarView } from "./CalendarView";
import type { CalendarProps, CalendarViewProps, DateRangeValue, PresetOption } from "./calendar.types";

export type { CalendarProps };

export const Calendar = (props: CalendarProps) => {
  const { mode, month, onMonthChange, minDate, maxDate, disabled, weekStartsOn, showFooter, showToday, onApply, onCancel, className } = props;

  const value = "value" in props ? props.value : undefined;
  const onSelect = "onSelect" in props ? props.onSelect : undefined;
  const presets = "presets" in props ? props.presets : undefined;
  const max = mode === "multiple" && "max" in props ? props.max : undefined;

  // ---------------------------------------------------------------------------
  // Inbound: ISO strings -> Temporal, each keyed on the string it derives from.
  // ---------------------------------------------------------------------------

  const temporalMonth = useMemo(() => fromISODate(month), [month]);
  const temporalMinDate = useMemo(() => fromISODateOrUndefined(minDate), [minDate]);
  const temporalMaxDate = useMemo(() => fromISODateOrUndefined(maxDate), [maxDate]);
  const temporalDisabled = useMemo(() => adaptDisabledDates(disabled), [disabled]);

  const temporalValue = useMemo(() => {
    if (mode === "single") return fromISODateOrUndefined(value as ISODate | undefined);
    if (mode === "multiple") return ((value as ISODate[] | undefined) ?? []).map(fromISODate);
    return fromISODateRange(value as ISODateRange | undefined);
  }, [mode, value]);

  const temporalPresets = useMemo(() => {
    if (!presets) return undefined;
    if (mode === "single") {
      return (presets as PresetOption<ISODate>[]).map((preset) => ({ label: preset.label, value: fromISODate(preset.value) }));
    }
    if (mode === "multiple") {
      return (presets as PresetOption<ISODate[]>[]).map((preset) => ({ label: preset.label, value: preset.value.map(fromISODate) }));
    }
    return (presets as PresetOption<ISODateRange>[]).map((preset) => ({
      label: preset.label,
      value: fromISODateRange(preset.value) ?? { from: undefined, to: undefined },
    }));
  }, [mode, presets]);

  // ---------------------------------------------------------------------------
  // Outbound: Temporal -> ISO strings.
  // ---------------------------------------------------------------------------

  const handleMonthChange = useCallback((next: Temporal.PlainDate) => onMonthChange(toISODate(next)), [onMonthChange]);

  const handleSelect = useCallback(
    (next: Temporal.PlainDate | Temporal.PlainDate[] | DateRangeValue | undefined) => {
      if (!onSelect) return;

      if (mode === "single") {
        (onSelect as (date: ISODate | undefined) => void)(toISODateOrUndefined(next as Temporal.PlainDate | undefined));
        return;
      }

      if (mode === "multiple") {
        (onSelect as (dates: ISODate[]) => void)(((next as Temporal.PlainDate[] | undefined) ?? []).map(toISODate));
        return;
      }

      (onSelect as (range: ISODateRange | undefined) => void)(toISODateRange(next as DateRangeValue | undefined));
    },
    [mode, onSelect]
  );

  // One cast, at the single point where the two discriminated unions meet: the
  // mode discriminant and its matching value/onSelect/presets have all been
  // converted in step above, but TypeScript cannot follow that across the
  // separate useMemo calls.
  const viewProps = {
    mode,
    month: temporalMonth,
    onMonthChange: handleMonthChange,
    minDate: temporalMinDate,
    maxDate: temporalMaxDate,
    disabled: temporalDisabled,
    weekStartsOn,
    showFooter,
    showToday,
    onApply,
    onCancel,
    className,
    max,
    value: temporalValue,
    onSelect: handleSelect,
    presets: temporalPresets,
  } as unknown as CalendarViewProps;

  return <CalendarView {...viewProps} />;
};
