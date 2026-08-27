import { useComponents } from "@sixthshift/design-system/components";
import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";
import { NavItem } from "./NavItem";
import type { NavItem as NavItemType, NavSection, RenderLinkFn } from "./types";

export type NavSideProps = {
  /** Navigation sections */
  sections: NavSection[];
  /** Whether the nav is expanded (shows labels) or collapsed (icons only) */
  expanded?: boolean;
  /** Callback to determine if an item is active */
  isActive: (item: NavItemType) => boolean;
  /** Render function for links (allows router integration). Falls back to ComponentsContext Link. */
  renderLink?: RenderLinkFn;
  /** Additional class names */
  className?: string;
};

/**
 * Desktop/tablet sidebar navigation: a vertical stack of link sections
 * rendered inside a `<nav>`, each item showing an icon and, when expanded, a
 * label and optional count badge (capped at "9+").
 *
 * `expanded` toggles between the full sidebar (icons + labels, `w-48`) and an
 * icon-only rail (`w-16`) — this is the desktop-vs-tablet split described in
 * docs/responsive.md, driven by the caller rather than a self-managed
 * collapse. When collapsed, each link gets a `title` attribute (native
 * tooltip) in place of the visible label.
 *
 * There's no built-in notion of "current route": the caller decides what's
 * active via `isActive`, and supplies `renderLink` to integrate with a router
 * (falls back to the `Link` from `ComponentsContext` when omitted). Sections
 * are separated by a divider, skipped before the first section.
 *
 * On mobile this doesn't render at all — `NavBottom` replaces it at the
 * layout level, per docs/responsive.md.
 */
export const NavSide = React.forwardRef<HTMLElement, NavSideProps>(({ sections, expanded = true, isActive, renderLink, className }, ref) => {
  const { Link } = useComponents();
  const linkRenderer: RenderLinkFn = renderLink ?? (({ to, ...rest }) => <Link href={to} {...rest} />);
  return (
    <aside ref={ref} className={cn("flex flex-col bg-bg-brand-strong text-fg-on-brand-strong", expanded ? "w-48" : "w-16", className)}>
      <nav className="flex-1 overflow-y-auto py-3">
        {sections.map((section, sectionIndex) => (
          <div key={section.id}>
            {sectionIndex > 0 && <div className="my-2 border-border-subtle border-t" />}
            <ul className={cn("flex flex-col gap-0.5 px-3")}>
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavItem item={item} active={isActive(item)} expanded={expanded} renderLink={linkRenderer} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
});
NavSide.displayName = "NavSide";
