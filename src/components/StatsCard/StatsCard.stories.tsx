import type { Meta, StoryObj } from "@storybook/react";
import { Activity, AlertCircle, Database, Plug, TrendingUp, Zap } from "lucide-react";
import { StatsCard } from ".";

const meta: Meta<typeof StatsCard> = {
  title: "Components/Data/StatsCard",
  component: StatsCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["healthy", "warning", "error", "neutral"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatsCard>;

export const Neutral: Story = {
  render: () => (
    <StatsCard title="database" description="Tables and queries" icon={<Database className="h-4 w-4" />} status="neutral">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="font-semibold text-2xl text-fg-normal">0</span>
          <span className="text-fg-subtle text-xs">entities</span>
        </div>
        <span className="text-fg-subtle text-xs">No data yet</span>
      </div>
    </StatsCard>
  ),
};

export const Healthy: Story = {
  render: () => (
    <StatsCard title="database" description="Tables and queries" icon={<Database className="h-4 w-4" />} status="healthy">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="font-semibold text-2xl text-fg-normal">1,247</span>
          <span className="text-fg-subtle text-xs">+12 today</span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-fg-subtle">Tasks:</span>
            <span className="font-medium text-fg-normal">342</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-fg-subtle">Events:</span>
            <span className="font-medium text-fg-normal">89</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-fg-subtle">Notes:</span>
            <span className="font-medium text-fg-normal">816</span>
          </div>
        </div>
      </div>
    </StatsCard>
  ),
};

export const Warning: Story = {
  render: () => (
    <StatsCard title="integrations" description="Connection status" icon={<Plug className="h-4 w-4" />} status="warning">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="font-semibold text-2xl text-fg-normal">4</span>
          <span className="text-fg-subtle text-xs">of 5 enabled</span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="text-fg-normal">3 healthy</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span className="text-fg-normal">1 stale</span>
          </div>
        </div>
      </div>
    </StatsCard>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <StatsCard title="system" description="Health and metrics" icon={<Activity className="h-4 w-4" />} status="error">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="font-medium text-fg-normal text-lg">3 errors</span>
          </div>
          <span className="text-fg-subtle text-xs">up 2d 5h</span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-fg-subtle">Queue:</span>
            <span className="font-medium text-fg-normal">12 jobs</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-fg-subtle">Failed:</span>
            <span className="font-medium text-fg-danger">3</span>
          </div>
        </div>
      </div>
    </StatsCard>
  ),
};

export const WithActivityMetrics: Story = {
  render: () => (
    <StatsCard title="events" description="Event stream" icon={<Zap className="h-4 w-4" />} status="healthy">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="font-semibold text-2xl text-fg-normal">1,842</span>
          <span className="text-fg-subtle text-xs">last 24h</span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-fg-subtle">Syncs completed:</span>
            <span className="font-medium text-fg-normal">52</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-fg-subtle">Created:</span>
            <span className="font-medium text-fg-normal">89</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-fg-subtle">Updated:</span>
            <span className="font-medium text-fg-normal">234</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <span className="text-fg-subtle">2 clients connected</span>
        </div>
      </div>
    </StatsCard>
  ),
};

export const LoadingState: Story = {
  render: () => (
    <StatsCard title="system" description="Health and metrics" icon={<Activity className="h-4 w-4" />}>
      <div className="flex h-20 items-center justify-center text-fg-subtle">Loading...</div>
    </StatsCard>
  ),
};

export const MinimalContent: Story = {
  render: () => (
    <StatsCard title="performance" description="Response times" icon={<TrendingUp className="h-4 w-4" />} status="healthy">
      <div className="font-semibold text-2xl text-fg-normal">42ms</div>
      <div className="mt-1 text-fg-subtle text-xs">Average response time</div>
    </StatsCard>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <StatsCard title="alerts" description="System notifications" icon={<AlertCircle className="h-4 w-4" />} status="warning">
      <div className="flex items-center gap-2">
        <span className="font-bold text-3xl text-fg-normal">2</span>
        <span className="text-fg-subtle text-sm">warnings require attention</span>
      </div>
    </StatsCard>
  ),
};

export const Grid: Story = {
  render: () => (
    <div className="grid w-[800px] grid-cols-2 gap-4">
      <StatsCard title="database" description="Total entities" icon={<Database className="h-4 w-4" />} status="healthy">
        <span className="font-semibold text-2xl text-fg-normal">1,247</span>
      </StatsCard>
      <StatsCard title="events" description="Last 24 hours" icon={<Zap className="h-4 w-4" />} status="healthy">
        <span className="font-semibold text-2xl text-fg-normal">1,842</span>
      </StatsCard>
      <StatsCard title="integrations" description="Active connections" icon={<Plug className="h-4 w-4" />} status="warning">
        <span className="font-semibold text-2xl text-fg-normal">4/5</span>
      </StatsCard>
      <StatsCard title="system" description="Health status" icon={<Activity className="h-4 w-4" />} status="healthy">
        <span className="font-semibold text-2xl text-fg-normal">Healthy</span>
      </StatsCard>
    </div>
  ),
};
