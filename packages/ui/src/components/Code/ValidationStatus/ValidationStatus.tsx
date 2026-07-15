import { Message } from "@sixthshift/ui/message";
import { cn } from "@sixthshift/ui/utils";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import type { ComponentProps, HTMLAttributes } from "react";

export type ValidationError = {
  line: number;
  column: number;
  message: string;
  severity: "error" | "warning" | "info";
};

export type ValidationStatusProps = HTMLAttributes<HTMLDivElement> & {
  errors: ValidationError[];
  /** Cap the rendered error rows. Excess is summarised as "…and N more". */
  maxRows?: number;
};

type Intent = NonNullable<ComponentProps<typeof Message>["intent"]>;

const SEVERITY_INTENT: Record<ValidationError["severity"], Intent> = {
  error: "danger",
  warning: "warning",
  info: "neutral",
};

const severityIcon = (severity: ValidationError["severity"]) => {
  if (severity === "error") return <AlertCircle className="h-4 w-4" />;
  if (severity === "warning") return <AlertTriangle className="h-4 w-4" />;
  return <Info className="h-4 w-4" />;
};

const summarise = (errorCount: number, warningCount: number) => {
  const parts: string[] = [];
  if (errorCount > 0) parts.push(`${errorCount} error${errorCount > 1 ? "s" : ""}`);
  if (warningCount > 0) parts.push(`${warningCount} warning${warningCount > 1 ? "s" : ""}`);
  return parts.join(", ");
};

export const ValidationStatus = ({ errors, maxRows = 5, className, ...props }: ValidationStatusProps) => {
  if (errors.length === 0) {
    return (
      <div {...props} className={cn("flex flex-col", className)}>
        <Message intent="success" icon={<CheckCircle className="h-4 w-4" />}>
          No errors — code is valid
        </Message>
      </div>
    );
  }

  const errorCount = errors.filter((e) => e.severity === "error").length;
  const warningCount = errors.filter((e) => e.severity === "warning").length;
  const visible = errors.slice(0, maxRows);
  const overflow = errors.length - visible.length;

  return (
    <div {...props} className={cn("flex flex-col gap-2", className)}>
      <Message intent="danger" icon={<AlertCircle className="h-4 w-4" />}>
        {summarise(errorCount, warningCount)}
      </Message>

      {visible.map((error) => (
        <Message
          key={`${error.line}-${error.column}-${error.message}`}
          intent={SEVERITY_INTENT[error.severity]}
          icon={severityIcon(error.severity)}
          size="sm"
          title={error.message}
        >
          Line {error.line}, Column {error.column}
        </Message>
      ))}

      {overflow > 0 && (
        <Message intent="neutral" size="sm">
          …and {overflow} more
        </Message>
      )}
    </div>
  );
};
