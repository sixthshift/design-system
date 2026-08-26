import * as React from "react";
import { useMemo } from "react";
import { addDaysISO, startOfMonthISO, todayISO } from "../../date-time";

import { DatePicker } from "../DatePicker";
import type { DatePickerRangeProps } from "../DatePicker/datepicker.types";
import type { DateRangePickerProps, PresetOption } from "./daterangepicker.types";

/**
 * Default preset ranges for DateRangePicker
 * Computed fresh on each render to ensure "today" is always current
 */
function getDefaultPresets(): PresetOption[] {
  return [
    {
      label: "Today",
      value: () => {
        const t = todayISO();
        return { from: t, to: t };
      },
    },
    {
      label: "Yesterday",
      value: () => {
        const yesterday = addDaysISO(todayISO(), -1);
        return { from: yesterday, to: yesterday };
      },
    },
    {
      label: "Last 7 days",
      value: () => {
        const t = todayISO();
        return { from: addDaysISO(t, -6), to: t };
      },
    },
    {
      label: "Last 30 days",
      value: () => {
        const t = todayISO();
        return { from: addDaysISO(t, -29), to: t };
      },
    },
    {
      label: "This month",
      value: () => {
        const t = todayISO();
        return { from: startOfMonthISO(t), to: t };
      },
    },
    {
      label: "Last month",
      value: () => {
        const lastDayLastMonth = addDaysISO(startOfMonthISO(todayISO()), -1);
        return { from: startOfMonthISO(lastDayLastMonth), to: lastDayLastMonth };
      },
    },
  ];
}

/**
 * DateRangePicker - A specialized date range picker component
 *
 * Wraps DatePicker with mode="range" and adds common range presets.
 * All date values are canonical ISO 8601 strings ("2026-08-26").
 */
export const DateRangePicker = React.forwardRef<HTMLDivElement, DateRangePickerProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    minDate,
    maxDate,
    disabled,
    presets: customPresets,
    showPresets = true,
    placeholder = "Select date range...",
    weekStartsOn,
    name,
    isDisabled,
    isInvalid,
    className,
    align,
    clearable,
  } = props;

  // Compute presets on each render to ensure they're always current
  // Convert PresetOption[] (with value functions) to DatePicker's PresetOption format
  const datePickerPresets = useMemo(() => {
    if (!showPresets) {
      return undefined;
    }

    const presetsToUse = customPresets || getDefaultPresets();

    return presetsToUse.map((preset) => ({
      label: preset.label,
      value: preset.value(), // Call the function to get the actual value
    }));
  }, [customPresets, showPresets]);

  // Build props for DatePicker (only include defined values)
  const datePickerProps: Record<string, unknown> = {
    mode: "range",
    placeholder,
    ...(value !== undefined && { value }),
    ...(defaultValue !== undefined && { defaultValue }),
    ...(onChange !== undefined && { onChange }),
    ...(minDate && { minDate }),
    ...(maxDate && { maxDate }),
    ...(disabled && { disabled }),
    ...(datePickerPresets && { presets: datePickerPresets }),
    ...(weekStartsOn !== undefined && { weekStartsOn }),
    ...(name && { name }),
    ...(isDisabled && { isDisabled }),
    ...(isInvalid && { isInvalid }),
    ...(className && { className }),
    ...(align && { align }),
    ...(clearable !== undefined && { clearable }),
  };

  return <DatePicker ref={ref} {...(datePickerProps as DatePickerRangeProps)} />;
});
DateRangePicker.displayName = "DateRangePicker";
