import { useCallback, useState } from "react";

export function useCollapsible(defaultExpanded = true) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggle = useCallback(() => setExpanded((prev) => !prev), []);
  const collapse = useCallback(() => setExpanded(false), []);
  const expand = useCallback(() => setExpanded(true), []);

  return {
    expanded,
    toggle,
    collapse,
    expand,
  };
}
