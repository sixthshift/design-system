import { useState } from "react";
import { readResolvedTokens, readTokens } from "../../theme/read-tokens";

/**
 * The naming convention as four pickers instead of four lines of ASCII.
 *
 * The composed name and its resolved colours sit *above* the pickers: the
 * name is the subject of the widget and the columns are the controls, so
 * putting the result first keeps it in view while a column is being scrolled.
 *
 * Reading `--{context}[-on]-{intent}[-{weight}][-{state}]` teaches the shape of
 * a name; assembling one teaches which names are real, which is the thing a
 * static diagram cannot do. Every combination the pickers allow is checked
 * against the shipped stylesheet as you build it, so the gaps in the grid —
 * `fg-on` has no `normal`, the hierarchy trio takes no weight, `overlay` takes
 * nothing at all — are discovered rather than asserted.
 *
 * The "not declared" state is a feature, not an error to design out: the
 * fastest way to learn that a slot combination does not exist is to try it and
 * be told, next to the name you just built.
 *
 * Story-only. `src/stories` is excluded from the published package.
 */

type Slot = { value: string; label: string; note: string };

const NONE = "";

/**
 * The four slot vocabularies, exported so the docs page's test can hold them
 * against src/theming/vocabulary.ts. The page teaches the convention through this
 * widget now, so the widget's option lists *are* the documented vocabulary —
 * a slot value added to the schema and not here shortens the grammar a reader
 * is shown, silently.
 */
export const SLOTS = {
  contexts: () => CONTEXTS.map((slot) => slot.value),
  intents: () => INTENTS.map((slot) => slot.value),
  weights: () => WEIGHTS.map((slot) => slot.value).filter(Boolean),
  states: () => STATES.map((slot) => slot.value).filter(Boolean),
};

const CONTEXTS: Slot[] = [
  { value: "bg", label: "bg", note: "Backgrounds and surfaces" },
  { value: "fg", label: "fg", note: "Text and icons on an ordinary surface" },
  { value: "fg-on", label: "fg-on", note: "Text and icons on that intent's own surface" },
  { value: "border", label: "border", note: "Borders, dividers, rings" },
];

const INTENTS: Slot[] = [
  { value: "normal", label: "normal", note: "The default. No colour opinion" },
  { value: "subtle", label: "subtle", note: "Quieter than normal" },
  { value: "strong", label: "strong", note: "Louder than normal" },
  { value: "brand", label: "brand", note: "The primary action, or the branded thing" },
  { value: "success", label: "success", note: "Done, healthy" },
  { value: "warning", label: "warning", note: "Needs attention, has not failed yet" },
  { value: "danger", label: "danger", note: "Destructive, or failed" },
  { value: "overlay", label: "overlay", note: "The scrim behind a modal" },
];

const WEIGHTS: Slot[] = [
  { value: NONE, label: "—", note: "No weight. The usual case" },
  { value: "subtle", label: "subtle", note: "The quiet version of this meaning" },
  { value: "strong", label: "strong", note: "The loud version of this meaning" },
];

const STATES: Slot[] = [
  { value: NONE, label: "—", note: "The resting value" },
  { value: "hovered", label: "hovered", note: "The pointer is over it" },
  { value: "pressed", label: "pressed", note: "It is being activated" },
  { value: "disabled", label: "disabled", note: "It is not interactive" },
];

/** `bg` -> `bg-*`, `fg-on` -> `text-*`, `border` -> `border-*`. */
const utilityFor = (token: string) => {
  const prefix = token.startsWith("bg-") ? "bg" : token.startsWith("border-") ? "border" : "text";
  return `${prefix}-${token}`;
};

function Column({
  legend,
  question,
  options,
  selected,
  onSelect,
  declared,
}: {
  legend: string;
  question: string;
  options: Slot[];
  selected: string;
  onSelect: (value: string) => void;
  /** Whether picking this option would name a token that exists. */
  declared: (value: string) => boolean;
}) {
  return (
    <fieldset className="min-w-40 flex-1 border-0 p-0">
      <legend className="mb-1 font-mono text-fg-normal text-xs">{legend}</legend>
      <p className="mb-2 text-fg-subtle text-xs">{question}</p>
      {/* Real radios rather than buttons with `role="radio"`: arrow-key
          navigation, form semantics and the a11y suite all come free, and the
          input itself is only visually hidden, never removed. */}
      <div className="max-h-52 overflow-y-auto rounded-md border border-border-normal">
        {options.map((option) => {
          const active = option.value === selected;
          const real = declared(option.value);
          return (
            <label
              key={option.value || "none"}
              className={`flex cursor-pointer flex-col gap-0.5 border-border-subtle border-b px-3 py-2 last:border-b-0 focus-within:outline focus-within:outline-2 focus-within:outline-[var(--focus-ring)] ${
                active ? "bg-bg-brand-subtle text-fg-on-brand-subtle" : "bg-bg-normal hover:bg-bg-subtle"
              }`}
            >
              <span className="flex items-center gap-1.5 font-mono text-xs">
                <input type="radio" name={legend} value={option.value} checked={active} onChange={() => onSelect(option.value)} className="sr-only" />
                {option.label}
                {!real && (
                  <span className="text-[10px] text-fg-subtle">
                    <span aria-hidden>✕</span>
                    <span className="sr-only">not declared with the current selection</span>
                  </span>
                )}
              </span>
              <span className={`text-[11px] ${active ? "text-fg-on-brand-subtle" : "text-fg-subtle"}`}>{option.note}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Swatch({ label, colour }: { label: string; colour: string | undefined }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-fg-subtle text-xs">{label}</span>
      <span aria-hidden className="inline-block size-4 rounded-sm border border-border-normal" style={{ backgroundColor: colour ?? "transparent" }} />
      <code className="font-mono text-[11px]">{colour ?? "—"}</code>
    </span>
  );
}

export function TokenBuilder() {
  const [context, setContext] = useState("bg");
  const [intent, setIntent] = useState("danger");
  const [weight, setWeight] = useState("strong");
  const [state, setState] = useState("hovered");

  const declaredNames = new Set(Object.keys(readTokens("light")));
  const light = readResolvedTokens("light");
  const dark = readResolvedTokens("dark");

  const compose = (parts: { context?: string; intent?: string; weight?: string; state?: string }) =>
    [parts.context ?? context, parts.intent ?? intent, parts.weight ?? weight, parts.state ?? state].filter(Boolean).join("-");

  const token = compose({});
  const exists = declaredNames.has(token);

  return (
    <div className="sb-unstyled flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border-normal bg-bg-subtle p-4">
        <code className="font-mono text-base">--{token}</code>
        {exists ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <Swatch label="light" colour={light[token]} />
              <Swatch label="dark" colour={dark[token]} />
            </div>
            <p className="text-fg-subtle text-xs">
              Utility <code className="font-mono">{utilityFor(token)}</code>
              {state && (
                <>
                  {" "}
                  — pair it with the matching variant, e.g.{" "}
                  <code className="font-mono">
                    {state === "hovered" ? "hover:" : state === "pressed" ? "active:" : "disabled:"}
                    {utilityFor(token)}
                  </code>
                </>
              )}
              . In your own CSS, <code className="font-mono">var(--{token})</code>.
            </p>
          </div>
        ) : (
          <p className="text-fg-danger text-sm">
            Not declared. Nothing in the stylesheet defines this combination — the ✕ marks in the columns above are the ones that would break the name you
            currently have.
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <Column
          legend="1 · context"
          question="What are you painting?"
          options={CONTEXTS}
          selected={context}
          onSelect={setContext}
          declared={(value) => declaredNames.has(compose({ context: value }))}
        />
        <Column
          legend="2 · intent"
          question="What does it mean?"
          options={INTENTS}
          selected={intent}
          onSelect={setIntent}
          declared={(value) => declaredNames.has(compose({ intent: value }))}
        />
        <Column
          legend="3 · weight"
          question="How loud, within that meaning?"
          options={WEIGHTS}
          selected={weight}
          onSelect={setWeight}
          declared={(value) => declaredNames.has(compose({ weight: value }))}
        />
        <Column
          legend="4 · state"
          question="When?"
          options={STATES}
          selected={state}
          onSelect={setState}
          declared={(value) => declaredNames.has(compose({ state: value }))}
        />
      </div>
    </div>
  );
}
