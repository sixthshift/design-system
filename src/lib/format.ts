/**
 * Formatting utilities for common display patterns
 */

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB", "PB"] as const;

/**
 * Format a byte count for display, e.g. `formatBytes(1536)` -> `"1.50 KB"`.
 *
 * Total over every finite input:
 * - negative values format their magnitude with a leading sign, so the function
 *   is usable for deltas
 * - values above the largest unit stay in PB rather than running off the end of
 *   the unit list (PB already exceeds Number.MAX_SAFE_INTEGER bytes)
 * - values below 1 byte stay in B
 *
 * Non-finite input (NaN, +/-Infinity) has no representation, so it returns an
 * em dash rather than a number that would be wrong.
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes)) return "—";
  if (bytes === 0) return "0 B";

  // Repeated division rather than Math.log(bytes) / Math.log(1024): it is exact
  // at the unit boundaries, needs no clamping of a computed index, and cannot
  // produce a negative or out-of-range index for very small or very large input.
  let value = Math.abs(bytes);
  let unit = 0;
  while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
    value /= 1024;
    unit++;
  }

  return `${bytes < 0 ? "-" : ""}${value.toFixed(2)} ${BYTE_UNITS[unit]}`;
}

/**
 * Format seconds to human-readable uptime (e.g., "2d 5h 30m")
 */
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.length > 0 ? parts.join(" ") : "< 1m";
}
