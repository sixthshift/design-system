export type HeatMapCell = {
  date: string;
  value: number;
};

export const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
export const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const DEFAULT_COLOR_SCALE = ["var(--bg-subtle)", "var(--bg-brand-subtle)", "var(--bg-brand)", "var(--bg-brand-strong)"];

export function getIntensity(value: number, max: number, levels: number): number {
  if (value <= 0 || max <= 0) return 0;
  return Math.ceil(Math.min(value / max, 1) * (levels - 1));
}
