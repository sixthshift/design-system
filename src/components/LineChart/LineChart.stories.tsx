import type { Meta, StoryObj } from "@storybook/react";
import { LineChart } from "./LineChart";

const meta: Meta<typeof LineChart> = {
  title: "Components/Data/LineChart",
  component: LineChart,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LineChart>;

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const sessionsData = weekdays.map((label, i) => ({
  label,
  value: [5, 8, 3, 12, 7, 2, 9][i]!,
}));

const signupsData = weekdays.map((label, i) => ({
  label,
  value: [3, 4, 2, 5, 4, 1, 3][i]!,
}));

export const Default: Story = {
  args: {
    series: [{ data: sessionsData, name: "Sessions" }],
  },
};

export const MultipleSeries: Story = {
  args: {
    series: [
      { data: sessionsData, name: "Sessions" },
      { data: signupsData, name: "Signups" },
    ],
    height: 240,
  },
};

export const WithArea: Story = {
  args: {
    series: [{ data: sessionsData, name: "Sessions" }],
    fillArea: true,
    height: 200,
  },
};

export const WithValues: Story = {
  args: {
    series: [{ data: sessionsData, name: "Sessions" }],
    showValues: true,
    height: 220,
  },
};

export const Linear: Story = {
  args: {
    series: [{ data: sessionsData, name: "Sessions" }],
    interpolation: "linear",
  },
};

export const StepAfter: Story = {
  args: {
    series: [{ data: sessionsData, name: "Sessions" }],
    interpolation: "stepAfter",
  },
};

export const StepBefore: Story = {
  args: {
    series: [{ data: sessionsData, name: "Sessions" }],
    interpolation: "stepBefore",
  },
};

export const MinimalNoAxes: Story = {
  args: {
    series: [{ data: sessionsData, name: "Sessions" }],
    showAxes: false,
    showGrid: false,
    showLabels: false,
    showDots: false,
    fillArea: true,
    height: 80,
  },
};

const temperatureData = weekdays.map((label, i) => ({
  label,
  value: [18.5, 21.2, 19.8, 23.1, 22.4, 20.0, 17.9][i]!,
}));

export const TemperatureChart: Story = {
  args: {
    series: [{ data: temperatureData, name: "Temperature" }],
    fillArea: true,
    formatValue: (v: number) => `${v}°`,
    height: 200,
  },
};

export const CustomColors: Story = {
  args: {
    series: [
      { data: sessionsData, name: "Sessions", color: "var(--fg-danger)" },
      { data: signupsData, name: "Signups", color: "var(--fg-success)" },
    ],
  },
};

export const WithTooltip: Story = {
  args: {
    series: [{ data: sessionsData, name: "Sessions" }],
    showTooltip: true,
  },
};

export const WithTooltipMultiSeries: Story = {
  args: {
    series: [
      { data: sessionsData, name: "Sessions" },
      { data: signupsData, name: "Signups" },
    ],
    showTooltip: true,
    height: 240,
  },
};

export const WithTooltipCustomFormat: Story = {
  args: {
    series: [{ data: temperatureData, name: "Temperature" }],
    showTooltip: true,
    fillArea: true,
    formatTooltip: (point) => `${point.label}: ${point.value}°C`,
  },
};

// Each series is a segment of the line. Boundary points are shared so segments connect.
// The LineChart positions points by label, so segments land at the correct x position.
export const ColorSegmentedLine: Story = {
  name: "Multi-series colored line",
  args: {
    series: [
      {
        color: "var(--fg-brand)",
        data: [
          { label: "06:00", value: 12 },
          { label: "07:00", value: 14 },
          { label: "08:00", value: 15 },
        ],
      },
      {
        color: "var(--fg-success)",
        data: [
          { label: "08:00", value: 15 },
          { label: "09:00", value: 20 },
          { label: "10:00", value: 23 },
          { label: "11:00", value: 25 },
        ],
      },
      {
        color: "var(--fg-warning)",
        data: [
          { label: "11:00", value: 25 },
          { label: "12:00", value: 29 },
          { label: "13:00", value: 32 },
        ],
      },
      {
        color: "var(--fg-danger)",
        data: [
          { label: "13:00", value: 32 },
          { label: "14:00", value: 34 },
          { label: "15:00", value: 33 },
          { label: "16:00", value: 32 },
        ],
      },
      {
        color: "var(--fg-warning)",
        data: [
          { label: "16:00", value: 32 },
          { label: "17:00", value: 27 },
          { label: "18:00", value: 25 },
        ],
      },
      {
        color: "var(--fg-success)",
        data: [
          { label: "18:00", value: 25 },
          { label: "19:00", value: 21 },
          { label: "20:00", value: 18 },
          { label: "21:00", value: 15 },
        ],
      },
      {
        color: "var(--fg-brand)",
        data: [{ label: "21:00", value: 15 }],
      },
    ],
    height: 240,
    showDots: false,
    showTooltip: true,
    formatValue: (v: number) => `${v}°`,
    formatTooltip: (point) => `${point.label}: ${point.value}°`,
  },
};
