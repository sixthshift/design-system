import { useComponents } from "@sixthshift/design-system/components";
import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";
import type { NavItem as NavItemType, NavSection, RenderLinkFn } from "../NavSide";

export type NavBottomProps = {
  /** Navigation sections (will be flattened) */
  sections: NavSection[];
  /** Callback to determine if an item is active */
  isActive: (item: NavItemType) => boolean;
  /** Render function for links (allows router integration). Falls back to ComponentsContext Link. */
  renderLink?: RenderLinkFn;
  /** Maximum number of items to display (default: 5) */
  maxItems?: number;
  /** Additional class names */
  className?: string;
};

export const NavBottom = React.forwardRef<HTMLElement, NavBottomProps>(({ sections, isActive, renderLink, maxItems = 5, className }, ref) => {
  const { Link } = useComponents();
  const linkRenderer: RenderLinkFn = renderLink ?? (({ to, ...rest }) => <Link href={to} {...rest} />);
  // Flatten all sections and limit to maxItems
  const items = sections.flatMap((section) => section.items).slice(0, maxItems);

  return (
    <nav ref={ref} className={cn("fixed inset-x-0 bottom-0 z-app-bar bg-bg-brand-strong text-fg-on-brand-strong", className)}>
      <ul className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <li key={item.to}>
              {linkRenderer({
                to: item.to,
                className: cn(
                  "flex flex-col items-center gap-1 rounded-md px-3 py-2 text-xs",
                  "hover:bg-bg-brand-hovered hover:text-fg-on-brand-hovered",
                  active && "bg-bg-brand-pressed"
                ),
                children: (
                  <>
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </>
                ),
              })}
            </li>
          );
        })}
      </ul>
    </nav>
  );
});
NavBottom.displayName = "NavBottom";
