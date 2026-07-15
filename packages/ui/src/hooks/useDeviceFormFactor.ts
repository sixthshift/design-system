import { useSyncExternalStore } from "react";

/**
 * Breakpoint thresholds for adaptive rendering.
 *
 * These define the minimum width for each form factor:
 * - mobile:  0 – 639px
 * - tablet:  640 – 1023px
 * - desktop: 1024px+
 */
const breakpoints = {
  mobile: 0,
  tablet: 640,
  desktop: 1024,
} as const;

export type DeviceFormFactor = keyof typeof breakpoints;

function getFormFactor(width: number): DeviceFormFactor {
  if (width >= breakpoints.desktop) return "desktop";
  if (width >= breakpoints.tablet) return "tablet";
  return "mobile";
}

function getServerSnapshot(): DeviceFormFactor {
  return "desktop";
}

function getSnapshot(): DeviceFormFactor {
  return getFormFactor(window.innerWidth);
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

/**
 * Returns the current device form factor based on viewport width.
 *
 * - mobile:  0 – 639px
 * - tablet:  640 – 1023px
 * - desktop: 1024px+
 *
 * Uses useSyncExternalStore for efficient subscription to resize events.
 */
export function useDeviceFormFactor(): DeviceFormFactor {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
