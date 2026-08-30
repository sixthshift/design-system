"use client";

import { Label } from "@sixthshift/design-system/label";
import { Message } from "@sixthshift/design-system/message";
import { Muted } from "@sixthshift/design-system/muted";
import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

export type FormFieldFeedback = {
  message: string;
  intent: "danger" | "success" | "warning";
};

export type FormFieldProps = React.HTMLAttributes<HTMLDivElement> & {
  label: React.ReactNode;
  description?: React.ReactNode;
  feedback?: FormFieldFeedback;
  required?: boolean;
};

/** What FormField knows about the control it wraps — see `useFormField`. */
export type FormFieldContextValue = {
  /** The id the control should carry, and the label's `htmlFor` target. */
  id: string;
  /** Space-separated ids of the description/feedback texts, for `aria-describedby`. `undefined` when there are none. */
  describedBy: string | undefined;
  /** True when `feedback.intent` is `"danger"` — the control should set `aria-invalid`. */
  invalid: boolean;
  /** Mirrors the `required` prop, for `aria-required`/`required` on the control. */
  required: boolean;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

/**
 * The wiring `FormField` provides to whatever control it wraps: `id`,
 * `describedBy`, `invalid`, `required`. Direct element children get these
 * cloned on automatically; a control nested deeper — inside a wrapper div, a
 * render prop, a custom composite — can call this instead and apply them
 * itself. Returns `null` outside a `FormField`.
 */
export const useFormField = () => React.useContext(FormFieldContext);

/**
 * Wraps a form control with a label, optional description, and optional
 * validation feedback — the composition point for `Input`, `Textarea`,
 * `Select` and similar controls inside a form.
 *
 * Generates an `id` (or uses the one passed in) and wires it, plus
 * `aria-describedby` (pointing at the description and/or feedback text),
 * `aria-invalid` (when `feedback.intent` is `"danger"`) and `aria-required`
 * (when `required`), onto the first element child. A child's own attributes
 * win: an explicit `id` is kept (and becomes the label's `htmlFor` target),
 * an existing `aria-describedby` is merged with FormField's rather than
 * replaced. Controls that aren't the first element child can self-wire via
 * `useFormField`.
 *
 * Distinct from `Field`, which displays a read-only label/value pair rather
 * than wrapping an interactive control.
 */
const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, description, feedback, required = false, children, id, ...props }, ref) => {
    const generatedId = React.useId();
    const fieldId = id ?? generatedId;

    // The label must point at the id the control actually carries: when the
    // (first element) child brings its own id, that id wins over ours.
    const childArray = React.Children.toArray(children);
    const firstElementIndex = childArray.findIndex((child) => React.isValidElement(child));
    const firstElement = firstElementIndex === -1 ? null : (childArray[firstElementIndex] as React.ReactElement<React.HTMLAttributes<HTMLElement>>);
    const controlId = firstElement?.props.id ?? fieldId;

    const descriptionId = description ? `${fieldId}-description` : undefined;
    const feedbackId = feedback ? `${fieldId}-feedback` : undefined;
    const invalid = feedback?.intent === "danger";

    const contextValue = React.useMemo<FormFieldContextValue>(
      () => ({
        id: controlId,
        describedBy: cn(descriptionId, feedbackId) || undefined,
        invalid,
        required,
      }),
      [controlId, descriptionId, feedbackId, invalid, required]
    );

    const wiredChildren = childArray.map((child, index) => {
      if (index !== firstElementIndex || !React.isValidElement(child)) return child;
      const childProps = child.props as React.HTMLAttributes<HTMLElement>;
      return React.cloneElement(child, {
        id: controlId,
        // The child's own describedby (a tooltip, an external hint) is kept and
        // FormField's ids are appended, rather than overwritten.
        "aria-describedby": cn(childProps["aria-describedby"], descriptionId, feedbackId) || undefined,
        "aria-invalid": childProps["aria-invalid"] ?? (invalid ? true : undefined),
        "aria-required": childProps["aria-required"] ?? (required ? true : undefined),
      } as React.HTMLAttributes<HTMLElement>);
    });

    return (
      <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props}>
        <Label htmlFor={controlId}>
          {label}
          {required && <span className="ml-0.5 text-fg-danger">*</span>}
        </Label>

        {description && <Muted id={descriptionId}>{description}</Muted>}

        <FormFieldContext.Provider value={contextValue}>{wiredChildren}</FormFieldContext.Provider>

        {feedback && (
          <Message id={feedbackId} intent={feedback.intent} size="sm">
            {feedback.message}
          </Message>
        )}
      </div>
    );
  }
);
FormField.displayName = "FormField";

export { FormField };
