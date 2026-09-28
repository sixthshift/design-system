import { Caption } from "@sixthshift/design-system/caption";
import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type ProgressBarIntentName = "neutral" | "brand" | "danger" | "success" | "warning";
/** Widened, like every intent prop: a consumer adds an intent in CSS, not in a release. */
export type ProgressBarIntent = ProgressBarIntentName | (string & {});

export type ProgressBarProps = {
  completed: number;
  total: number;
  showFraction?: boolean;
  /** The fill's colour family. Defaults to `brand`. */
  intent?: ProgressBarIntent | undefined;
  /** Name of a brand the theme defines, rendered as `data-brand`. Omitted, the bar follows the nearest `data-brand` ancestor. */
  brand?: string | undefined;
  /** Accessible name for the progress bar. */
  label?: string;
  className?: string;
};

/**
 * Determinate progress meter: a labelled fill bar plus an optional `n/total`
 * fraction (`showFraction`, default `true`).
 *
 * The bar itself is `role="progressbar"` with `aria-valuemin`/`-valuenow`/
 * `-valuemax`/`-valuetext`, and `label` (default `"Progress"`) sets its
 * accessible name — give it something more specific than the default when
 * more than one bar can appear on a page. `completed` is clamped into
 * `[0, total]` before it drives the fill width or `aria-valuenow`, so an
 * out-of-range value (negative, or greater than `total`) can't produce
 * invalid CSS or an impossible reported value — though the fraction text
 * still shows the raw, unclamped numbers. When `total` is not positive the
 * bar renders as indeterminate: no `aria-valuenow`/`aria-valuemax`, 0% fill.
 *
 * `intent` colours the fill and defaults to `brand`: progress is not an
 * outcome, so a bar at 40% is not `success`. Pass `success` when completion
 * really is the good news, or `danger` for a quota running out.
 */
export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ completed, total, intent = "brand", brand, showFraction = true, label = "Progress", className }, ref) => {
    // A caller can hand us anything; the bar must not render an out-of-range
    // width (a negative `width` is invalid CSS) or report impossible progress.
    const isMeasurable = total > 0;
    const clamped = isMeasurable ? Math.min(Math.max(completed, 0), total) : 0;
    const percentage = isMeasurable ? (clamped / total) * 100 : 0;

    return (
      <div ref={ref} data-intent={intent} data-brand={brand} className={cn("progress-bar flex items-center gap-3", className)}>
        <div
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={isMeasurable ? total : undefined}
          // An indeterminate progressbar omits aria-valuenow; with no positive
          // total there is no meaningful progress to report.
          aria-valuenow={isMeasurable ? clamped : undefined}
          aria-valuetext={isMeasurable ? `${clamped} of ${total}` : undefined}
          className="h-2 flex-1 overflow-hidden rounded-full bg-(--progress-bar-track-bg)"
        >
          <div className="h-full rounded-full bg-(--progress-bar-fill-bg) transition-all" style={{ width: `${percentage}%` }} />
        </div>
        {showFraction && (
          <Caption className="shrink-0">
            {completed}/{total}
          </Caption>
        )}
      </div>
    );
  }
);
ProgressBar.displayName = "ProgressBar";
