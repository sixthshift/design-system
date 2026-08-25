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
  label: string;
  description?: string;
  feedback?: FormFieldFeedback;
  required?: boolean;
};

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(({ className, label, description, feedback, required, children, id, ...props }, ref) => {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const feedbackId = feedback ? `${fieldId}-feedback` : undefined;

  return (
    <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props}>
      <Label htmlFor={fieldId}>
        {label}
        {required && <span className="ml-0.5 text-fg-danger">*</span>}
      </Label>

      {description && <Muted id={descriptionId}>{description}</Muted>}

      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            id: fieldId,
            "aria-describedby": cn(descriptionId, feedbackId) || undefined,
            "aria-invalid": feedback?.intent === "danger" ? true : undefined,
          } as React.HTMLAttributes<HTMLElement>);
        }
        return child;
      })}

      {feedback && (
        <Message id={feedbackId} intent={feedback.intent} size="sm">
          {feedback.message}
        </Message>
      )}
    </div>
  );
});
FormField.displayName = "FormField";

export { FormField };
