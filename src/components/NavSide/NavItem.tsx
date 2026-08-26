import { cn } from "@sixthshift/design-system/utils";
import type { NavItem as NavItemType, RenderLinkFn } from "./types";

export type NavItemProps = {
  item: NavItemType;
  active: boolean;
  expanded: boolean;
  renderLink: RenderLinkFn;
};

export const NavItem = ({ item, active, expanded, renderLink }: NavItemProps) => {
  const Icon = item.icon;

  return (
    <>
      {renderLink({
        to: item.to,
        className: cn(
          "flex items-center gap-3 rounded-md px-2 py-2 font-medium text-sm",
          "hover:bg-bg-brand-hovered hover:text-fg-on-brand-hovered",
          active && "bg-bg-brand-pressed text-fg-on-brand-pressed"
        ),
        // Only include title when collapsed (for tooltip)
        ...(expanded ? {} : { title: item.label }),
        children: (
          <>
            <Icon className="h-6 w-6 shrink-0" />
            {expanded && <span className="flex-1">{item.label}</span>}
            {expanded && item.badge !== undefined && item.badge > 0 && (
              <span className="flex min-w-5 items-center justify-center rounded-full bg-bg-on-brand/20 px-1.5 py-0.5 font-medium text-fg-on-brand text-xs tabular-nums">
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            )}
          </>
        ),
      })}
    </>
  );
};
