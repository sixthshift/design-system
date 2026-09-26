/// <reference types="@testing-library/jest-dom" />
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DataTable, type DataTableColumn } from "./DataTable";

type Order = { id: string; customer: string; totalCents: number; pickup: string };

const ORDERS: Order[] = [
  { id: "o1", customer: "Mei", totalCents: 8500, pickup: "2026-10-03" },
  { id: "o2", customer: "arlo", totalCents: 4200, pickup: "2026-10-01" },
  { id: "o3", customer: "Zoe", totalCents: 12000, pickup: "2026-10-02" },
];

const COLUMNS: DataTableColumn<Order>[] = [
  { id: "customer", header: "Customer", cell: (o) => o.customer, sortValue: (o) => o.customer },
  { id: "pickup", header: "Pickup", cell: (o) => o.pickup, sortValue: (o) => o.pickup },
  { id: "total", header: "Total", cell: (o) => `$${o.totalCents / 100}`, sortValue: (o) => o.totalCents, align: "end" },
  { id: "notes", header: "Notes", cell: () => "—" },
];

/** First-column text of each body row, in rendered order. */
function customers(): string[] {
  const [, body] = screen.getAllByRole("rowgroup");
  return within(body!)
    .getAllByRole("row")
    .map((row) => within(row).getAllByRole("cell")[0]!.textContent ?? "");
}

describe("DataTable", () => {
  describe("rendering", () => {
    it("renders a header cell per column and a row per item", () => {
      render(<DataTable columns={COLUMNS} rows={ORDERS} getRowId={(o) => o.id} />);
      expect(screen.getAllByRole("columnheader").map((th) => th.textContent)).toEqual(["Customer", "Pickup", "Total", "Notes"]);
      expect(screen.getAllByRole("row")).toHaveLength(4);
      expect(customers()).toEqual(["Mei", "arlo", "Zoe"]);
    });

    it("forwards ref to the scrolling wrapper", () => {
      const ref = vi.fn();
      render(<DataTable columns={COLUMNS} rows={ORDERS} getRowId={(o) => o.id} ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });

    it("names the table with a caption, visually hidden by default", () => {
      const { rerender } = render(<DataTable columns={COLUMNS} rows={ORDERS} getRowId={(o) => o.id} caption="Today's orders" />);
      expect(screen.getByRole("table", { name: "Today's orders" })).toBeInTheDocument();
      expect(screen.getByText("Today's orders")).toHaveClass("sr-only");

      rerender(<DataTable columns={COLUMNS} rows={ORDERS} getRowId={(o) => o.id} caption="Today's orders" showCaption />);
      expect(screen.getByText("Today's orders")).not.toHaveClass("sr-only");
    });

    it("renders the empty state across every column", () => {
      render(<DataTable columns={COLUMNS} rows={[]} getRowId={(o) => o.id} empty="No orders for this day" />);
      const cell = screen.getByRole("cell", { name: "No orders for this day" });
      expect(cell).toHaveAttribute("colspan", "4");
    });

    it("applies alignment and width", () => {
      render(<DataTable columns={[{ ...COLUMNS[2]!, width: "8rem" }]} rows={ORDERS} getRowId={(o) => o.id} />);
      const header = screen.getByRole("columnheader");
      expect(header).toHaveClass("text-end");
      expect(header.style.width).toBe("8rem");
      expect(screen.getAllByRole("cell")[0]).toHaveClass("text-end");
    });

    it("renders a Row-typed column's cell content", () => {
      render(<DataTable columns={COLUMNS} rows={ORDERS} getRowId={(o) => o.id} />);
      expect(screen.getByRole("cell", { name: "$85" })).toBeInTheDocument();
    });
  });

  describe("sorting", () => {
    it("gives aria-sort only to sortable columns", () => {
      render(<DataTable columns={COLUMNS} rows={ORDERS} getRowId={(o) => o.id} />);
      const [customer, , , notes] = screen.getAllByRole("columnheader");
      expect(customer).toHaveAttribute("aria-sort", "none");
      expect(notes).not.toHaveAttribute("aria-sort");
      expect(within(notes!).queryByRole("button")).not.toBeInTheDocument();
    });

    it("cycles ascending, descending, unsorted", async () => {
      const user = userEvent.setup();
      render(<DataTable columns={COLUMNS} rows={ORDERS} getRowId={(o) => o.id} />);
      const button = screen.getByRole("button", { name: "Total" });
      const header = screen.getAllByRole("columnheader")[2];

      await user.click(button);
      expect(header).toHaveAttribute("aria-sort", "ascending");
      expect(customers()).toEqual(["arlo", "Mei", "Zoe"]);

      await user.click(button);
      expect(header).toHaveAttribute("aria-sort", "descending");
      expect(customers()).toEqual(["Zoe", "Mei", "arlo"]);

      await user.click(button);
      expect(header).toHaveAttribute("aria-sort", "none");
      expect(customers()).toEqual(["Mei", "arlo", "Zoe"]);
    });

    it("compares strings case-insensitively", async () => {
      const user = userEvent.setup();
      render(<DataTable columns={COLUMNS} rows={ORDERS} getRowId={(o) => o.id} />);
      await user.click(screen.getByRole("button", { name: "Customer" }));
      expect(customers()).toEqual(["arlo", "Mei", "Zoe"]);
    });

    it("starts ascending when switching to another column", async () => {
      const user = userEvent.setup();
      const onSortChange = vi.fn();
      render(
        <DataTable columns={COLUMNS} rows={ORDERS} getRowId={(o) => o.id} defaultSort={{ columnId: "total", direction: "desc" }} onSortChange={onSortChange} />
      );

      await user.click(screen.getByRole("button", { name: "Pickup" }));
      expect(onSortChange).toHaveBeenCalledWith({ columnId: "pickup", direction: "asc" });
      expect(customers()).toEqual(["arlo", "Zoe", "Mei"]);
    });

    it("reports but does not reorder with manualSorting", async () => {
      const user = userEvent.setup();
      const onSortChange = vi.fn();
      render(<DataTable columns={COLUMNS} rows={ORDERS} getRowId={(o) => o.id} manualSorting onSortChange={onSortChange} />);

      await user.click(screen.getByRole("button", { name: "Total" }));
      expect(onSortChange).toHaveBeenCalledWith({ columnId: "total", direction: "asc" });
      expect(screen.getAllByRole("columnheader")[2]).toHaveAttribute("aria-sort", "ascending");
      expect(customers()).toEqual(["Mei", "arlo", "Zoe"]);
    });

    it("follows a controlled sort", () => {
      render(<DataTable columns={COLUMNS} rows={ORDERS} getRowId={(o) => o.id} sort={{ columnId: "pickup", direction: "desc" }} onSortChange={() => {}} />);
      expect(customers()).toEqual(["Mei", "Zoe", "arlo"]);
    });

    it("does not mutate the rows passed in", async () => {
      const user = userEvent.setup();
      const rows = [...ORDERS];
      render(<DataTable columns={COLUMNS} rows={rows} getRowId={(o) => o.id} />);
      await user.click(screen.getByRole("button", { name: "Total" }));
      expect(rows).toEqual(ORDERS);
    });
  });

  describe("onRowClick", () => {
    it("leaves rows inert without it", () => {
      render(<DataTable columns={COLUMNS} rows={ORDERS} getRowId={(o) => o.id} />);
      expect(screen.getAllByRole("row")[1]).not.toHaveAttribute("tabindex");
    });

    it("activates a row by click, Enter and Space", async () => {
      const user = userEvent.setup();
      const onRowClick = vi.fn();
      render(<DataTable columns={COLUMNS} rows={ORDERS} getRowId={(o) => o.id} onRowClick={onRowClick} />);
      const row = screen.getAllByRole("row")[2]!;
      expect(row).toHaveAttribute("tabindex", "0");

      await user.click(within(row).getAllByRole("cell")[0]!);
      expect(onRowClick).toHaveBeenLastCalledWith(ORDERS[1]);

      row.focus();
      await user.keyboard("{Enter}");
      await user.keyboard(" ");
      expect(onRowClick).toHaveBeenCalledTimes(3);
    });

    it("leaves keys pressed on a control inside the row to that control", async () => {
      const user = userEvent.setup();
      const onRowClick = vi.fn();
      const columns: DataTableColumn<Order>[] = [
        {
          id: "action",
          header: "Action",
          cell: () => (
            <button type="button" onClick={(event) => event.stopPropagation()}>
              Mark ready
            </button>
          ),
        },
      ];
      render(<DataTable columns={columns} rows={ORDERS.slice(0, 1)} getRowId={(o) => o.id} onRowClick={onRowClick} />);

      screen.getByRole("button", { name: "Mark ready" }).focus();
      await user.keyboard("{Enter}");
      expect(onRowClick).not.toHaveBeenCalled();
    });
  });
});
