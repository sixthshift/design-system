import { cn } from "@sixthshift/design-system/utils";
import type { ReactNode } from "react";

/**
 * The labelled identifier carve-out used by identity-disclosure surfaces
 * (Person Detail's Identifiers card, Calendar Event's per-source provenance).
 *
 * Field exists because identifiers (JIDs, external IDs, OAuth subs) are
 * *content* on these surfaces — they answer "what does PA know about this
 * contact?" The default value rendering is monospaced with `break-all`
 * because a raw JID is the canonical case and it must wrap inside the row.
 *
 * Sibling primitive — not a replacement: `MetricRow` (in `@sixthshift/design-system/metric-list`)
 * carries runtime metrics ("CPU: 12.5%"). Both are label/value pairs but the
 * value semantics differ: a metric is a short readable number; an identifier
 * is a long opaque string. Forcing `MetricRow` to do both would conflate the
 * two and break Identifiers-card wrapping.
 *
 * See: docs/engineering/explanation/concepts/identity-rendering.md
 */
export type FieldProps = {
  /** The humane label for what the identifier identifies ("WhatsApp", "Email"). */
  label: string;
  /** The identifier itself. Rendered monospaced + breakable by default. */
  children: ReactNode;
  /**
   * `stacked` (default): label above, value below — best for long identifiers
   * that need horizontal room to wrap.
   * `row`: label and value on one line with the value right-aligned and
   * wrapping — best for short identifiers (phone, short ID).
   */
  layout?: "stacked" | "row";
  /**
   * Set `false` to render the value in proportional text — e.g. when the
   * value is itself a human-readable name (rare on identity-disclosure
   * surfaces, but valid).
   */
  mono?: boolean;
  className?: string;
};

export const Field = ({ label, children, layout = "stacked", mono = true, className }: FieldProps) => {
  const valueClass = cn("text-fg-subtle text-xs", mono && "break-all font-mono");

  if (layout === "row") {
    return (
      <div className={cn("flex items-baseline justify-between gap-3", className)}>
        <span className="shrink-0 text-fg-subtle text-sm">{label}</span>
        <span className={cn(valueClass, "min-w-0 text-right")}>{children}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-fg-subtle text-xs uppercase tracking-wide">{label}</span>
      <span className={valueClass}>{children}</span>
    </div>
  );
};
