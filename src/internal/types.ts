/**
 * A ref object whose `current` this library writes to.
 *
 * React 18's types spell this `MutableRefObject<T>`; React 19 removed that alias
 * and made `RefObject<T>` itself mutable. Neither name type-checks under both
 * versions, so the structural shape is written out instead — it is what both
 * aliases resolve to, and it keeps the source valid across the whole
 * `react@^18.2.0 || ^19.0.0` peer range.
 */
export type WritableRefObject<T> = { current: T };
