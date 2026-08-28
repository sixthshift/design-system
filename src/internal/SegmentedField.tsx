"use client";

import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";
import { useRef, useState } from "react";

/**
 * One segment of a segmented field.
 *
 * `numeric` covers everything that is typed as digits — a month, an hour, a
 * year. `choice` covers a segment with a fixed vocabulary, which in practice
 * means AM/PM: it holds the index of an option, is typed by first letter, and
 * announces the word rather than the number.
 */
export type SegmentSpec =
  | {
      kind?: "numeric";
      /** Key in the values record. */
      name: string;
      /** Accessible name, e.g. `"Month"`. */
      label: string;
      /** Shown when empty, e.g. `"mm"`. */
      placeholder: string;
      /** Width in digits: 2 for a month, 4 for a year. */
      digits: number;
      min: number;
      max: number;
      /** Rendered before this segment, e.g. `"/"` or `":"`. */
      separatorBefore?: string | undefined;
      /** Where an arrow key starts from when the segment is empty. */
      stepFrom?: number | undefined;
    }
  | {
      kind: "choice";
      name: string;
      label: string;
      placeholder: string;
      /** Ordered vocabulary; the segment's value is an index into it. */
      options: string[];
      separatorBefore?: string | undefined;
      stepFrom?: number | undefined;
    };

/** Segment values by name. `null` is "nothing typed yet". */
export type SegmentValues = Record<string, number | null>;

export type SegmentedFieldProps<T> = {
  spec: SegmentSpec[];
  /** The value the segments display. `undefined` leaves them empty. */
  value: T | undefined;
  /** Split a value into segments. */
  toSegments: (value: T | undefined) => SegmentValues;
  /** Build a value from a complete set of segments. May normalise (clamp a day). */
  fromSegments: (values: Record<string, number>) => T;
  /** Stable identity for a value — how an echo is told from a real change. */
  keyOf: (value: T) => string;
  /**
   * Fires with a whole value, or `undefined` the moment the segments stop
   * describing one. Never fires a partial value, and never mid-number.
   */
  onChange: (value: T | undefined) => void;
  /** Read a pasted string into segments. Omit to ignore pastes. */
  parsePaste?: ((text: string) => SegmentValues | null) | undefined;
  /** Accessible name for the group. */
  label: string;
  isDisabled?: boolean | undefined;
  isInvalid?: boolean | undefined;
  /** `Alt+ArrowDown` — the combobox convention for "open the popup". */
  onOpenRequest?: (() => void) | undefined;
  /** `Enter` — the caller decides whether that commits, submits or nothing. */
  onSubmit?: (() => void) | undefined;
  id?: string | undefined;
  className?: string | undefined;
};

type Limits = { min: number; max: number; digits: number };

function limitsOf(segment: SegmentSpec): Limits {
  if (segment.kind === "choice") {
    // `digits: 0` is what makes a digit roll straight past AM/PM instead of
    // being swallowed by it.
    return { min: 0, max: segment.options.length - 1, digits: 0 };
  }
  return { min: segment.min, max: segment.max, digits: segment.digits };
}

const pad = (value: number, digits: number) => String(value).padStart(digits, "0");

function displayOf(segment: SegmentSpec, current: number | null, typed: string): string {
  if (typed !== "") return typed;
  if (current === null) return segment.placeholder;
  if (segment.kind === "choice") return segment.options[current] ?? segment.placeholder;
  return pad(current, segment.digits);
}

/**
 * A typeable field made of spinbutton segments — the shared keyboard model
 * behind every picker's trigger.
 *
 * Segments rather than a text box and a parser: `08/09` cannot be read without
 * knowing the order, and a parser that guesses is wrong for half the world. A
 * labelled `Month` spinbutton cannot be misread, and it displays in exactly the
 * format it accepts, so there is no reformat-on-blur surprise.
 *
 * The behaviour that makes it typeable rather than merely focusable:
 *
 * - **A digit that cannot extend the current segment rolls into the next one.**
 *   `152026` in an `mdy` field is January the 5th 2026. Restarting the segment
 *   instead — the obvious implementation — silently turns January into May and
 *   eats the day, which is what makes a segmented field feel broken.
 * - **Separators advance.** `1/5/2026` typed literally works, because `/` is how
 *   a person says "done with this one".
 * - **`Backspace` takes back one digit**, then clears the segment, then steps
 *   back to the previous one — the only keyboard route to a segment the digits
 *   have already advanced past.
 * - **A click anywhere in the field focuses a segment**, the way clicking a text
 *   input anywhere gives it a caret.
 * - **`onChange` is held while a number is still being typed.** A year arrives
 *   one digit at a time, and `2` is the start of 2026, not the year 2. Deferred
 *   edits flush on blur.
 *
 * Values are the caller's own type; `toSegments`/`fromSegments` are the codec
 * and `keyOf` supplies identity, which Temporal objects do not have.
 *
 * Internal. Not exported from the package.
 */
export function SegmentedField<T>({
  spec,
  value,
  toSegments,
  fromSegments,
  keyOf,
  onChange,
  parsePaste,
  label,
  isDisabled = false,
  isInvalid = false,
  onOpenRequest,
  onSubmit,
  id,
  className,
}: SegmentedFieldProps<T>) {
  const names = spec.map((segment) => segment.name);
  const bySpec = (name: string) => spec.find((segment) => segment.name === name)!;
  // `!= null` rather than `!== null`: a key the codec forgot to set would be
  // `undefined`, which a `!== null` test would count as filled — and hand
  // `fromSegments` a NaN.
  const isComplete = (values: SegmentValues) => names.every((name) => values[name] != null);

  const [segments, setSegments] = useState<SegmentValues>(() => toSegments(value));

  // Props win, except over the value this field just emitted. Comparing a caller
  // supplied key rather than the value itself matters twice: Temporal has no
  // value identity, and an echoed-back value must not restart the user's edit.
  const valueKey = value === undefined ? "" : keyOf(value);
  const syncedKey = useRef(valueKey);
  if (valueKey !== syncedKey.current) {
    syncedKey.current = valueKey;
    setSegments(toSegments(value));
  }

  // The digits typed into the segment being filled. State rather than a ref
  // because it is rendered: a year mid-typing shows `202`, not `0202`.
  const [buffer, setBuffer] = useState<{ segment: string; text: string } | null>(null);
  const nodes = useRef<Record<string, HTMLSpanElement | null>>({});
  const hadValue = useRef(isComplete(toSegments(value)));

  const focusSegment = (name: string | undefined) => {
    if (name) nodes.current[name]?.focus();
  };

  const publish = (next: SegmentValues) => {
    if (!isComplete(next)) {
      if (hadValue.current) {
        hadValue.current = false;
        // Pre-empt the sync for the cleared value too. Without this, emptying
        // one segment round-trips as `undefined` and wipes the others — the
        // user cleared the day, not the whole date. A controlled caller that
        // *rejects* the clear still wins: its value no longer matches this
        // key, so the next render syncs back to it.
        syncedKey.current = "";
        onChange(undefined);
      }
      return;
    }
    const composed = fromSegments(next as Record<string, number>);
    const key = keyOf(composed);

    // `fromSegments` may normalise — February the 31st is the 28th — so the
    // segments follow the value rather than the keystrokes. Otherwise the
    // field reads 02/31 while the value says the 28th.
    const normalised = toSegments(composed);
    if (names.some((name) => normalised[name] !== next[name])) setSegments(normalised);

    if (key === syncedKey.current) return;
    hadValue.current = true;
    syncedKey.current = key;
    onChange(composed);
  };

  /**
   * `defer` holds the announcement while a number is still being typed, so a
   * controlled caller is not handed `0002-12-25`, `0020-12-25`, `0202-12-25` in
   * a row — and anything validating against a bound does not flash mid-word.
   */
  const commit = (next: SegmentValues, defer = false) => {
    setSegments(next);
    if (!defer) publish(next);
  };

  const applyDigit = (name: string, digit: string) => {
    let target = name;
    let started = buffer?.segment === name ? buffer.text : "";

    // At most one hop per digit in practice; bounded so a bad spec cannot spin.
    for (let hop = 0; hop <= spec.length; hop++) {
      const { max, digits } = limitsOf(bySpec(target));
      const combined = started + digit;
      const next = names[names.indexOf(target) + 1];

      if (digits > 0 && Number(combined) <= max && combined.length <= digits) {
        const numeric = Number(combined);
        const full = combined.length >= digits || numeric * 10 > max;
        setBuffer(full ? null : { segment: target, text: combined });
        commit({ ...segments, [target]: numeric === 0 && limitsOf(bySpec(target)).min > 0 ? null : numeric }, !full);
        focusSegment(full ? next : target);
        return;
      }

      if (!next) {
        if (digits === 0) return; // a choice segment takes no digits
        setBuffer({ segment: target, text: digit });
        commit({ ...segments, [target]: Number(digit) === 0 ? null : Number(digit) });
        focusSegment(target);
        return;
      }

      target = next;
      started = "";
    }
  };

  /** A letter picks a `choice` option by first letter — `a` for AM, `p` for PM. */
  const applyLetter = (name: string, letter: string) => {
    const segment = bySpec(name);
    if (segment.kind !== "choice") return false;
    const index = segment.options.findIndex((option) => option.toLowerCase().startsWith(letter.toLowerCase()));
    if (index === -1) return false;
    setBuffer(null);
    commit({ ...segments, [name]: index });
    focusSegment(names[names.indexOf(name) + 1]);
    return true;
  };

  const step = (name: string, delta: number) => {
    const segment = bySpec(name);
    const { min, max } = limitsOf(segment);
    const current = segments[name];
    if (current === null || current === undefined) {
      commit({ ...segments, [name]: segment.stepFrom ?? min });
      return;
    }
    let next = current + delta;
    // Cyclic fields wrap, which is what an arrow key means on a month or an
    // hour. A year does not — 9999 to 1 is never the intent — and it says so
    // by spanning more than two digits.
    const cyclic = segment.kind === "choice" || limitsOf(segment).digits <= 2;
    if (!cyclic) next = Math.min(Math.max(next, min), max);
    else if (next > max) next = min;
    else if (next < min) next = max;
    commit({ ...segments, [name]: next });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>, name: string) => {
    if (isDisabled) return;

    if (event.altKey && event.key === "ArrowDown") {
      event.preventDefault();
      onOpenRequest?.();
      return;
    }

    const plain = !event.altKey && !event.ctrlKey && !event.metaKey;

    if (plain && /^[0-9]$/.test(event.key)) {
      event.preventDefault();
      applyDigit(name, event.key);
      return;
    }

    if (plain && /^[a-z]$/i.test(event.key) && applyLetter(name, event.key)) {
      event.preventDefault();
      return;
    }

    // Any plausible separator counts, whatever this field's own separators
    // are: it means "done with this one", and without it a typed `/` is
    // swallowed and the next digit lands on the wrong segment.
    //
    // Only with a number still in progress, though. A segment that already
    // filled up has advanced on its own, and treating the separator as a second
    // advance would skip the segment after it: typing `1/6/2026` would land 2026
    // in the hour, because the `6` had already moved on.
    if (plain && ["/", "-", ".", ",", ":", " "].includes(event.key)) {
      event.preventDefault();
      if (buffer?.segment !== name) return;
      setBuffer(null);
      focusSegment(names[names.indexOf(name) + 1]);
      return;
    }

    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        setBuffer(null);
        step(name, 1);
        break;
      case "ArrowDown":
        event.preventDefault();
        setBuffer(null);
        step(name, -1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        setBuffer(null);
        focusSegment(names[names.indexOf(name) - 1]);
        break;
      case "ArrowRight":
        event.preventDefault();
        setBuffer(null);
        focusSegment(names[names.indexOf(name) + 1]);
        break;
      case "Backspace": {
        event.preventDefault();
        const typed = buffer?.segment === name ? buffer.text : "";
        if (typed.length > 1) {
          const text = typed.slice(0, -1);
          setBuffer({ segment: name, text });
          commit({ ...segments, [name]: Number(text) === 0 ? null : Number(text) }, true);
          break;
        }
        setBuffer(null);
        if (typed.length === 0 && segments[name] === null) {
          focusSegment(names[names.indexOf(name) - 1]);
          break;
        }
        commit({ ...segments, [name]: null });
        break;
      }
      case "Delete":
        event.preventDefault();
        setBuffer(null);
        commit({ ...segments, [name]: null });
        break;
      case "Enter":
        event.preventDefault();
        onSubmit?.();
        break;
      default:
        break;
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLFieldSetElement>) => {
    if (isDisabled || !parsePaste) return;
    event.preventDefault();
    const parsed = parsePaste(event.clipboardData.getData("text").trim());
    if (!parsed) return;
    setBuffer(null);
    commit(parsed);
    focusSegment(names[names.length - 1]);
  };

  return (
    // A `fieldset` rather than a `div role="group"`: the segments are one
    // related set of controls, which is the element's whole job. Tailwind's
    // preflight already strips its default margin, padding and border.
    <fieldset
      id={id}
      aria-label={label}
      aria-invalid={isInvalid || undefined}
      aria-disabled={isDisabled || undefined}
      onMouseDown={(event) => {
        // A click anywhere in the field focuses a segment, the way clicking a
        // text input anywhere puts a caret in it. Without this, only the digits
        // themselves are clickable and the rest of the box silently does
        // nothing — which reads as "typing is broken", because nothing has focus.
        if (isDisabled) return;
        if ((event.target as HTMLElement).closest("[data-segment]")) return;
        event.preventDefault();
        focusSegment(names.find((name) => segments[name] === null) ?? names[0]);
      }}
      onPaste={handlePaste}
      onBlur={(event) => {
        // Only when focus leaves the field entirely — moving between segments is
        // a blur too, and mid-edit is not the moment to announce anything.
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        // A live buffer is exactly the condition under which a commit was
        // deferred, so it is the only case with anything to flush.
        if (!buffer) return;
        setBuffer(null);
        publish(segments);
      }}
      className={cn("flex flex-1 cursor-text items-center gap-0.5 text-sm", isDisabled && "opacity-50", className)}
    >
      {spec.map((segment) => {
        const current = segments[segment.name] ?? null;
        const { min, max } = limitsOf(segment);
        const typed = buffer?.segment === segment.name ? buffer.text : "";
        const text = displayOf(segment, current, typed);
        return (
          <React.Fragment key={segment.name}>
            {segment.separatorBefore && (
              <span aria-hidden="true" className="text-fg-subtle">
                {segment.separatorBefore}
              </span>
            )}
            <span
              ref={(node) => {
                nodes.current[segment.name] = node;
              }}
              role="spinbutton"
              tabIndex={isDisabled ? -1 : 0}
              aria-label={segment.label}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={current ?? undefined}
              aria-valuetext={current === null ? "Empty" : text}
              aria-disabled={isDisabled || undefined}
              data-segment={segment.name}
              onKeyDown={(event) => handleKeyDown(event, segment.name)}
              onFocus={() => {
                if (buffer?.segment !== segment.name) setBuffer(null);
              }}
              className={cn(
                "cursor-text rounded-sm px-0.5 tabular-nums outline-hidden focus:bg-bg-brand-subtle focus:text-fg-on-brand-subtle",
                current === null && "text-fg-subtle"
              )}
            >
              {text}
            </span>
          </React.Fragment>
        );
      })}
    </fieldset>
  );
}
