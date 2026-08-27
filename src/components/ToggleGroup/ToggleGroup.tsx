import * as React from "react";
import { ToggleGroupMultiple } from "./ToggleGroupMultiple";
import { ToggleGroupSingle } from "./ToggleGroupSingle";
import type { ToggleGroupProps } from "./toggleGroup.types";

/**
 * A group of `Toggle`-styled buttons for choosing one or more options,
 * switched by `type`: `"single"` renders `role="radiogroup"` with
 * `role="radio"` items — one tab stop, arrow keys move focus and selection
 * together (clicking the already-selected item is a no-op, there's no
 * deselect) — while `"multiple"` renders `role="group"` with `aria-pressed`
 * items, each independently tabbable and toggled on its own. `value`/
 * `defaultValue`/`onValueChange` follow `type`: a string for single, a
 * string array for multiple (`useControllableState`).
 *
 * Items are built on the same `buttonRecipe` as `Button`/`Toggle` and take
 * the same `variant`/`intent`, with two differences: `variant` excludes
 * `"link"` (no clear pressed state for an underline in a group) and `size`
 * excludes `"xl"` (too large for grouped toggles) — see
 * `toggleGroup.types.ts`. `appearance` chooses `"segmented"` (items joined
 * into one border) or `"separate"` (individually bordered, gapped) rendering.
 */
const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>((props, ref) => {
  if (props.type === "multiple") {
    return <ToggleGroupMultiple ref={ref} {...props} />;
  }
  return <ToggleGroupSingle ref={ref} {...props} />;
});
ToggleGroup.displayName = "ToggleGroup";

export { ToggleGroup };
