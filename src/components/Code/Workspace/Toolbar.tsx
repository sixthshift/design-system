import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "../../Button";

export type Action = {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "solid" | "outline" | "ghost" | "link";
};

export type ToolbarProps = HTMLAttributes<HTMLDivElement> & {
  actions?: Action[] | undefined;
  primaryAction?: Action | undefined;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
};

/**
 * Toolbar component for code editor with actions and custom content areas
 */
export const Toolbar = ({ actions = [], primaryAction, leftContent, rightContent, className, ...props }: ToolbarProps) => {
  return (
    <div {...props} className={`flex items-center justify-between border-border-normal border-b bg-bg-normal px-4 py-2 ${className ?? ""}`}>
      {/* Left content */}
      <div className="flex items-center gap-2">{leftContent}</div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {actions.map((action) => (
          <Button key={action.id} variant={action.variant || "ghost"} size="sm" onClick={action.onClick} disabled={action.disabled}>
            {action.icon && <span className="mr-1">{action.icon}</span>}
            {action.label}
          </Button>
        ))}
        {primaryAction && (
          <Button variant={primaryAction.variant || "solid"} size="sm" onClick={primaryAction.onClick} disabled={primaryAction.disabled}>
            {primaryAction.icon && <span className="mr-1">{primaryAction.icon}</span>}
            {primaryAction.label}
          </Button>
        )}
        {rightContent}
      </div>
    </div>
  );
};
