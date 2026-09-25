"use client";

import { useState } from "react";

/**
 * The brand an element sits in: the `data-brand` of it or its nearest
 * ancestor, or `undefined` outside any scope.
 *
 * Overlays need this because a portal moves their content out from under the
 * element that set `data-brand`, so CSS inheritance no longer carries it. The
 * overlay reads the brand off its trigger and re-stamps it on its own element.
 * The value is copied verbatim, unknown names included: the theme only gives
 * listed names meaning, so an unknown one resolves exactly as it would have in
 * place.
 */
export function closestBrand(element: Element | null | undefined): string | undefined {
  return element?.closest?.("[data-brand]")?.getAttribute("data-brand") ?? undefined;
}

const focusedBrand = () => (typeof document === "undefined" ? undefined : closestBrand(document.activeElement));

/**
 * The brand of whatever held focus when the calling overlay opened.
 *
 * For Modal and Sheet, which have no reference element: the thing that opened
 * them is almost always the focused control, and it still holds focus during
 * the render that opens them, before the focus manager moves it. Captured on
 * each closed → open transition and kept through the close, so neither focus
 * moving into the dialog nor the exit animation changes it. When nothing useful
 * was focused (Safari does not focus a clicked button) this is `undefined`, and
 * the overlay inherits from wherever its portal landed.
 */
export function useOpenerBrand(open: boolean): string | undefined {
  const [captured, setCaptured] = useState(() => ({ open, brand: open ? focusedBrand() : undefined }));
  // Adjusting state during render, React's pattern for deriving from a prop
  // change: an effect would run after the focus manager has already moved focus.
  if (captured.open !== open) setCaptured({ open, brand: open ? focusedBrand() : captured.brand });
  return captured.brand;
}
