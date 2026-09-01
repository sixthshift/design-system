"use client";

import { cn } from "@sixthshift/design-system/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

/**
 * Geometry only, plus the five `--card-*` component tokens.
 *
 * Every colour reads a `--card-*` token whose value is decided by
 * src/theme/recipes/card.css. `size` stays here: it is pure geometry
 * (padding, header gap, corner radius), not colour, so it has no reason to
 * move — the same split Message.tsx documents.
 *
 * The ramp is a density axis, not a padding setting. `md` is the middle and
 * the default at 16px, which is also where MUI's `CardContent` and
 * Bootstrap's `.card-body` sit; two steps exist below it for surfaces that
 * repeat dozens of times, and two above for surfaces that are the page.
 *
 *   xs  8px   dense data — table-row cards, compact tiles, many at once
 *   sm  12px  list rows and secondary cards; a line or two of content
 *   md  16px  a standalone content card. The one to reach for by default
 *   lg  24px  primary or feature cards — a main panel, a form container
 *   xl  32px  hero, empty-state and marketing surfaces
 *
 * Steps are 8 · 12 · 16 · 24 · 32, alternating x1.5 and x1.33; 20px is
 * skipped deliberately as the value that breaks that rhythm.
 *
 * Radius scales with padding and never exceeds it — at `xs` a 12px corner
 * against 8px of padding visibly crowds the content. The header gap flattens
 * at both ends instead of tracking padding: it separates a title from an
 * action control, so it has a usability floor and nothing to gain above 16px.
 *
 * Type is deliberately absent from the ramp. Message's `size` carries
 * `text-xs` because Message knows what it holds; Card is a container for
 * arbitrary children, `Heading` and `Body` included, so setting type here
 * would fight the typography ramp at every call site. Containers set
 * spacing; content components set type.
 */
export const cardVariants = cva(
  // One literal, deliberately: `useSortedClasses --unsafe` strips the trailing
  // space before a `+`, silently welding the last class of one fragment to the
  // first of the next. A single string means the sorter has nothing to break.
  "card border-(color:--card-border) border bg-(--card-bg) text-(--card-fg) shadow",
  {
    variants: {
      size: {
        xs: "rounded-md p-2",
        sm: "rounded-lg p-3",
        md: "rounded-xl p-4",
        lg: "rounded-xl p-6",
        xl: "rounded-2xl p-8",
      },
      interactive: {
        true: "hover:border-(color:--card-border-hovered) focus-visible:outline-(color:--card-ring) cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      interactive: false,
    },
  }
);

/**
 * Header geometry per size: the gap between title and action, and the space
 * below it.
 *
 * A `<div>`, not a `<header>`. A `<header>` whose nearest sectioning ancestor
 * is the body becomes a `banner` landmark, so two titled cards on one page
 * produced two banners — axe's `landmark-no-duplicate-banner`. A card's header
 * is not the page's banner, and the element bought nothing else here.
 */
const headerVariants = cva("flex items-start justify-between", {
  variants: {
    size: {
      xs: "mb-2 gap-2",
      sm: "mb-3 gap-2",
      md: "mb-4 gap-3",
      lg: "mb-4 gap-4",
      xl: "mb-6 gap-4",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type CardSize = NonNullable<VariantProps<typeof cardVariants>["size"]>;

export type CardProps = Omit<React.HTMLAttributes<HTMLDivElement>, "title"> &
  Pick<VariantProps<typeof cardVariants>, "size"> & {
    /** Optional header title - string or ReactNode */
    title?: React.ReactNode;
    /** Optional action element displayed on the right side of the header */
    headerAction?: React.ReactNode;
  };

/**
 * Bordered, elevated container — the "this contains data" building block
 * (see docs/visual-hierarchy.md's Elevated tier). Renders a `<div>`, with an
 * optional header row when `title` and/or `headerAction` is passed.
 *
 * `size` is a density axis covering padding, header spacing and corner
 * radius; `md` (16px) is the default. See `cardVariants` above for what each
 * step is for and why type is not part of it.
 *
 * Passing `onClick` turns the whole card into a button: it gets
 * `role="button"`, `tabIndex={0}`, and both Enter and Space activate it, not
 * just a pointer click. Omit `onClick` for a purely presentational card.
 *
 * Colour reads `--card-*` component tokens (src/components/Card/card.recipe.css) —
 * the same seam Button and Badge use — so a consumer can re-point them
 * without a release.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, size, title, headerAction, children, onClick, onKeyDown, ...props }, ref) => {
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
      className={cn(cardVariants({ size, interactive: isInteractive }), className)}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      {...(isInteractive && { role: "button", tabIndex: 0 })}
      {...props}
    >
      {(title || headerAction) && (
        <div className={headerVariants({ size })}>
          {title && <div className="font-semibold">{title}</div>}
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
});
Card.displayName = "Card";
