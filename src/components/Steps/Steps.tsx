"use client";

import { cn } from "@sixthshift/design-system/utils";
import { cva } from "class-variance-authority";
import { Check } from "lucide-react";
import * as React from "react";

/**
 * Geometry only. Every colour reads a `--steps-*` component token whose value
 * is decided by src/components/Steps/steps.recipe.css, selected by the
 * `data-state` each item renders (`complete`, `current`, `upcoming`).
 */
const stepsVariants = cva("steps flex", {
  variants: {
    orientation: {
      horizontal: "w-full flex-row items-start",
      vertical: "flex-col",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

export type StepsOrientation = "horizontal" | "vertical";

/** Where a step sits relative to `current`. Rendered as `data-state`. */
export type StepState = "complete" | "current" | "upcoming";

export type StepItem = {
  /** Visible step name. */
  label: React.ReactNode;
  /** Secondary line under the label. */
  description?: React.ReactNode;
};

export type StepsProps = Omit<React.OlHTMLAttributes<HTMLOListElement>, "children"> & {
  /** The steps, in order. */
  steps: readonly StepItem[];
  /** Zero-based index of the step in progress. `steps.length` marks every step complete. */
  current: number;
  /**
   * Makes completed steps clickable, for going back in a wizard. Upcoming
   * steps never are — skipping ahead is the flow's decision, not the
   * indicator's.
   */
  onStepClick?: (index: number) => void;
  /** Layout direction. `horizontal` collapses labels to the current step's on narrow screens. */
  orientation?: StepsOrientation;
};

function stateOf(index: number, current: number): StepState {
  if (index < current) return "complete";
  if (index === current) return "current";
  return "upcoming";
}

/**
 * Progress through a fixed sequence — checkout, onboarding, a multi-page
 * form. Display-only: the step in progress is the `current` prop, owned by
 * whatever runs the flow, so there is no internal state to control.
 *
 * Renders an `<ol>` (pass `aria-label`, e.g. "Checkout progress"); the
 * current item carries `aria-current="step"`, and each indicator has a
 * visually hidden status ("completed", "current") so the sequence reads
 * correctly without the colours.
 *
 * With `onStepClick`, completed steps become buttons. Current and upcoming
 * steps stay plain text: a step indicator that let you jump forward would be
 * making the flow's validation decisions for it.
 *
 * Horizontally, every label shows from `sm` up; below that only the current
 * step's label does, so four steps still fit a phone.
 */
export const Steps = React.forwardRef<HTMLOListElement, StepsProps>(({ className, steps, current, onStepClick, orientation = "horizontal", ...props }, ref) => {
  const isHorizontal = orientation === "horizontal";

  return (
    <ol ref={ref} data-orientation={orientation} className={stepsVariants({ orientation, className })} {...props}>
      {steps.map((step, index) => {
        const state = stateOf(index, current);
        const isLast = index === steps.length - 1;
        const clickable = state === "complete" && onStepClick !== undefined;

        const indicator = (
          <span className="steps-indicator border-(color:--steps-indicator-border) relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-(--steps-indicator-bg) font-semibold text-(--steps-indicator-fg) text-sm transition-colors">
            {state === "complete" ? <Check aria-hidden="true" className="size-4" strokeWidth={3} /> : index + 1}
          </span>
        );

        const text = (
          <span
            className={cn("flex min-w-0 flex-col", isHorizontal ? "items-center text-center" : "pt-1", isHorizontal && state !== "current" && "max-sm:sr-only")}
          >
            <span className="font-medium text-(--steps-label-fg) text-sm">{step.label}</span>
            {step.description !== undefined && <span className="text-(--steps-description-fg) text-xs">{step.description}</span>}
            {state !== "upcoming" && <span className="sr-only">{state === "complete" ? "(completed)" : "(current)"}</span>}
          </span>
        );

        const body = (
          <>
            {indicator}
            {text}
          </>
        );

        const bodyClass = cn("flex gap-2", isHorizontal ? "flex-col items-center" : "flex-row items-start gap-3");

        return (
          <li
            // biome-ignore lint/suspicious/noArrayIndexKey: a step is its position — the sequence is fixed and never reorders
            key={index}
            data-state={state}
            aria-current={state === "current" ? "step" : undefined}
            className={cn("steps-item relative", isHorizontal ? "flex flex-1 justify-center" : "flex pb-6 last:pb-0")}
          >
            {!isLast && (
              <span
                aria-hidden="true"
                className={cn(
                  "steps-connector absolute bg-(--steps-connector-bg)",
                  isHorizontal ? "top-4 left-1/2 h-0.5 w-full -translate-y-1/2" : "top-8 bottom-0 left-4 w-0.5 -translate-x-1/2"
                )}
              />
            )}
            {clickable ? (
              <button
                type="button"
                onClick={() => onStepClick(index)}
                className={cn(
                  bodyClass,
                  "focus-visible:ring-(color:--steps-ring) cursor-pointer rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 [&:hover_.steps-indicator]:bg-(--steps-indicator-bg-hovered)"
                )}
              >
                {body}
              </button>
            ) : (
              <span className={bodyClass}>{body}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
});
Steps.displayName = "Steps";

export { stepsVariants };
