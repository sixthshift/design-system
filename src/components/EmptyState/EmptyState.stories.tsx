import { Button } from "@sixthshift/design-system/button";
import type { Meta, StoryObj } from "@storybook/react";
import { AlertCircle, Database, FileQuestion, Inbox, Search, ServerOff } from "lucide-react";
import { EmptyState } from ".";

const meta: Meta<typeof EmptyState> = {
  title: "Components/Data/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "centered",
    docs: { subtitle: "A centered placeholder for a list or page with no data" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    message: "No items found",
  },
};

export const WithIcon: Story = {
  args: {
    icon: <Inbox className="h-8 w-8" />,
    message: "No items to display",
  },
};

export const WithDescription: Story = {
  args: {
    icon: <Search className="h-8 w-8" />,
    message: "No results found",
    description: "Try adjusting your search or filter criteria",
  },
};

export const WithAction: Story = {
  args: {
    icon: <Inbox className="h-8 w-8" />,
    message: "No tasks yet",
    description: "Get started by creating your first task",
    action: <Button size="sm">Create Task</Button>,
  },
};

export const DatabaseEmpty: Story = {
  render: () => (
    <div className="w-[600px] rounded border border-border-subtle bg-bg-subtle p-8">
      <EmptyState
        icon={<Database className="h-10 w-10" />}
        message="Execute a query to see results"
        description="Write and run SQL queries in the editor above"
      />
    </div>
  ),
};

export const NoJobs: Story = {
  render: () => <EmptyState icon={<Inbox className="h-8 w-8" />} message="No failed jobs" description="All jobs are processing successfully" />,
};

export const ServerError: Story = {
  render: () => (
    <EmptyState
      icon={<ServerOff className="h-10 w-10 text-fg-danger" />}
      message="Unable to connect to server"
      description="Check your connection and try again"
      action={
        <Button size="sm" variant="outline">
          Retry
        </Button>
      }
    />
  ),
};

export const NotFound: Story = {
  render: () => (
    <EmptyState
      icon={<FileQuestion className="h-10 w-10" />}
      message="Page not found"
      description="The page you're looking for doesn't exist"
      action={
        <Button size="sm" variant="solid">
          Go Home
        </Button>
      }
    />
  ),
};

export const NoSearchResults: Story = {
  render: () => (
    <EmptyState icon={<Search className="h-8 w-8" />} message="No results for 'quantum physics'" description="Try different keywords or check your spelling" />
  ),
};

export const Warning: Story = {
  render: () => (
    <EmptyState
      icon={<AlertCircle className="h-8 w-8 text-fg-warning" />}
      message="No data available"
      description="This feature requires additional configuration"
      action={
        <Button size="sm" variant="outline">
          Configure Now
        </Button>
      }
    />
  ),
};

export const MinimalMessage: Story = {
  render: () => (
    <div className="w-[400px] rounded border border-border-subtle bg-bg-subtle py-8">
      <EmptyState message="No items" />
    </div>
  ),
};

export const InPanel: Story = {
  render: () => (
    <div className="h-64 w-96 rounded border border-border-subtle bg-bg-subtle">
      <EmptyState className="h-full" icon={<Inbox className="h-6 w-6" />} message="Select a queue to view jobs" />
    </div>
  ),
};

export const LargeLayout: Story = {
  render: () => (
    <div className="h-96 w-[800px] rounded border border-border-subtle bg-bg-subtle">
      <EmptyState
        className="h-full"
        icon={<Database className="h-12 w-12" />}
        message="No entities found"
        description="Start by importing data from an integration or create entities manually"
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Import Data
            </Button>
            <Button size="sm" variant="solid">
              Create Entity
            </Button>
          </div>
        }
      />
    </div>
  ),
};

export const CompactInCard: Story = {
  render: () => (
    <div className="w-80 rounded border border-border-subtle bg-bg-subtle p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-fg-normal">Recent Activity</h3>
        <Button size="sm" variant="ghost">
          View All
        </Button>
      </div>
      <EmptyState className="py-6" icon={<Inbox className="h-5 w-5" />} message="No recent activity" />
    </div>
  ),
};
