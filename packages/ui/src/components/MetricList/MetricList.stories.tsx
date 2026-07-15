import type { Meta, StoryObj } from "@storybook/react";
import { MetricList, MetricRow } from ".";

const meta: Meta<typeof MetricList> = {
  title: "Components/Data/MetricList",
  component: MetricList,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MetricList>;

export const Default: Story = {
  render: () => (
    <div className="w-80 rounded border border-border-subtle bg-bg-subtle p-4">
      <h3 className="mb-3 text-fg-normal">Process Metrics</h3>
      <MetricList>
        <MetricRow label="CPU Usage" value="12.5%" />
        <MetricRow label="Memory" value="245.32 MB" />
        <MetricRow label="Uptime" value="2d 5h 30m" />
        <MetricRow label="Node.js" value="v20.11.0" />
      </MetricList>
    </div>
  ),
};

export const WithVariants: Story = {
  render: () => (
    <div className="w-80 rounded border border-border-subtle bg-bg-subtle p-4">
      <h3 className="mb-3 text-fg-normal">Server Health</h3>
      <MetricList>
        <MetricRow label="Requests/min" value="127" valueVariant="normal" />
        <MetricRow label="Response Time" value="42ms" valueVariant="success" />
        <MetricRow label="Error Rate" value="0.02%" valueVariant="success" />
        <MetricRow label="Warnings" value="2 active" valueVariant="warning" />
      </MetricList>
    </div>
  ),
};

export const WithStatusIndicators: Story = {
  render: () => (
    <div className="w-80 rounded border border-border-subtle bg-bg-subtle p-4">
      <h3 className="mb-3 text-fg-normal">Workers</h3>
      <MetricList>
        <MetricRow label="Queue Consumer" value="running" valueVariant="success" />
        <MetricRow label="Processing Rate" value="45.32 jobs/min" />
        <MetricRow label="Worker Memory" value="128.45 MB" />
      </MetricList>
    </div>
  ),
};

export const WithComplexValues: Story = {
  render: () => (
    <div className="w-96 rounded border border-border-subtle bg-bg-subtle p-4">
      <h3 className="mb-3 text-fg-normal">Storage</h3>
      <MetricList>
        <MetricRow label="Disk Used" value="45.23 GB (45.2%)" />
        <MetricRow label="Disk Available" value="54.77 GB" />
        <MetricRow label="Disk Total" value="100.00 GB" />
        <MetricRow label="Database Size" value="2.34 GB" />
      </MetricList>
    </div>
  ),
};

export const WithErrorState: Story = {
  render: () => (
    <div className="w-80 rounded border border-border-subtle bg-bg-subtle p-4">
      <h3 className="mb-3 text-fg-normal">System Status</h3>
      <MetricList>
        <MetricRow label="API Status" value="Healthy" valueVariant="success" />
        <MetricRow label="Database" value="Connected" valueVariant="success" />
        <MetricRow label="Cache" value="Degraded" valueVariant="warning" />
        <MetricRow label="Queue" value="3 Failed" valueVariant="danger" />
      </MetricList>
    </div>
  ),
};

export const MultipleCards: Story = {
  render: () => (
    <div className="grid w-[800px] grid-cols-2 gap-4">
      <div className="rounded border border-border-subtle bg-bg-subtle p-4">
        <h3 className="mb-3 text-fg-normal">Process</h3>
        <MetricList>
          <MetricRow label="CPU Usage" value="12.5%" />
          <MetricRow label="Memory (Heap)" value="245.32 MB / 512.00 MB (47.9%)" />
          <MetricRow label="Memory (RSS)" value="312.45 MB" />
          <MetricRow label="Uptime" value="2d 5h 30m" />
        </MetricList>
      </div>

      <div className="rounded border border-border-subtle bg-bg-subtle p-4">
        <h3 className="mb-3 text-fg-normal">Server</h3>
        <MetricList>
          <MetricRow label="Requests/min" value="127" />
          <MetricRow label="Avg Response Time" value="42ms" />
          <MetricRow label="Error Rate" value="0.02%" />
          <MetricRow label="Active Connections" value="8" />
        </MetricList>
      </div>
    </div>
  ),
};

export const SimpleList: Story = {
  render: () => (
    <MetricList className="w-64">
      <MetricRow label="Total" value="1,247" />
      <MetricRow label="Active" value="892" />
      <MetricRow label="Completed" value="355" />
    </MetricList>
  ),
};

export const WithReactNodeValues: Story = {
  render: () => (
    <div className="w-80 rounded border border-border-subtle bg-bg-subtle p-4">
      <h3 className="mb-3 text-fg-normal">Integration Status</h3>
      <MetricList>
        <MetricRow
          label="Google Calendar"
          value={
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span className="text-fg-normal">Connected</span>
            </div>
          }
        />
        <MetricRow
          label="GitHub"
          value={
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span className="text-fg-normal">Stale</span>
            </div>
          }
        />
        <MetricRow
          label="Notion"
          value={
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <span className="text-fg-danger">Error</span>
            </div>
          }
        />
      </MetricList>
    </div>
  ),
};
