"use client";

import { cn } from "@sixthshift/design-system/utils";
import { X } from "lucide-react";
import * as React from "react";

export type TagChipProps = {
  tag: string;
  /** When set, renders an × affordance. Omit for read-only / navigable chips. */
  onRemove?: () => void;
  /** `sm` (default) for rows; `md` for detail pages. */
  size?: "sm" | "md";
  className?: string;
};

/**
 * One tag, rendered prettily. A `namespace:value` tag (`project:website`)
 * shows the namespace muted; a plain tag (`urgent`) renders as-is.
 *
 * Pure presentation. Entity-reference tags (`person:per_…`) are NOT rendered
 * here — the consuming app is expected to intercept those and resolve them to
 * a name chip; TagChip never shows a raw id.
 *
 * Two disjoint modes, chosen by whether `onRemove` is passed: navigable (no
 * `onRemove`; the caller wraps it in a link) or removable (`onRemove` renders
 * an × — used by `TagInput` and edit surfaces). It looks like an outline
 * Badge but is not one: the shape is duplicated here and every colour is its
 * own `--tag-chip-*` token, so importing TagChip pulls in nothing else. A tag
 * is metadata, not a status, so it takes no intent.
 */
/** Duplicated from Badge's sizes, which TagChip used to borrow. */
const sizeStyles = {
  sm: "px-1.5 py-0 text-[10px]",
  md: "px-2.5 py-0.5 text-xs",
} as const;

export const TagChip = React.forwardRef<HTMLSpanElement, TagChipProps>(({ tag, onRemove, size = "sm", className }, ref) => {
  const sep = tag.indexOf(":");
  const namespace = sep > 0 ? tag.slice(0, sep) : null;
  const value = sep > 0 ? tag.slice(sep + 1) : tag;

  return (
    <span
      ref={ref}
      className={cn(
        "tag-chip border-(color:--tag-chip-border) focus:ring-(color:--tag-chip-ring) inline-flex items-center gap-1 rounded-md border bg-(--tag-chip-bg) font-normal text-(--tag-chip-fg) transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2",
        sizeStyles[size],
        className
      )}
    >
      {namespace && <span className="text-(--tag-chip-namespace-fg)">{namespace}:</span>}
      <span>{value}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${tag}`}
          className="focus-visible:ring-(color:--tag-chip-remove-ring) -mr-0.5 ml-0.5 rounded-sm text-(--tag-chip-remove-fg) hover:text-(--tag-chip-remove-fg-hovered) focus-visible:outline-none focus-visible:ring-2"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
});
TagChip.displayName = "TagChip";
