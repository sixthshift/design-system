"use client";

import { autoUpdate, FloatingPortal, flip, offset, shift, size, useFloating } from "@floating-ui/react";
import { cn } from "@sixthshift/design-system/utils";
import { Search, X } from "lucide-react";
import * as React from "react";
import { closestBrand } from "../../internal/brandScope";
import { useEscapeLayer } from "../../internal/escapeLayers";

/** One row in the suggestions dropdown. SearchInput's own type, not Select's `SelectOption`. */
export type SearchInputSuggestion = {
  /** Text written into the field when the row is picked. Also the row's key, so keep it unique. */
  value: string;
  /** What the row shows. Defaults to `value`. */
  label?: string;
};

export type SearchInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onSubmit"> & {
  value: string;
  /** Called with the input's string value on every change. The native `onChange(event)` also fires, unchanged. */
  onValueChange: (value: string) => void;
  onClear?: () => void;
  /** Accessible name for the clear button — it is icon-only. */
  clearLabel?: string;
  /** Enter pressed with no suggestion highlighted — the free-text commit. A surrounding `<form>` still submits natively. */
  onSubmit?: (value: string) => void;
  /**
   * Rows for the dropdown, rendered as given — SearchInput never filters them.
   * Derive them from `value` (filter a static list, or fetch). Passing this,
   * even as `[]`, makes the field a combobox; omit it for a plain search field.
   */
  suggestions?: readonly SearchInputSuggestion[];
  /** A suggestion was picked. Runs after the field has been set to `suggestion.value`. */
  onSuggestionSelect?: (suggestion: SearchInputSuggestion) => void;
  /** The caller is fetching suggestions. Rows already shown stay until new ones arrive. */
  loading?: boolean;
  /** Shown while `loading` and there are no rows yet. */
  loadingMessage?: string;
  /** Shown when the field has text and `suggestions` is empty. Omit to close the dropdown instead. */
  emptyMessage?: string;
  /** Accessible name for the suggestions listbox. */
  suggestionsLabel?: string;
};

/** The icon slots, duplicated from Input's. */
const iconSlotStyles = `absolute top-1/2 -translate-y-1/2 text-(--search-input-icon-fg)
  [&_svg]:h-4 [&_svg]:w-4
  [&_button]:flex [&_button]:cursor-pointer [&_button]:appearance-none
  [&_button]:border-0 [&_button]:bg-transparent`;

const suggestionId = (listboxId: string, index: number) => `${listboxId}-option-${index}`;

/**
 * Text input specialised for search: a search icon fixed on the left and,
 * once there is a value, a clear button on the right.
 *
 * Its own field, not a wrapped `Input`: the markup and classes are duplicated
 * from Input on purpose, so importing SearchInput pulls in nothing else and
 * its colours are its own `--search-input-*` tokens. Always controlled — `value` is required and
 * there is no `defaultValue`/uncontrolled mode. `onValueChange` receives the
 * string value directly; the native `onChange` keeps its event signature and
 * fires too if passed. Clearing calls `onClear` if provided, otherwise calls
 * `onValueChange("")` — note a programmatic clear dispatches no native event.
 *
 * With `suggestions` it becomes an editable combobox (WAI-ARIA 1.2,
 * `aria-autocomplete="list"`). Free text stays first-class: no row is
 * highlighted until the user arrows into the list, so Enter commits what was
 * typed. The dropdown is duplicated from Select's rather than imported, for the
 * same reason the field is duplicated from Input's.
 */
const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      value,
      onValueChange,
      onChange,
      onClear,
      clearLabel = "Clear search",
      onSubmit,
      suggestions,
      onSuggestionSelect,
      loading = false,
      loadingMessage = "Loading…",
      emptyMessage,
      suggestionsLabel = "Suggestions",
      onKeyDown,
      onFocus,
      onBlur,
      onClick,
      disabled,
      ...props
    },
    ref
  ) => {
    const isCombobox = suggestions !== undefined;
    const rows = suggestions ?? [];

    // `open` is intent — focused and not dismissed. Whether anything actually
    // shows also depends on there being something to show.
    const [open, setOpen] = React.useState(false);
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
    const optionRefs = React.useRef<Map<number, HTMLButtonElement>>(new Map());
    const listboxRef = React.useRef<HTMLDivElement | null>(null);

    const status = loading && rows.length === 0 ? loadingMessage : rows.length === 0 && value && emptyMessage ? emptyMessage : undefined;
    const shown = isCombobox && open && !disabled && (rows.length > 0 || status !== undefined);

    // The rows changed under the user — a new fetch, a new filter — so the old
    // highlight points at something else, or at nothing. Keyed on the values,
    // not the array, so a parent re-rendering with an equal fresh array keeps it.
    const rowsKey = rows.map((s) => s.value).join("\u0000");
    // biome-ignore lint/correctness/useExhaustiveDependencies: rowsKey is the trigger, not a value read inside.
    React.useEffect(() => {
      setHighlightedIndex(-1);
    }, [rowsKey]);

    const { refs, elements, floatingStyles } = useFloating({
      open: shown,
      placement: "bottom-start",
      middleware: [
        offset(4),
        flip(),
        shift({ padding: 8 }),
        size({
          apply({ rects, elements }) {
            Object.assign(elements.floating.style, { width: `${rects.reference.width}px` });
          },
        }),
      ],
      whileElementsMounted: autoUpdate,
    });

    // While shown, Escape closes the dropdown and must not also close a
    // Modal/Sheet this field is rendered inside.
    useEscapeLayer(shown);

    // Scroll the highlighted row into view, as Select does.
    React.useEffect(() => {
      if (!shown || highlightedIndex < 0) return;
      const el = optionRefs.current.get(highlightedIndex);
      const listbox = listboxRef.current;
      if (!el || !listbox) return;
      const top = el.offsetTop;
      const bottom = top + el.offsetHeight;
      if (top < listbox.scrollTop) listbox.scrollTop = top;
      else if (bottom > listbox.scrollTop + listbox.clientHeight) listbox.scrollTop = bottom - listbox.clientHeight;
    }, [highlightedIndex, shown]);

    const handleClear = () => {
      if (onClear) {
        onClear();
      } else {
        onValueChange("");
      }
    };

    const pick = (suggestion: SearchInputSuggestion) => {
      onValueChange(suggestion.value);
      onSuggestionSelect?.(suggestion);
      setOpen(false);
      setHighlightedIndex(-1);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;

      if (isCombobox) {
        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            if (!shown) setOpen(true);
            else setHighlightedIndex((i) => Math.min(i + 1, rows.length - 1));
            return;
          case "ArrowUp":
            // Up from the first row returns to the typed text (-1).
            if (!shown) return;
            event.preventDefault();
            setHighlightedIndex((i) => Math.max(i - 1, -1));
            return;
          case "Escape":
            if (!shown) return;
            event.preventDefault();
            setOpen(false);
            setHighlightedIndex(-1);
            return;
          case "Enter": {
            const row = shown && highlightedIndex >= 0 ? rows[highlightedIndex] : undefined;
            if (row) {
              // Picking a row is not a submit: keep a surrounding form from submitting too.
              event.preventDefault();
              pick(row);
              return;
            }
            setOpen(false);
            break;
          }
        }
      }

      if (event.key === "Enter" && !event.nativeEvent.isComposing) onSubmit?.(value);
    };

    const listboxId = React.useId();
    const activeId = shown && highlightedIndex >= 0 && highlightedIndex < rows.length ? suggestionId(listboxId, highlightedIndex) : undefined;

    const comboboxProps = isCombobox
      ? {
          role: "combobox",
          "aria-autocomplete": "list" as const,
          "aria-expanded": shown,
          "aria-controls": shown ? listboxId : undefined,
          "aria-activedescendant": activeId,
          // The browser's own autofill list would sit on top of ours.
          autoComplete: "off",
        }
      : {};

    return (
      <div ref={refs.setReference} className={cn("search-input relative h-9 w-full text-sm", className)}>
        <span className={cn(iconSlotStyles, "left-3")}>
          <Search />
        </span>
        <input
          ref={ref}
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => {
            onValueChange(e.target.value);
            onChange?.(e);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={(e) => {
            onFocus?.(e);
            setOpen(true);
          }}
          onBlur={(e) => {
            onBlur?.(e);
            setOpen(false);
            setHighlightedIndex(-1);
          }}
          onClick={(e) => {
            onClick?.(e);
            setOpen(true);
          }}
          className={cn(
            "border-(color:--search-input-border) focus-visible:ring-(color:--search-input-ring) flex h-full w-full rounded-md border bg-(--search-input-bg) py-1 text-[length:inherit] shadow-xs transition-colors placeholder:text-(--search-input-placeholder-fg) focus-visible:outline-hidden focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
            "pl-9",
            value ? "pr-9" : "pr-3"
          )}
          {...comboboxProps}
          {...props}
        />
        {value && (
          <span className={cn(iconSlotStyles, "right-3")}>
            <button type="button" onClick={handleClear} aria-label={clearLabel} className="rounded-sm hover:bg-(--search-input-clear-bg-hovered)">
              <X />
            </button>
          </span>
        )}

        {shown && (
          <FloatingPortal>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              data-brand={closestBrand(elements.domReference)}
              className="search-input-dropdown border-(color:--search-input-dropdown-border) z-popover overflow-hidden rounded-md border bg-(--search-input-dropdown-bg) text-sm shadow-lg"
            >
              <div
                ref={listboxRef}
                id={listboxId}
                role="listbox"
                aria-label={suggestionsLabel}
                aria-busy={loading || undefined}
                className="max-h-60 overflow-y-auto"
              >
                {rows.map((suggestion, index) => {
                  const isHighlighted = index === highlightedIndex;
                  return (
                    <button
                      key={suggestion.value}
                      type="button"
                      ref={(el) => {
                        if (el) optionRefs.current.set(index, el);
                        else optionRefs.current.delete(index);
                      }}
                      id={suggestionId(listboxId, index)}
                      role="option"
                      // Not a tab stop: the input keeps focus and points at
                      // this row through aria-activedescendant.
                      tabIndex={-1}
                      // In a combobox popup the active option is the selected one.
                      aria-selected={isHighlighted}
                      data-highlighted={isHighlighted ? "true" : undefined}
                      // Focus never leaves the input: a mousedown here would
                      // otherwise blur it and close the dropdown before the
                      // click lands.
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => pick(suggestion)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className="search-input-option flex w-full cursor-pointer items-center border-0 bg-(--search-input-option-bg) px-3 py-2 text-left text-(--search-input-option-fg) transition-colors"
                    >
                      {suggestion.label ?? suggestion.value}
                    </button>
                  );
                })}
              </div>
              {status !== undefined && (
                <div role="status" className="px-3 py-2 text-center text-(--search-input-dropdown-status-fg)">
                  {status}
                </div>
              )}
            </div>
          </FloatingPortal>
        )}
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
