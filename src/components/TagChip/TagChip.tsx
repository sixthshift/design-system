import { Badge } from "@sixthshift/design-system/badge";
import { cn } from "@sixthshift/design-system/utils";
import { X } from "lucide-react";
import * as React from "react";

/**
 * One tag, rendered prettily. A `namespace:value` tag (`project:website`)
 * shows the namespace muted; a plain tag (`urgent`) renders as-is.
 *
 * Pure presentation. Entity-reference tags (`person:per_…`) are NOT rendered
 * here — the web `TagRef` intercepts those and resolves them to a name chip
 * (identity-rendering.md); TagChip never shows a raw id.
 *
 * Two disjoint modes: navigable (no `onRemove`; the caller wraps it in a link)
 * or removable (`onRemove` renders an × — used by `TagInput` and edit surfaces).
 */
export type TagChipProps = {
  tag: string;
  /** When set, renders an × affordance. Omit for read-only / navigable chips. */
  onRemove?: () => void;
  /** `sm` (default) for rows; `default` for detail pages. */
  size?: "sm" | "default";
  className?: string;
};

export const TagChip = React.forwardRef<HTMLSpanElement, TagChipProps>(({ tag, onRemove, size = "sm", className }, ref) => {
  const sep = tag.indexOf(":");
  const namespace = sep > 0 ? tag.slice(0, sep) : null;
  const value = sep > 0 ? tag.slice(sep + 1) : tag;

  return (
    <Badge
      ref={ref}
      variant="outline"
      intent="muted"
      className={cn("gap-1 font-normal", size === "sm" ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-xs", className)}
    >
      {namespace && <span className="text-fg-subtle">{namespace}:</span>}
      <span>{value}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${tag}`}
          className="-mr-0.5 ml-0.5 rounded-sm text-fg-subtle hover:text-fg-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
});
TagChip.displayName = "TagChip";
