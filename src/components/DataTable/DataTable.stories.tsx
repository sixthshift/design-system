import { Badge } from "@sixthshift/design-system/badge";
import { Button } from "@sixthshift/design-system/button";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { componentTokensStory } from "../../stories/component-tokens/componentTokensStory";
import { DataTable, type DataTableColumn, type DataTableSort } from "./DataTable";

type Order = {
  id: string;
  number: string;
  customer: string;
  status: "paid" | "ready" | "collected" | "cancelled";
  due: string;
  totalCents: number;
};

const ORDERS: Order[] = [
  { id: "1", number: "#1042", customer: "Mei Tanaka", status: "paid", due: "2026-10-03", totalCents: 8500 },
  { id: "2", number: "#1043", customer: "Arlo Whitfield", status: "ready", due: "2026-10-01", totalCents: 4200 },
  { id: "3", number: "#1044", customer: "Zoë Okafor", status: "collected", due: "2026-09-28", totalCents: 12000 },
  { id: "4", number: "#1045", customer: "Priya Raman", status: "cancelled", due: "2026-10-02", totalCents: 6400 },
  { id: "5", number: "#1046", customer: "Sam Lee", status: "paid", due: "2026-10-05", totalCents: 9900 },
];

const STATUS_INTENT = { paid: "brand", ready: "success", collected: "neutral", cancelled: "danger" } as const;

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const COLUMNS: DataTableColumn<Order>[] = [
  { id: "number", header: "Order", cell: (o) => <span className="font-medium">{o.number}</span>, width: "6rem" },
  { id: "customer", header: "Customer", cell: (o) => o.customer, sortValue: (o) => o.customer },
  {
    id: "status",
    header: "Status",
    cell: (o) => (
      <Badge variant="soft" intent={STATUS_INTENT[o.status]} className="capitalize">
        {o.status}
      </Badge>
    ),
    sortValue: (o) => o.status,
  },
  { id: "due", header: "Due", cell: (o) => o.due, sortValue: (o) => o.due },
  { id: "total", header: "Total", cell: (o) => money(o.totalCents), sortValue: (o) => o.totalCents, align: "end", className: "tabular-nums" },
];

const meta: Meta<typeof DataTable<Order>> = {
  title: "Components/DataTable",
  component: DataTable,
  parameters: {
    layout: "padded",
    docs: { subtitle: "Sortable, clickable rows of uniform data" },
  },
  tags: ["autodocs"],
  args: { columns: COLUMNS, rows: ORDERS, getRowId: (o: Order) => o.id, caption: "Orders" },
};

export default meta;
type Story = StoryObj<typeof DataTable<Order>>;

/** Sorting cycles ascending → descending → unsorted, and `aria-sort` follows. */
export const SortPlay: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByRole("columnheader", { name: "Total" });
    const firstCustomer = () => within(canvas.getAllByRole("row")[1]!).getAllByRole("cell")[1]!.textContent;

    await userEvent.click(within(header).getByRole("button"));
    await expect(header).toHaveAttribute("aria-sort", "ascending");
    await expect(firstCustomer()).toBe("Arlo Whitfield");

    await userEvent.click(within(header).getByRole("button"));
    await expect(header).toHaveAttribute("aria-sort", "descending");
    await expect(firstCustomer()).toBe("Zoë Okafor");
  },
};

export const Default: Story = {};

/** Both densities, one sorted, so the header's sorted and unsorted icons are both in frame. */
export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <DataTable {...args} size="sm" caption="Small" defaultSort={{ columnId: "due", direction: "asc" }} />
      <DataTable {...args} size="md" caption="Medium" />
    </div>
  ),
};

export const Empty: Story = {
  args: { rows: [], empty: "No orders for this day" },
};

export const ClickableRows: Story = {
  render: function ClickableRowsStory(args) {
    const [selected, setSelected] = useState<Order | null>(null);
    return (
      <div className="flex flex-col gap-3">
        <DataTable {...args} onRowClick={setSelected} />
        <p className="text-fg-subtle text-sm">{selected ? `Opened ${selected.number}` : "Click a row"}</p>
      </div>
    );
  },
};

/** A control inside a clickable row keeps its own click and keys. */
export const WithRowActions: Story = {
  args: {
    columns: [
      ...COLUMNS,
      {
        id: "actions",
        header: <span className="sr-only">Actions</span>,
        align: "end",
        cell: (o) =>
          o.status === "paid" ? (
            <Button size="xs" variant="outline" onClick={(event) => event.stopPropagation()}>
              Mark ready
            </Button>
          ) : null,
      },
    ],
    onRowClick: () => {},
  },
};

/** Server-side sorting: the table reports the sort and renders `rows` as given. */
export const ManualSorting: Story = {
  render: function ManualSortingStory(args) {
    const [sort, setSort] = useState<DataTableSort | null>(null);
    return (
      <div className="flex flex-col gap-3">
        <DataTable {...args} manualSorting sort={sort} onSortChange={setSort} />
        <p className="text-fg-subtle text-sm">Fetch with: {sort ? `order=${sort.columnId}.${sort.direction}` : "no order"}</p>
      </div>
    );
  },
};

export const StickyHeader: Story = {
  args: {
    rows: Array.from({ length: 20 }, (_, i) => ({ ...ORDERS[i % ORDERS.length]!, id: String(i), number: `#${1042 + i}` })),
    stickyHeader: true,
    className: "max-h-80",
  },
};

export const ComponentTokens = componentTokensStory("data-table");
