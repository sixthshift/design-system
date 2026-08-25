import { useMemo } from "react";
import { today } from "../../date-time";

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
        const t = today();
        return { from: t, to: t };
      },
    },
    {
      label: "Yesterday",
      value: () => {
        const yesterday = today().subtract({ days: 1 });
        return { from: yesterday, to: yesterday };
      },
    },
    {
      label: "Last 7 days",
      value: () => {
        const t = today();
        const weekAgo = t.subtract({ days: 6 });
        return { from: weekAgo, to: t };
      },
    },
    {
      label: "Last 30 days",
      value: () => {
        const t = today();
        const monthAgo = t.subtract({ days: 29 });
        return { from: monthAgo, to: t };
      },
    },
    {
      label: "This month",
      value: () => {
        const t = today();
        const firstDay = t.with({ day: 1 });
        return { from: firstDay, to: t };
      },
    },
    {
      label: "Last month",
      value: () => {
        const t = today();
        const firstDayThisMonth = t.with({ day: 1 });
        const lastDayLastMonth = firstDayThisMonth.subtract({ days: 1 });
        const firstDayLastMonth = lastDayLastMonth.with({ day: 1 });
        return { from: firstDayLastMonth, to: lastDayLastMonth };
      },
    },
  ];
}

/**
 * DateRangePicker - A specialized date range picker component
 *
 * Wraps DatePicker with mode="range" and adds common range presets.
 * Uses Temporal.PlainDate for all date values.
 */
export const DateRangePicker = (props: DateRangePickerProps) => {
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

  return <DatePicker {...(datePickerProps as DatePickerRangeProps)} />;
};
