import { cn } from "@sixthshift/design-system/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { MessageBody } from "./components/MessageBody";
import { MessageDescription } from "./components/MessageDescription";
import { MessageIcon } from "./components/MessageIcon";
import { MessageTitle } from "./components/MessageTitle";

export const messageVariants = cva("flex gap-3 rounded-lg border p-4 text-sm [&>svg]:shrink-0", {
  variants: {
    intent: {
      neutral: "border-border-normal bg-bg-normal text-fg-normal",
      success: "border-border-success bg-bg-success-subtle text-fg-on-success-subtle",
      warning: "border-border-warning bg-bg-warning-subtle text-fg-on-warning-subtle",
      danger: "border-border-danger bg-bg-danger-subtle text-fg-on-danger-subtle",
    },
    size: {
      default: "p-4",
      sm: "gap-2 p-3 text-xs",
    },
  },
  defaultVariants: {
    intent: "neutral",
    size: "default",
  },
});

export type MessageProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof messageVariants> & {
    /** Simple API: Optional title displayed above children */
    title?: React.ReactNode;
    /** Simple API: Optional icon displayed on the left */
    icon?: React.ReactNode;
  };

/**
 * A message is a live region, and the intent decides how rudely it interrupts.
 * `danger` is the only intent that earns `role="alert"` — an assertive region
 * cuts off whatever the screen reader was saying. Everything else is
 * `role="status"` (polite), which is announced at the next natural pause. A
 * success confirmation or a static "Note" callout stamped as `alert` trains
 * users to ignore the role that actually matters. Consumers can override by
 * passing their own `role` — `props` is spread after this.
 */
const intentRole = {
  neutral: "status",
  success: "status",
  warning: "status",
  danger: "alert",
} as const;

export const Message = React.forwardRef<HTMLDivElement, MessageProps>(({ className, intent = "neutral", size, title, icon, children, ...props }, ref) => {
  const hasCompoundChildren = React.Children.toArray(children).some(
    (child) =>
      React.isValidElement(child) &&
      (child.type === MessageIcon || child.type === MessageBody || child.type === MessageTitle || child.type === MessageDescription)
  );

  return (
    <div ref={ref} role={intentRole[intent ?? "neutral"]} className={cn(messageVariants({ intent, size, className }))} {...props}>
      {hasCompoundChildren ? (
        children
      ) : (
        <>
          {icon && <MessageIcon>{icon}</MessageIcon>}
          <MessageBody>
            {title && <MessageTitle>{title}</MessageTitle>}
            <MessageDescription>{children}</MessageDescription>
          </MessageBody>
        </>
      )}
    </div>
  );
});
Message.displayName = "Message";
