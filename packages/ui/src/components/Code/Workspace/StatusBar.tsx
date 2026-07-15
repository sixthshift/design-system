import type { HTMLAttributes, ReactNode } from "react";

export type StatusBarItem = {
  id: string;
  label: string;
  value?: string;
  icon?: ReactNode;
  onClick?: () => void;
};

export type StatusBarProps = HTMLAttributes<HTMLDivElement> & {
  items?: StatusBarItem[] | undefined;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
};

/**
 * Status bar component for code editor showing metadata and status information
 */
export const StatusBar = ({ items = [], leftContent, rightContent, className, ...props }: StatusBarProps) => {
  return (
    <div {...props} className={`flex items-center justify-between border-border-normal border-t bg-bg-subtle px-4 py-1 text-xs ${className ?? ""}`}>
      {/* Left content */}
      <div className="flex items-center gap-4">
        {leftContent}
        {/* biome-ignore-start lint/a11y/noStaticElementInteractions: items are optionally clickable metadata chips — the API takes plain data and a per-item button would change the bar's layout */}
        {/* biome-ignore-start lint/a11y/useKeyWithClickEvents: same constraint as above */}
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-1 text-fg-subtle ${item.onClick ? "cursor-pointer hover:text-fg-normal" : ""}`}
            onClick={item.onClick}
          >
            {item.icon && <span>{item.icon}</span>}
            <span className="font-medium">{item.label}</span>
            {item.value && <span>: {item.value}</span>}
          </div>
        ))}
        {/* biome-ignore-end lint/a11y/useKeyWithClickEvents: see start marker */}
        {/* biome-ignore-end lint/a11y/noStaticElementInteractions: see start marker */}
      </div>

      {/* Right content */}
      <div className="flex items-center gap-4 text-fg-subtle">{rightContent}</div>
    </div>
  );
};
