import * as React from "react";

/**
 * Merges multiple refs into a single callback ref.
 */
function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return (node) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    });
  };
}

/**
 * Merges two props objects, composing event handlers and merging classNames.
 */
function mergeProps(parentProps: Record<string, unknown>, childProps: Record<string, unknown>): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...parentProps };

  for (const key of Object.keys(childProps)) {
    const parentValue = parentProps[key];
    const childValue = childProps[key];

    // Compose event handlers
    if (key.startsWith("on") && typeof parentValue === "function" && typeof childValue === "function") {
      merged[key] = (...args: unknown[]) => {
        childValue(...args);
        parentValue(...args);
      };
    }
    // Merge classNames
    else if (key === "className" && parentValue && childValue) {
      merged[key] = `${parentValue} ${childValue}`;
    }
    // Merge styles
    else if (key === "style" && parentValue && childValue) {
      merged[key] = { ...(parentValue as object), ...(childValue as object) };
    }
    // Child value takes precedence for other props
    else if (childValue !== undefined) {
      merged[key] = childValue;
    }
  }

  return merged;
}

export type SlotProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
};

/**
 * Slot merges its props onto its immediate child element.
 * Used for the "asChild" pattern - allows replacing the rendered element
 * while keeping all component behavior.
 */
export const Slot = React.forwardRef<HTMLElement, SlotProps>(({ children, ...props }, ref) => {
  if (!React.isValidElement(children)) {
    console.warn("Slot requires a valid React element as its child");
    return null;
  }

  const childRef = (children as React.ReactElement & { ref?: React.Ref<HTMLElement> }).ref;

  return React.cloneElement(children, {
    ...mergeProps(props, children.props as Record<string, unknown>),
    ref: ref ? mergeRefs(ref, childRef) : childRef,
  } as React.HTMLAttributes<HTMLElement>);
});
Slot.displayName = "Slot";
