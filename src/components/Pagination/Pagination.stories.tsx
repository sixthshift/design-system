import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Pagination } from "./Pagination";

const meta: Meta<typeof Pagination> = {
  title: "Components/Navigation/Pagination",
  component: Pagination,
  parameters: {
    layout: "padded",
    docs: { subtitle: "Controlled page navigation with a rows-per-page selector" },
  },
  tags: ["autodocs"],
  argTypes: {
    page: {
      control: { type: "number", min: 0 },
      description: "Current page index (0-based)",
    },
    pageSize: {
      control: "select",
      options: [10, 25, 50, 100],
      description: "Number of items per page",
    },
    total: {
      control: { type: "number", min: 0 },
      description: "Total number of items",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

// Interactive wrapper to manage state
const PaginationWithState = ({ initialPage = 0, initialPageSize = 50, total = 200 }: { initialPage?: number; initialPageSize?: number; total?: number }) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  return (
    <div className="w-full max-w-3xl rounded-lg border border-border-normal">
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={setPageSize} />
    </div>
  );
};

export const Default: Story = {
  render: () => <PaginationWithState />,
};

export const FirstPage: Story = {
  render: () => <PaginationWithState initialPage={0} total={200} />,
  parameters: {
    docs: {
      description: {
        story: "On the first page, the previous button is disabled.",
      },
    },
  },
};

export const MiddlePage: Story = {
  render: () => <PaginationWithState initialPage={2} total={200} />,
  parameters: {
    docs: {
      description: {
        story: "On a middle page, both navigation buttons are enabled.",
      },
    },
  },
};

export const LastPage: Story = {
  render: () => <PaginationWithState initialPage={3} initialPageSize={50} total={200} />,
  parameters: {
    docs: {
      description: {
        story: "On the last page, the next button is disabled.",
      },
    },
  },
};

export const SmallDataset: Story = {
  render: () => <PaginationWithState initialPage={0} initialPageSize={50} total={25} />,
  parameters: {
    docs: {
      description: {
        story: "When total items fit on one page, both navigation buttons are disabled.",
      },
    },
  },
};

export const EmptyState: Story = {
  render: () => <PaginationWithState initialPage={0} total={0} />,
  parameters: {
    docs: {
      description: {
        story: "When there are no results, shows 'No results' message.",
      },
    },
  },
};

export const LargeDataset: Story = {
  render: () => <PaginationWithState initialPage={0} initialPageSize={10} total={1000} />,
  parameters: {
    docs: {
      description: {
        story: "Handles large datasets with many pages.",
      },
    },
  },
};
