import type { Meta, StoryObj } from "@storybook/react";
import { BarChart } from "./BarChart";

const meta: Meta<typeof BarChart> = {
  title: "Components/Charts/BarChart",
  component: BarChart,
  parameters: {
    layout: "padded",
    docs: { subtitle: "Horizontal bar chart built from styled divs, not SVG" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BarChart>;

export const Default: Story = {
  args: {
    data: [
      { label: "Documents", value: 12 },
      { label: "Projects", value: 14 },
      { label: "Events", value: 6 },
      { label: "Comments", value: 4 },
      { label: "Members", value: 2 },
    ],
  },
};

export const WithCustomColors: Story = {
  args: {
    data: [
      { label: "Completed", value: 23, color: "var(--fg-success)" },
      { label: "In Progress", value: 8, color: "var(--fg-warning)" },
      { label: "Overdue", value: 3, color: "var(--fg-danger)" },
    ],
  },
};

export const NoValues: Story = {
  args: {
    data: [
      { label: "Mon", value: 5 },
      { label: "Tue", value: 8 },
      { label: "Wed", value: 3 },
      { label: "Thu", value: 12 },
      { label: "Fri", value: 7 },
    ],
    showValues: false,
  },
};

export const CustomFormat: Story = {
  args: {
    data: [
      { label: "Sleep", value: 7.5 },
      { label: "Exercise", value: 1.2 },
      { label: "Reading", value: 2.0 },
      { label: "Cooking", value: 0.8 },
    ],
    formatValue: (v: number) => `${v}h`,
    maxValue: 10,
  },
};

export const ThinBars: Story = {
  args: {
    data: [
      { label: "Q1", value: 45 },
      { label: "Q2", value: 62 },
      { label: "Q3", value: 38 },
      { label: "Q4", value: 71 },
    ],
    barHeight: 16,
  },
};

export const SingleItem: Story = {
  args: {
    data: [{ label: "Progress", value: 73, color: "var(--fg-brand)" }],
    maxValue: 100,
    formatValue: (v: number) => `${v}%`,
    barHeight: 32,
  },
};

export const ActivityBreakdown: Story = {
  args: {
    data: [
      { label: "Monday", value: 14 },
      { label: "Tuesday", value: 11 },
      { label: "Wednesday", value: 18 },
      { label: "Thursday", value: 9 },
      { label: "Friday", value: 15 },
      { label: "Saturday", value: 4 },
      { label: "Sunday", value: 2 },
    ],
  },
};
