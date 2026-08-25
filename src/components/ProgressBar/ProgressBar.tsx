import { Caption } from "@sixthshift/design-system/caption";
import { cn } from "@sixthshift/design-system/utils";

export type ProgressBarProps = {
  completed: number;
  total: number;
  showFraction?: boolean;
  className?: string;
};

export const ProgressBar = ({ completed, total, showFraction = true, className }: ProgressBarProps) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-strong">
        <div className="h-full rounded-full bg-fg-success transition-all" style={{ width: `${percentage}%` }} />
      </div>
      {showFraction && (
        <Caption className="shrink-0">
          {completed}/{total}
        </Caption>
      )}
    </div>
  );
};
