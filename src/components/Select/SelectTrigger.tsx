import { cn } from "@sixthshift/design-system/utils";
import { ChevronDown, X } from "lucide-react";
import type { HTMLAttributes, Ref } from "react";
import type { WritableRefObject } from "../../internal/types";

interface SelectTriggerButtonProps {
  setReference: (node: HTMLElement | null) => void;
  /** Consumer ref from Select, attached to this trigger's root element. */
  rootRef?: Ref<HTMLDivElement>;
  listboxId: string;
  open: boolean;
  disabled: boolean;
  collapsed: boolean;
  displayLabel: string;
  showClearButton: boolean;
  className: string | undefined;
  onToggle: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  onClear: (e: React.MouseEvent) => void;
  props: HTMLAttributes<HTMLElement>;
}

export const SelectTriggerButton = ({
  setReference,
  rootRef,
  listboxId,
  open,
  disabled,
  collapsed,
  displayLabel,
  showClearButton,
  className,
  onToggle,
  onKeyDown,
  onClear,
  props,
}: SelectTriggerButtonProps) => {
  // The clear button must be a sibling of the trigger, not a descendant: nesting
  // one interactive control inside another is invalid HTML and leaves assistive
  // tech unable to reach the inner control (axe: nested-interactive).
  const showClear = showClearButton && !collapsed;

  return (
    <div ref={rootRef} className="select-trigger relative w-full">
      <button
        ref={setReference}
        type="button"
        onClick={onToggle}
        onKeyDown={onKeyDown}
        disabled={disabled}
        className={cn(
          `border-(color:--select-trigger-border) focus-visible:ring-(color:--select-trigger-ring) flex w-full cursor-pointer items-center gap-2 rounded-md border bg-(--select-trigger-bg) px-3 py-2 font-medium text-(--select-trigger-fg) text-sm transition-colors hover:bg-(--select-trigger-bg-hovered) focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50`,
          collapsed ? "justify-center" : "justify-between",
          showClear && "pr-9",
          className
        )}
        title={collapsed ? displayLabel : undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        // The listbox unmounts when closed, so only reference it while it exists.
        aria-controls={open ? listboxId : undefined}
        {...props}
      >
        {collapsed ? (
          <span className="font-bold text-xs">{displayLabel.charAt(0)}</span>
        ) : (
          <>
            <span className="truncate">{displayLabel}</span>
            <span className="flex shrink-0 items-center gap-1">
              <ChevronDown className={cn("h-4 w-4 text-(--select-trigger-icon-fg) transition-transform", open && "rotate-180")} />
            </span>
          </>
        )}
      </button>
      {showClear && (
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          className="select-trigger-clear focus-visible:ring-(color:--select-trigger-ring) absolute top-1/2 right-8 -translate-y-1/2 rounded-sm p-0.5 text-(--select-trigger-clear-fg) hover:bg-(--select-trigger-clear-bg-hovered) hover:text-(--select-trigger-clear-fg-hovered) focus-visible:outline-none focus-visible:ring-2"
          aria-label="Clear selection"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

interface SelectTriggerSearchProps {
  setReference: (node: HTMLElement | null) => void;
  /** Consumer ref from Select, attached to this trigger's root element. */
  rootRef?: Ref<HTMLDivElement>;
  listboxId: string;
  /** Id of the highlighted option — the input keeps focus and delegates to it. */
  activeOptionId: string | undefined;
  inputRef: React.RefObject<HTMLInputElement | null>;
  searchValue: string;
  disabled: boolean;
  displayLabel: string;
  open: boolean;
  className: string | undefined;
  onSearchChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
  props: React.InputHTMLAttributes<HTMLInputElement>;
}

export const SelectTriggerSearch = ({
  setReference,
  rootRef,
  listboxId,
  activeOptionId,
  inputRef,
  searchValue,
  disabled,
  displayLabel,
  open,
  className,
  onSearchChange,
  onKeyDown,
  props,
}: SelectTriggerSearchProps) => (
  // floating-ui anchors to this element and the consumer may also want it, so
  // both refs run off one callback rather than one silently winning.
  <div
    ref={(node) => {
      setReference(node);
      if (typeof rootRef === "function") rootRef(node);
      else if (rootRef) (rootRef as WritableRefObject<HTMLDivElement | null>).current = node;
    }}
    className={cn("select-trigger relative flex w-full items-center", className)}
  >
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      value={searchValue}
      onChange={(e) => onSearchChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={displayLabel}
      disabled={disabled}
      className={cn(
        `border-(color:--select-trigger-border) focus-visible:ring-(color:--select-trigger-ring) flex-1 rounded-md border bg-(--select-trigger-bg) px-3 py-2 font-medium text-(--select-trigger-fg) text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50`
      )}
      role="combobox"
      aria-expanded={open}
      aria-controls={listboxId}
      aria-activedescendant={activeOptionId}
      aria-autocomplete="list"
      {...props}
    />
    <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-(--select-trigger-icon-fg)" />
  </div>
);
