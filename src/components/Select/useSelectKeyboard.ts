import { useCallback } from "react";
import type { SelectOption } from "./Select";

interface UseSelectKeyboardOptions<T extends string> {
  open: boolean;
  searchable: boolean;
  searchValue: string;
  highlightedIndex: number;
  displayOptions: readonly SelectOption<T>[];
  setOpen: (open: boolean) => void;
  setHighlightedIndex: React.Dispatch<React.SetStateAction<number>>;
  setSearchValue: (value: string) => void;
  handleSelect: (value: T) => void;
  focusTrigger: () => void;
}

/**
 * Returns the keydown handler for an open Select. It is attached to the element
 * that actually holds focus — the listbox, or the search input in searchable
 * mode — rather than to `document`.
 *
 * A document-level listener fired for every keystroke on the page while any
 * Select was open, which meant a Select could swallow Escape or an arrow key
 * from an overlay stacked above it, and two open Selects raced each other. It
 * also decoupled key handling from focus, so nothing guaranteed the element the
 * user was typing into was the one being navigated. Scoping the handler to the
 * focused element makes both problems structurally impossible and is what lets
 * `aria-activedescendant` mean something: the focused element owns the active
 * option.
 */
export function useSelectKeyboard<T extends string>({
  open,
  searchable,
  searchValue,
  highlightedIndex,
  displayOptions,
  setOpen,
  setHighlightedIndex,
  setSearchValue,
  handleSelect,
  focusTrigger,
}: UseSelectKeyboardOptions<T>) {
  return useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (!open) return;

      const isTyping = searchable && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
      if (isTyping) return;

      switch (event.key) {
        case "Escape":
          event.preventDefault();
          if (searchable && searchValue) {
            setSearchValue("");
            setHighlightedIndex(0);
          } else {
            setOpen(false);
            focusTrigger();
          }
          break;

        case "ArrowDown":
          event.preventDefault();
          setHighlightedIndex((prev) => (prev < displayOptions.length - 1 ? prev + 1 : prev));
          break;

        case "ArrowUp":
          event.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;

        case "Home":
          event.preventDefault();
          setHighlightedIndex(0);
          break;

        case "End":
          event.preventDefault();
          setHighlightedIndex(displayOptions.length - 1);
          break;

        case "Enter":
          event.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < displayOptions.length) {
            handleSelect(displayOptions[highlightedIndex]!.value);
          }
          break;

        case " ":
          if (!searchable) {
            event.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < displayOptions.length) {
              handleSelect(displayOptions[highlightedIndex]!.value);
            }
          }
          break;

        case "Tab":
          setOpen(false);
          break;

        default:
          if (!searchable && event.key.length === 1) {
            const letter = event.key.toLowerCase();
            const startIndex = highlightedIndex + 1;
            const matchIndex = displayOptions.findIndex((opt, idx) => idx >= startIndex && opt.label.toLowerCase().startsWith(letter));

            if (matchIndex >= 0) {
              setHighlightedIndex(matchIndex);
            } else {
              const wrapMatchIndex = displayOptions.findIndex((opt) => opt.label.toLowerCase().startsWith(letter));
              if (wrapMatchIndex >= 0) {
                setHighlightedIndex(wrapMatchIndex);
              }
            }
          }
      }
    },
    [open, searchable, searchValue, highlightedIndex, displayOptions, setOpen, setHighlightedIndex, setSearchValue, handleSelect, focusTrigger]
  );
}
