import { today } from "@sixthshift/temporal";
import type { Meta, StoryObj } from "@storybook/react";
import { HeatMapCalendar } from "./HeatMapCalendar";

function generateData(days: number, maxValue: number) {
  const data = [];
  const todayDate = today();
  for (let i = days - 1; i >= 0; i--) {
    const date = todayDate.subtract({ days: i });
    const dow = date.dayOfWeek;
    const isWeekend = dow === 6 || dow === 7;
    if (Math.random() < (isWeekend ? 0.3 : 0.7)) {
      data.push({
        date: date.toString(),
        value: Math.floor(Math.random() * maxValue) + 1,
      });
    }
  }
  return data;
}

const calendarMeta: Meta<typeof HeatMapCalendar> = {
  title: "Components/Data/HeatMapCalendar",
  component: HeatMapCalendar,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
};

export default calendarMeta;
type CalendarStory = StoryObj<typeof HeatMapCalendar>;

export const Calendar: CalendarStory = {
  args: {
    data: generateData(140, 5),
  },
};

export const CalendarFullYear: CalendarStory = {
  args: {
    data: generateData(365, 6),
    cellSize: 10,
    cellGap: 2,
  },
};

export const CalendarSuccessScale: CalendarStory = {
  args: {
    data: generateData(90, 3),
    colorScale: ["var(--bg-subtle)", "var(--bg-success-subtle)", "var(--bg-success)", "var(--bg-success-strong)"],
    formatTooltip: (cell) => `${cell.date}: ${cell.value} completed`,
  },
};

export const CalendarDangerScale: CalendarStory = {
  args: {
    data: generateData(90, 5),
    colorScale: ["var(--bg-subtle)", "var(--bg-danger-subtle)", "var(--bg-danger)", "var(--bg-danger-strong)"],
  },
};
