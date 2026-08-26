import { Caption } from "@sixthshift/design-system/caption";
import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type ProgressBarProps = {
  completed: number;
  total: number;
  showFraction?: boolean;
  /** Accessible name for the progress bar. */
  label?: string;
  className?: string;
};

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ completed, total, showFraction = true, label = "Progress", className }, ref) => {
    // A caller can hand us anything; the bar must not render an out-of-range
    // width (a negative `width` is invalid CSS) or report impossible progress.
    const isMeasurable = total > 0;
    const clamped = isMeasurable ? Math.min(Math.max(completed, 0), total) : 0;
    const percentage = isMeasurable ? (clamped / total) * 100 : 0;

    return (
      <div ref={ref} className={cn("flex items-center gap-3", className)}>
        <div
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={isMeasurable ? total : undefined}
          // An indeterminate progressbar omits aria-valuenow; with no positive
          // total there is no meaningful progress to report.
          aria-valuenow={isMeasurable ? clamped : undefined}
          aria-valuetext={isMeasurable ? `${clamped} of ${total}` : undefined}
          className="h-2 flex-1 overflow-hidden rounded-full bg-bg-strong"
        >
          <div className="h-full rounded-full bg-fg-success transition-all" style={{ width: `${percentage}%` }} />
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
