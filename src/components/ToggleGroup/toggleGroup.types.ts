import type * as React from "react";
import type { ButtonIntent, ButtonVariant } from "../Button/Button";
import type { ToggleProps } from "../Toggle/Toggle";

/** Extract a prop's union type from ToggleProps, stripping null added by CVA */
type ToggleProp<K extends keyof ToggleProps> = NonNullable<ToggleProps[K]>;

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
  /** Button variant — every one Button ships has a pressed state, so none is excluded. */
  variant?: ButtonVariant;
  /** Colour intent — widened like Button's, so a consumer-defined intent reaches the group. */
  intent?: ButtonIntent;
  /**
   * Name of a brand the theme defines. Rendered once, as `data-brand` on the
   * group element, so every item inherits it. Omitted, the group follows the
   * nearest `data-brand` ancestor.
   */
  brand?: string | undefined;
  /** Button size (xl excluded — too large for grouped toggles) */
  size?: Exclude<ToggleProp<"size">, "xl">;
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
