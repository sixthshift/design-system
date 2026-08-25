import { Button } from "@sixthshift/design-system/button";
import { Select, type SelectOption } from "@sixthshift/design-system/select";
import { cn } from "@sixthshift/design-system/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export type PaginationProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Current page index (0-based) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of items */
  total: number;
  /** Called when page changes */
  onPageChange: (page: number) => void;
  /** Called when page size changes */
  onPageSizeChange: (size: number) => void;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Label for rows per page (default: "Rows per page") */
  rowsLabel?: string;
};

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  (
    { page, pageSize, total, onPageChange, onPageSizeChange, pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS, rowsLabel = "Rows per page", className, ...props },
    ref
  ) => {
    const start = total > 0 ? page * pageSize + 1 : 0;
    const end = Math.min((page + 1) * pageSize, total);
    const totalPages = Math.ceil(total / pageSize);

    const canGoPrev = page > 0;
    const canGoNext = page < totalPages - 1;

    const selectOptions: SelectOption<string>[] = pageSizeOptions.map((size) => ({
      value: String(size),
      label: String(size),
    }));

    const handlePageSizeChange = (value: string) => {
      onPageSizeChange(Number(value));
      onPageChange(0);
    };

    return (
      <div ref={ref} className={cn("flex items-center justify-between gap-4 px-4 py-2", className)} {...props}>
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-fg-subtle text-sm">{rowsLabel}</span>
          <Select value={String(pageSize)} options={selectOptions} onValueChange={handlePageSizeChange} className="w-20" />
        </div>

        {/* Results info */}
        <span className="text-fg-subtle text-sm">
          {total > 0 ? (
            <>
              <span className="font-medium text-fg-normal">{start}</span>
              {"-"}
              <span className="font-medium text-fg-normal">{end}</span>
              {" of "}
              <span className="font-medium text-fg-normal">{total}</span>
            </>
          ) : (
            "No results"
          )}
        </span>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => onPageChange(page - 1)} disabled={!canGoPrev} aria-label="Previous page">
            <ChevronLeft />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onPageChange(page + 1)} disabled={!canGoNext} aria-label="Next page">
            <ChevronRight />
          </Button>
        </div>
      </div>
    );
  }
);
Pagination.displayName = "Pagination";

export { Pagination };
