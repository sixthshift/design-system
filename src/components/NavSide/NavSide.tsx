import { useComponents } from "@sixthshift/design-system/components";
import { cn } from "@sixthshift/design-system/utils";
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

export const NavSide = ({ sections, expanded = true, isActive, renderLink, className }: NavSideProps) => {
  const { Link } = useComponents();
  const linkRenderer: RenderLinkFn = renderLink ?? (({ to, ...rest }) => <Link href={to} {...rest} />);
  return (
    <aside className={cn("flex flex-col bg-bg-brand-strong text-fg-on-brand-strong", expanded ? "w-48" : "w-16", className)}>
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
};
