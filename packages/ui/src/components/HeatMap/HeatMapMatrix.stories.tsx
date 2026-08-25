import type { Meta, StoryObj } from "@storybook/react";
import { today } from "../../temporal";
import { HeatMapMatrix } from "./HeatMapMatrix";

const meta: Meta<typeof HeatMapMatrix> = {
  title: "Components/Data/HeatMapMatrix",
  component: HeatMapMatrix,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HeatMapMatrix>;

function generateData(days: number, maxValue: number) {
  const data = [];
  const todayDate = today();
  for (let i = days - 1; i >= 0; i--) {
    const date = todayDate.subtract({ days: i });
    if (Math.random() < 0.6) {
      data.push({
        date: date.toString(),
        value: Math.floor(Math.random() * maxValue) + 1,
      });
    }
  }
  return data;
}

function generateWeekData(maxValue: number) {
  const data = [];
  const todayDate = today();
  const startOfWeek = todayDate.subtract({ days: todayDate.dayOfWeek - 1 });
  for (let i = 0; i < 7; i++) {
    const date = startOfWeek.add({ days: i });
    if (Math.random() < 0.6) {
      data.push({
        date: date.toString(),
        value: Math.floor(Math.random() * maxValue) + 1,
      });
    }
  }
  return data;
}

export const OneWeek: Story = {
  args: {
    data: generateWeekData(1),
  },
};

export const TwoWeeks: Story = {
  args: {
    data: generateData(14, 3),
  },
};

export const Month: Story = {
  args: {
    data: generateData(30, 5),
  },
};

export const Strip: Story = {
  name: "Single row strip",
  args: {
    data: generateWeekData(5),
    cellSize: 16,
    cellGap: 3,
  },
};

export const SuccessScale: Story = {
  args: {
    data: generateWeekData(1),
    colorScale: ["var(--bg-subtle)", "var(--bg-success-subtle)", "var(--bg-success)", "var(--bg-success-strong)"],
    formatTooltip: (cell) => `${cell.date}: ${cell.value ? "done" : "missed"}`,
  },
};
