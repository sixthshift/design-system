import { cn } from "@sixthshift/ui/utils";
import * as React from "react";

export type CardProps = Omit<React.HTMLAttributes<HTMLDivElement>, "title"> & {
  /** Optional header title - string or ReactNode */
  title?: React.ReactNode;
  /** Optional action element displayed on the right side of the header */
  headerAction?: React.ReactNode;
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, title, headerAction, children, onClick, onKeyDown, ...props }, ref) => {
  const isInteractive = !!onClick;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isInteractive && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
    }
    onKeyDown?.(e);
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: role="button" + tabIndex are added dynamically when onClick is present
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-border-normal bg-bg-normal p-6 text-fg-normal shadow",
        isInteractive &&
          "cursor-pointer transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-border-strong focus-visible:outline-offset-2",
        className
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      {...(isInteractive && { role: "button", tabIndex: 0 })}
      {...props}
    >
      {(title || headerAction) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          {title && <div className="font-semibold">{title}</div>}
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </header>
      )}
      {children}
    </div>
  );
});
Card.displayName = "Card";
