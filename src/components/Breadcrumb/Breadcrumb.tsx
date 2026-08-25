import { useComponents } from "@sixthshift/design-system/components";
import { cn } from "@sixthshift/design-system/utils";
import { ChevronRight } from "lucide-react";
import { type ComponentPropsWithoutRef, forwardRef, type ReactNode } from "react";

export type BreadcrumbItem = {
  label: ReactNode;
  href?: string;
};

export type BreadcrumbProps = Omit<ComponentPropsWithoutRef<"nav">, "children"> & {
  items: BreadcrumbItem[];
};

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(({ className, items, ...props }, ref) => {
  const { Link } = useComponents();

  if (items.length === 0) return null;

  return (
    <nav ref={ref} aria-label="breadcrumb" className={cn("", className)} {...props}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm sm:gap-2.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isClickable = !isLast && item.href;

          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: Breadcrumb path items maintain stable order
            <li key={index} className="inline-flex items-center gap-1.5">
              {isClickable ? (
                <Link href={item.href!} className="text-fg-subtle transition-colors hover:text-fg-normal">
                  {item.label}
                </Link>
              ) : (
                <span className={cn(isLast ? "font-medium text-fg-normal" : "text-fg-subtle")} aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="size-3.5 text-fg-subtle" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});
Breadcrumb.displayName = "Breadcrumb";
