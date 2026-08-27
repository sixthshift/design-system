import { cn } from "@sixthshift/design-system/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { MessageBody } from "./components/MessageBody";
import { MessageDescription } from "./components/MessageDescription";
import { MessageIcon } from "./components/MessageIcon";
import { MessageTitle } from "./components/MessageTitle";

/**
 * Geometry only, plus the three `--message-*` component tokens.
 *
 * Every colour reads a `--message-*` component token whose value is decided by
 * src/theme/recipes/message.css. That file is the mapping from `intent` to a
 * semantic token — the layer that used to be the `intent` entry in `variants`
 * here, compiled into class-name literals and unreachable from outside.
 * `size` stays here: it is pure geometry (padding, gap, font-size), not
 * colour, so it has no reason to move.
 */
export const messageVariants = cva(
  // One literal, deliberately: `useSortedClasses --unsafe` strips the trailing
  // space before a `+`, silently welding the last class of one fragment to the
  // first of the next. A single string means the sorter has nothing to break.
  "message border-(color:--message-border) flex gap-3 rounded-lg border bg-(--message-bg) p-4 text-(--message-fg) text-sm [&>svg]:shrink-0",
  {
    variants: {
      size: {
        md: "p-4",
        sm: "gap-2 p-3 text-xs",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

/**
 * Widened deliberately, same reasoning as `ButtonIntent` in Button.tsx: adding
 * an intent is a CSS change in the consuming app (a new `.message[data-intent=…]`
 * cell in message.css), not a release here, so the type has to admit values
 * this file has never heard of while still autocompleting the ones it ships.
 */
type Loose<T extends string> = T | (string & {});

export type MessageIntentName = "neutral" | "success" | "warning" | "danger";
export type MessageIntent = Loose<MessageIntentName>;

export type MessageProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof messageVariants> & {
    intent?: MessageIntent | undefined;
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
 *
 * `intent` is widened to admit values this file has never heard of (see
 * `MessageIntent` above), so this is deliberately not a lookup keyed by the
 * closed union: an unrecognised intent has no entry and must fall through to
 * `"status"` rather than resolving to `undefined`, which would render with no
 * live-region role at all.
 */
const ALERT_INTENTS: ReadonlySet<string> = new Set<MessageIntentName>(["danger"]);
function intentRole(intent: MessageIntent): "status" | "alert" {
  return ALERT_INTENTS.has(intent) ? "alert" : "status";
}

/**
 * An inline feedback banner — info, success, warning, or error — that
 * renders wherever the caller places it and stays until the caller removes
 * it. Reach for `Message` over `Toast` when the feedback belongs in the
 * page's own layout (form validation, an in-card load error); reach for
 * `Toast` when it should float above the page and disappear on its own.
 * `Toast` itself renders a `Message` internally.
 *
 * `intent` (`"neutral"` (default) | `"success"` | `"warning"` | `"danger"`,
 * widened to accept any string) drives both the color, via `--message-*`
 * component tokens, and the ARIA live-region role: `"danger"` is the only
 * intent that gets `role="alert"` (assertive — cuts off whatever a screen
 * reader was announcing); every other intent, including one this library has
 * never heard of, gets `role="status"` (polite — announced at the next
 * natural pause). An unrecognised intent still falls through to
 * `role="status"` rather than resolving to no role at all. `role` can be
 * overridden directly if a specific case needs it. `size` (`"md"` | `"sm"`)
 * is geometry only (padding/gap/font-size) and carries no color.
 *
 * Two ways to give it content: the simple API (`title` + `icon` props, with
 * `children` as the description), or compound children (`Message.Icon`,
 * `Message.Body`, `Message.Title`, `Message.Description`) for layouts the
 * simple API can't express. Message detects which one is in use by
 * inspecting its children, so the two aren't meant to be mixed.
 */
export const Message = React.forwardRef<HTMLDivElement, MessageProps>(({ className, intent = "neutral", size, title, icon, children, ...props }, ref) => {
  const hasCompoundChildren = React.Children.toArray(children).some(
    (child) =>
      React.isValidElement(child) &&
      (child.type === MessageIcon || child.type === MessageBody || child.type === MessageTitle || child.type === MessageDescription)
  );

  return (
    <div ref={ref} role={intentRole(intent)} data-intent={intent} className={cn(messageVariants({ size, className }))} {...props}>
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
