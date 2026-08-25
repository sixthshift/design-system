import type { ComponentType, ReactNode, SVGProps } from "react";

/**
 * Icon component type - compatible with lucide-react and similar icon libraries
 */
export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * A single navigation item
 */
export type NavItem = {
  /** Route path */
  to: string;
  /** Display label */
  label: string;
  /** Icon component (e.g., from lucide-react) */
  icon: IconComponent;
  /** Optional count badge (e.g. pending suggestions). Rendered when > 0. */
  badge?: number;
};

/**
 * A group of navigation items
 */
export type NavSection = {
  /** Unique identifier for the section */
  id: string;
  /** Navigation items in this section */
  items: NavItem[];
};

/**
 * Render function for navigation links.
 * Allows router-agnostic link rendering.
 */
export type RenderLinkFn = (props: { to: string; className: string; title?: string; children: ReactNode }) => ReactNode;
