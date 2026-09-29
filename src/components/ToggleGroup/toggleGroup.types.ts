import type * as React from "react";

/**
 * ToggleGroup's own axes. They match Toggle's and Button's, deliberately
 * duplicated rather than imported: a group of toggle buttons is its own
 * component, and importing it must not pull in either.
 */
type Loose<T extends string> = T | (string & {});
export type ToggleGroupVariantName = "solid" | "outline" | "ghost";
export type ToggleGroupIntentName = "neutral" | "brand" | "danger" | "success" | "warning";
export type ToggleGroupVariant = Loose<ToggleGroupVariantName>;
export type ToggleGroupIntent = Loose<ToggleGroupIntentName>;
/** `xl` is left out — too large for grouped toggles. */
export type ToggleGroupSize = "xs" | "sm" | "md" | "lg";

export type ToggleGroupOption = {
  /** Unique value for the option */
  value: string;
  /** Display label (text, icons, or any ReactNode) */
  label: React.ReactNode;
  /** Accessible label when label is non-text (e.g. icon-only) */
  ariaLabel?: string;
  /** Whether this option is disabled */
  disabled?: boolean;
};

export type ToggleGroupBaseProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> & {
  /** Available options */
  options: readonly ToggleGroupOption[];
  /** Visual appearance */
  appearance?: "segmented" | "separate";
  /** Layout orientation */
  orientation?: "vertical" | "horizontal";
  /** The items' treatment. */
  variant?: ToggleGroupVariant;
  /** Colour intent — widened, so a consumer-defined intent reaches the group. */
  intent?: ToggleGroupIntent;
  /**
   * Name of a brand the theme defines. Rendered once, as `data-brand` on the
   * group element, so every item inherits it. Omitted, the group follows the
   * nearest `data-brand` ancestor.
   */
  brand?: string | undefined;
  /** Item size (xl excluded — too large for grouped toggles) */
  size?: ToggleGroupSize;
  /** Square every item at the current size, for icon-only options */
  iconOnly?: boolean;
  /** Disable all options */
  disabled?: boolean;
  /**
   * Input name for native form submission. The selection is mirrored into
   * hidden `<input>`s — `name` in single mode, `${name}[]` in multiple mode.
   */
  name?: string;
  /** The `form` attribute for the hidden input(s), for a group rendered outside its `<form>`. */
  form?: string;
};

export type ToggleGroupSingleProps = ToggleGroupBaseProps & {
  type: "single";
  /** Controlled selected value */
  value?: string;
  /** Default selected value for uncontrolled mode */
  defaultValue?: string;
  /** Called when selection changes */
  onValueChange?: (value: string) => void;
};

export type ToggleGroupMultipleProps = ToggleGroupBaseProps & {
  type: "multiple";
  /** Controlled selected values */
  value?: string[];
  /** Default selected values for uncontrolled mode */
  defaultValue?: string[];
  /** Called when selection changes */
  onValueChange?: (value: string[]) => void;
};

export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;
