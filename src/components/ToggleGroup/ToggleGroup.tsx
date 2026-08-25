import * as React from "react";
import { ToggleGroupMultiple } from "./ToggleGroupMultiple";
import { ToggleGroupSingle } from "./ToggleGroupSingle";
import type { ToggleGroupProps } from "./toggleGroup.types";

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>((props, ref) => {
  if (props.type === "multiple") {
    return <ToggleGroupMultiple ref={ref} {...props} />;
  }
  return <ToggleGroupSingle ref={ref} {...props} />;
});
ToggleGroup.displayName = "ToggleGroup";

export { ToggleGroup };
