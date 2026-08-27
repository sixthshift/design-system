import type * as React from "react";
import type { ButtonIntentName, ButtonVariantName } from "../Button/Button";
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
  /**
   * Button variant (link excluded as it has no clear pressed state in groups).
   *
   * Deliberately the closed union, not Button's widened `ButtonVariant`: an
   * `Exclude` cannot remove `link` from a type that already admits any string,
   * so narrowing here requires narrowing from the closed names.
   */
  variant?: Exclude<ButtonVariantName, "link">;
  /** Color intent */
  intent?: ButtonIntentName;
  /** Button size (xl excluded — too large for grouped toggles) */
  size?: Exclude<ToggleProp<"size">, "xl">;
  /** Disable all options */
  disabled?: boolean;
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
