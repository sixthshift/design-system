import { FloatingPortal, type FloatingPortalProps } from "@floating-ui/react";
import { Button } from "@sixthshift/design-system/button";
import { usePresence } from "@sixthshift/design-system/hooks";
import { Message, MessageBody, MessageDescription, MessageIcon, type MessageProps, MessageTitle } from "@sixthshift/design-system/message";
import { cn } from "@sixthshift/design-system/utils";
import { X } from "lucide-react";
import * as React from "react";

// =============================================================================
// Types
// =============================================================================

export type ToastProps = Omit<MessageProps, "size"> & {
  /** Called when toast closes (after exit animation) */
  onClose?: () => void;
  /** Optional action button label */
  action?: string;
  /** Called when action button is clicked */
  onAction?: () => void;
  /** Portal root element (default: document.body) */
  root?: FloatingPortalProps["root"];
  /**
   * Whether Toast should render in a portal and position itself.
   * Set to false when Toast is rendered by a parent that handles positioning (e.g., OverlayContext).
   * @default true
   */
  standalone?: boolean;
};

// =============================================================================
// Toast
// =============================================================================

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, intent = "neutral", title, icon, action, onAction, onClose, root, standalone = true, children, ...props }, ref) => {
    const { ref: presenceRef, state, isMounted, show, hide } = usePresence();

    // Start enter animation on mount
    React.useEffect(() => {
      show();
    }, [show]);

    // Handle close with exit animation
    const handleClose = React.useCallback(() => {
      hide(() => {
        onClose?.();
      });
    }, [hide, onClose]);

    // Merge refs
    const mergedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        presenceRef(node);
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [presenceRef, ref]
    );

    if (!isMounted) return null;

    const isEntering = state === "entering";
    const isExiting = state === "exiting";

    const content = (
      <div
        ref={mergedRef}
        className={cn(
          "max-w-sm shadow-lg",
          standalone && "fixed bottom-6 left-1/2 z-toast -translate-x-1/2",
          isEntering && "animate-fade-in",
          isExiting && "animate-fade-out",
          className
        )}
        {...props}
      >
        <Message intent={intent}>
          {icon && <MessageIcon>{icon}</MessageIcon>}
          <MessageBody>
            {title && <MessageTitle>{title}</MessageTitle>}
            <MessageDescription>
              {children}
              {action && (
                <div className="mt-2">
                  <Button variant="link" size="sm" className="h-auto p-0 font-medium" onClick={onAction}>
                    {action}
                  </Button>
                </div>
              )}
            </MessageDescription>
          </MessageBody>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-70 hover:opacity-100" onClick={handleClose} aria-label="Dismiss">
              <X className="h-4 w-4" />
            </Button>
          )}
        </Message>
      </div>
    );

    if (standalone) {
      return <FloatingPortal {...(root ? { root } : {})}>{content}</FloatingPortal>;
    }

    return content;
  }
);
Toast.displayName = "Toast";
