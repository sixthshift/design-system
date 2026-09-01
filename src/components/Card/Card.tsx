"use client";

import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type CardProps = Omit<React.HTMLAttributes<HTMLDivElement>, "title"> & {
  /** Optional header title - string or ReactNode */
  title?: React.ReactNode;
  /** Optional action element displayed on the right side of the header */
  headerAction?: React.ReactNode;
};

/**
 * Bordered, elevated container — the "this contains data" building block
 * (see docs/visual-hierarchy.md's Elevated tier). Renders a `<div>`, with an
 * optional `<header>` when `title` and/or `headerAction` is passed.
 *
 * Passing `onClick` turns the whole card into a button: it gets
 * `role="button"`, `tabIndex={0}`, and both Enter and Space activate it, not
 * just a pointer click. Omit `onClick` for a purely presentational card.
 *
 * Colour reads `--card-*` component tokens (src/components/Card/card.recipe.css) —
 * the same seam Button and Badge use — so a consumer can re-point them
 * without a release.
 */
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
        "card border-(color:--card-border) rounded-xl border bg-(--card-bg) p-6 text-(--card-fg) shadow",
        isInteractive &&
          "hover:border-(color:--card-border-hovered) focus-visible:outline-(color:--card-ring) cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
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
