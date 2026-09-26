"use client";

import { useControllableState } from "@sixthshift/design-system/hooks";
import { cn } from "@sixthshift/design-system/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { forwardRef, type HTMLAttributes, type KeyboardEvent, type ReactElement, type ReactNode, type Ref, useMemo } from "react";

/**
 * Geometry only. Every colour reads a `--data-table-*` component token whose
 * value is decided by src/components/DataTable/data-table.recipe.css.
 *
 * `size` is cell density: `sm` for back-office lists scanned dozens of rows at
 * a time, `md` for tables that are the page's main content.
 */
const cellVariants = cva("px-3 align-middle", {
  variants: {
    size: {
      sm: "h-9 py-1.5 text-xs",
      md: "h-11 py-2 text-sm",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type DataTableSize = NonNullable<VariantProps<typeof cellVariants>["size"]>;

export type DataTableAlign = "start" | "center" | "end";

export type DataTableColumn<Row> = {
  /** Stable key — also what `sort.columnId` refers to. */
  id: string;
  /** Header content. */
  header: ReactNode;
  /** Cell content for one row. */
  cell: (row: Row) => ReactNode;
  /**
   * Makes the column sortable. The returned value is what rows are compared
   * by — return cents, not a formatted price, and an ISO date, not "Tue 3rd".
   */
  sortValue?: (row: Row) => string | number;
  /** Text alignment for header and cells. Numbers read best at `end`. */
  align?: DataTableAlign;
  /** A CSS width for the column, e.g. `"8rem"` or `"20%"`. */
  width?: string;
  /** Extra classes for this column's `<td>`s. */
  className?: string;
};

export type DataTableSortDirection = "asc" | "desc";

export type DataTableSort = {
  columnId: string;
  direction: DataTableSortDirection;
};

export type DataTableProps<Row> = Omit<HTMLAttributes<HTMLDivElement>, "children"> &
  VariantProps<typeof cellVariants> & {
    columns: readonly DataTableColumn<Row>[];
    rows: readonly Row[];
    /** Stable id per row, used as the React key. */
    getRowId: (row: Row) => string;
    /** Controlled sort. `null` is unsorted — rows in the order given. */
    sort?: DataTableSort | null;
    /** Initial sort in uncontrolled mode. */
    defaultSort?: DataTableSort | null;
    /** Called when a header is clicked: ascending, then descending, then unsorted. */
    onSortChange?: (sort: DataTableSort | null) => void;
    /**
     * Report sort changes without reordering `rows`, for data sorted where it
     * is fetched. The headers still show the sort state.
     */
    manualSorting?: boolean;
    /** Makes every row activatable by pointer, `Enter` or `Space`. */
    onRowClick?: (row: Row) => void;
    /** Shown in place of the body when `rows` is empty. */
    empty?: ReactNode;
    /** Names the table for assistive tech. Visually hidden unless `showCaption`. */
    caption?: ReactNode;
    showCaption?: boolean;
    /** Keep the header row visible while the wrapper scrolls vertically. Give the wrapper a height via `className`. */
    stickyHeader?: boolean;
  };

const alignClass: Record<DataTableAlign, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

const ariaSort = { asc: "ascending", desc: "descending" } as const;

function nextSort(current: DataTableSort | null, columnId: string): DataTableSort | null {
  if (current?.columnId !== columnId) return { columnId, direction: "asc" };
  return current.direction === "asc" ? { columnId, direction: "desc" } : null;
}

function compare(a: string | number, b: string | number): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

/**
 * `forwardRef` erases the generic, so the implementation takes the ref as an
 * argument and the export below restores `<Row>` — the same arrangement
 * Select.tsx uses for `<T>`.
 */
const DataTableRoot = forwardRef(function DataTableRoot<Row>(
  {
    className,
    columns,
    rows,
    getRowId,
    size = "md",
    sort: controlledSort,
    defaultSort = null,
    onSortChange,
    manualSorting = false,
    onRowClick,
    empty,
    caption,
    showCaption = false,
    stickyHeader = false,
    ...props
  }: DataTableProps<Row>,
  ref: Ref<HTMLDivElement>
) {
  const [sort, setSort] = useControllableState<DataTableSort | null>({
    value: controlledSort,
    defaultValue: defaultSort,
    onChange: onSortChange,
  });

  const sortedRows = useMemo(() => {
    if (manualSorting || sort === null) return rows;
    const sortValue = columns.find((column) => column.id === sort.columnId)?.sortValue;
    if (!sortValue) return rows;
    const factor = sort.direction === "asc" ? 1 : -1;
    // Array.prototype.sort is stable, so equal keys keep the caller's order.
    return [...rows].sort((a, b) => factor * compare(sortValue(a), sortValue(b)));
  }, [rows, columns, sort, manualSorting]);

  const interactive = onRowClick !== undefined;

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, row: Row) => {
    if (event.target !== event.currentTarget) return; // a button inside the row keeps its own keys
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRowClick?.(row);
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "data-table border-(color:--data-table-border) w-full overflow-auto rounded-lg border bg-(--data-table-bg) text-(--data-table-fg)",
        className
      )}
      {...props}
    >
      <table className="w-full border-collapse">
        {caption !== undefined && <caption className={cn(showCaption ? "px-3 py-2 text-start font-medium text-sm" : "sr-only")}>{caption}</caption>}
        <thead className={cn("bg-(--data-table-header-bg)", stickyHeader && "sticky top-0 z-10")}>
          <tr className="border-(color:--data-table-border) border-b">
            {columns.map((column) => {
              const align = column.align ?? "start";
              const sorted = sort?.columnId === column.id ? sort.direction : undefined;
              const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown;
              return (
                <th
                  key={column.id}
                  scope="col"
                  aria-sort={column.sortValue ? (sorted ? ariaSort[sorted] : "none") : undefined}
                  style={column.width ? { width: column.width } : undefined}
                  className={cn(cellVariants({ size }), alignClass[align], "whitespace-nowrap font-medium text-(--data-table-header-fg)")}
                >
                  {column.sortValue ? (
                    <button
                      type="button"
                      onClick={() => setSort(nextSort(sort, column.id))}
                      className={cn(
                        "focus-visible:ring-(color:--data-table-ring) -mx-1 inline-flex cursor-pointer items-center gap-1 rounded-sm px-1 hover:text-(--data-table-fg) focus-visible:outline-hidden focus-visible:ring-2",
                        align === "end" && "flex-row-reverse"
                      )}
                    >
                      {column.header}
                      <Icon aria-hidden="true" className={cn("size-3.5 shrink-0", sorted === undefined && "opacity-50")} />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-10 text-center text-(--data-table-empty-fg) text-sm">
                {empty ?? "Nothing to show"}
              </td>
            </tr>
          ) : (
            sortedRows.map((row) => (
              <tr
                key={getRowId(row)}
                data-interactive={interactive || undefined}
                onClick={interactive ? () => onRowClick(row) : undefined}
                onKeyDown={interactive ? (event) => handleRowKeyDown(event, row) : undefined}
                // A row is not a native control, but a clickable table row is the
                // established back-office pattern. It stays a `row` so the table
                // semantics survive, and gains a tab stop and Enter/Space like
                // Card does when it is clickable.
                tabIndex={interactive ? 0 : undefined}
                className={cn(
                  "border-(color:--data-table-border) border-b last:border-b-0",
                  interactive &&
                    "focus-visible:outline-(color:--data-table-ring) cursor-pointer hover:bg-(--data-table-row-bg-hovered) focus-visible:outline-2 focus-visible:-outline-offset-2"
                )}
              >
                {columns.map((column) => (
                  <td key={column.id} className={cn(cellVariants({ size }), alignClass[column.align ?? "start"], column.className)}>
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
});

/**
 * A data table for back-office lists — orders, products, customers.
 *
 * Props-based, per docs/component-api-design.md: rows are uniform, so they
 * arrive as a `rows` array and a `columns` config, and each column's `cell`
 * renders one row's content. Anything interactive in a cell — a status
 * Badge, an action Button — is just what `cell` returns.
 *
 * A column with `sortValue` gets a header button cycling ascending →
 * descending → unsorted, and `aria-sort` on its `<th>`. Sorting is
 * client-side and stable; pass `manualSorting` to only report the change when
 * the data is sorted where it is fetched. Sort state is controlled or
 * uncontrolled through `sort`/`defaultSort`/`onSortChange`.
 *
 * `onRowClick` makes every row a tab stop activated by pointer, `Enter` or
 * `Space` — keys pressed on a control inside the row are left to that control.
 *
 * The wrapper scrolls, so a wide table on a phone scrolls sideways inside its
 * border rather than widening the page.
 */
export const DataTable = DataTableRoot as <Row>(props: DataTableProps<Row> & { ref?: Ref<HTMLDivElement> }) => ReactElement;

export { cellVariants as dataTableCellVariants };
