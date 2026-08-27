import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type FieldProps = {
  /** The humane label for what the identifier identifies ("WhatsApp", "Email"). */
  label: string;
  /** The identifier itself. Rendered monospaced + breakable by default. */
  children: React.ReactNode;
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

/**
 * Read-only label/value pair for displaying an identifier on
 * identity-disclosure surfaces — a contact's JIDs, external IDs, OAuth
 * subjects. Not a form control: there is no input and nothing to submit.
 *
 * `layout="stacked"` (default) puts the label above the value, for long
 * identifiers that need width to wrap; `layout="row"` puts label and value
 * on one line with the value right-aligned. `mono` (default `true`) renders
 * the value monospaced with `break-all`, since a raw identifier is the
 * canonical case; set it `false` when the value is itself human-readable.
 *
 * Distinct from `FormField`, which is the label + input wrapper for
 * interactive form controls, and from `MetricRow`
 * (`@sixthshift/design-system/metric-list`), which carries short numeric
 * metrics. Both are label/value pairs, but the value semantics differ: a
 * metric is a short readable number, an identifier is a long opaque string.
 * Making one component do both would conflate them and break wrapping.
 */
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(({ label, children, layout = "stacked", mono = true, className }, ref) => {
  const valueClass = cn("text-(--field-fg) text-xs", mono && "break-all font-mono");

  if (layout === "row") {
    return (
      <div ref={ref} className={cn("field flex items-baseline justify-between gap-3", className)}>
        <span className="shrink-0 text-(--field-fg) text-sm">{label}</span>
        <span className={cn(valueClass, "min-w-0 text-right")}>{children}</span>
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("field flex flex-col gap-1", className)}>
      <span className="text-(--field-fg) text-xs uppercase tracking-wide">{label}</span>
      <span className={valueClass}>{children}</span>
    </div>
  );
});
Field.displayName = "Field";
