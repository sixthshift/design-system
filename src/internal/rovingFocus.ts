/**
 * Roving-focus helpers for composite widgets.
 *
 * A `radiogroup` is a single tab stop: exactly one option carries
 * `tabIndex={0}` and the arrow keys move between options. Leaving every option
 * separately tabbable — the browser default for a row of buttons — breaks the
 * WAI-ARIA radio pattern.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/radio/
 */

/**
 * Given the index of the currently focused option, return the index the key
 * should move to, or `null` if the key is not a navigation key.
 *
 * Callers should pass an already-filtered list of *enabled* options, so
 * disabled ones are skipped for free. Navigation wraps at both ends.
 *
 * `currentIndex` may be -1 (nothing focused yet), in which case forward keys
 * land on the first option and backward keys on the last.
 */
export function getRovingTargetIndex(key: string, currentIndex: number, count: number): number | null {
  if (count === 0) return null;

  switch (key) {
    case "Home":
      return 0;
    case "End":
      return count - 1;
    case "ArrowRight":
    case "ArrowDown":
      return currentIndex < 0 ? 0 : (currentIndex + 1) % count;
    case "ArrowLeft":
    case "ArrowUp":
      return currentIndex < 0 ? count - 1 : (currentIndex - 1 + count) % count;
    default:
      return null;
  }
}
