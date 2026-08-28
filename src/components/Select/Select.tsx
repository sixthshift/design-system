"use client";

import { autoUpdate, flip, offset, shift, size, useFloating } from "@floating-ui/react";
import { useControllableState } from "@sixthshift/design-system/hooks";
import { forwardRef, type HTMLAttributes, type ReactElement, type Ref, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { SelectDropdown, selectOptionId } from "./SelectDropdown";
import { SelectTriggerButton, SelectTriggerSearch } from "./SelectTrigger";
import { useSelectKeyboard } from "./useSelectKeyboard";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
};

type SelectBaseProps<T extends string = string> = Omit<HTMLAttributes<HTMLElement>, "onChange" | "value" | "defaultValue"> & {
  options: readonly SelectOption<T>[];
  onBlur?: () => void;
  onFocus?: () => void;
  collapsed?: boolean;
  disabled?: boolean;
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
};

type SelectSingleProps<T extends string = string> = SelectBaseProps<T> & {
  mode?: "single";
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
};

type SelectMultipleProps<T extends string = string> = SelectBaseProps<T> & {
  mode: "multiple";
  value?: T[];
  defaultValue?: T[];
  onValueChange?: (value: T[]) => void;
};

export type SelectProps<T extends string = string> = SelectSingleProps<T> | SelectMultipleProps<T>;

/**
 * `forwardRef` erases the generic, so the implementation takes the ref as an
 * ordinary second argument and the exported `Select` re-declares the generic
 * signature over it. Consumers keep `Select<"a" | "b">` inference *and* get a
 * ref; without the cast they would have to choose.
 */
const SelectRoot = forwardRef(function SelectRoot<T extends string = string>(props: SelectProps<T>, rootRef: Ref<HTMLDivElement>) {
  const {
    options,
    onBlur,
    onFocus,
    collapsed = false,
    className,
    disabled = false,
    placeholder = "Select...",
    searchable = false,
    clearable = false,
    ...restProps
  } = props;

  const isMultiple = props.mode === "multiple";

  // Single-mode state
  const [singleValue, setSingleValue] = useControllableState({
    value: !isMultiple ? props.value : undefined,
    defaultValue: (!isMultiple ? props.defaultValue : undefined) ?? ("" as T),
    onChange: !isMultiple ? props.onValueChange : undefined,
  });

  // Multiple-mode state
  const [multiValue, setMultiValue] = useControllableState({
    value: isMultiple ? props.value : undefined,
    defaultValue: (isMultiple ? props.defaultValue : undefined) ?? ([] as T[]),
    onChange: isMultiple ? props.onValueChange : undefined,
  });

  const [open, setOpen] = useControllableState({ value: undefined, defaultValue: false });
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchValue, setSearchValue] = useState("");
  const listboxRef = useRef<HTMLDivElement | null>(null);
  // Also held in state: the listbox is portalled, and FloatingPortal creates its
  // container in an effect, so the node lands a commit after `open` flips. A ref
  // alone is still null when the open effect runs — state re-renders us when the
  // node actually arrives.
  const [listboxNode, setListboxNode] = useState<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const wasOpenRef = useRef(false);

  const selectedValues: Set<T> = useMemo(
    () => (isMultiple ? new Set(multiValue) : singleValue ? new Set([singleValue]) : new Set()),
    [isMultiple, multiValue, singleValue]
  );

  const displayLabel = useMemo(() => {
    if (isMultiple) {
      if (multiValue.length === 0) return placeholder;
      if (multiValue.length === 1) return options.find((o) => o.value === multiValue[0])?.label ?? placeholder;
      return `${multiValue.length} selected`;
    }
    return options.find((o) => o.value === singleValue)?.label ?? placeholder;
  }, [isMultiple, multiValue, singleValue, options, placeholder]);

  const filteredOptions = searchable && searchValue ? options.filter((opt) => opt.label.toLowerCase().includes(searchValue.toLowerCase())) : options;
  const hasValue = isMultiple ? multiValue.length > 0 : Boolean(singleValue);
  const showClearButton = clearable && hasValue && !disabled;

  // Floating UI
  const { refs, floatingStyles } = useFloating({
    open,
    onOpenChange: setOpen,
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

  const setListbox = useCallback((node: HTMLDivElement | null) => {
    listboxRef.current = node;
    setListboxNode(node);
  }, []);

  const focusTrigger = useCallback(() => {
    (refs.reference.current as HTMLElement | null)?.focus();
  }, [refs.reference]);

  const handleSelect = useCallback(
    (optionValue: T) => {
      if (isMultiple) {
        setMultiValue(selectedValues.has(optionValue) ? multiValue.filter((v) => v !== optionValue) : [...multiValue, optionValue]);
      } else {
        setSingleValue(optionValue);
        setSearchValue("");
        setOpen(false);
        focusTrigger();
      }
    },
    [isMultiple, selectedValues, multiValue, setMultiValue, setSingleValue, setOpen, focusTrigger]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (isMultiple) {
        setMultiValue([] as T[]);
      } else {
        setSingleValue("" as T);
      }
    },
    [isMultiple, setMultiValue, setSingleValue]
  );

  const handleListKeyDown = useSelectKeyboard({
    open,
    searchable,
    searchValue,
    highlightedIndex,
    displayOptions: filteredOptions,
    setOpen,
    setHighlightedIndex,
    setSearchValue,
    handleSelect,
    focusTrigger,
  });

  const handleTriggerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled || collapsed) return;
      if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        setOpen(true);
        return;
      }
      if (searchable && !open && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        setOpen(true);
        return;
      }
      // Focus normally moves into the listbox as it opens, but it can still be
      // on the trigger — the frame the dropdown mounts in, or after the user
      // shift-tabs back to it. Handle navigation here too rather than dropping
      // the keystroke.
      handleListKeyDown(event);
    },
    [disabled, collapsed, open, setOpen, searchable, handleListKeyDown]
  );

  const handleSearchChange = useCallback((val: string) => {
    setSearchValue(val);
    setHighlightedIndex(0);
  }, []);

  // Keep the latest callbacks in a ref. This effect must run when the open state
  // (and derived option state) changes — not whenever a caller passes a fresh
  // inline handler. Listing onFocus/onBlur as dependencies would re-run it on
  // every parent render, resetting the highlighted option and clearing the
  // search box mid-interaction.
  const focusCallbacksRef = useRef({ onFocus, onBlur });
  useEffect(() => {
    focusCallbacksRef.current = { onFocus, onBlur };
  });

  // Focus/blur lifecycle
  useEffect(() => {
    if (open) {
      const firstSelected = filteredOptions.findIndex((opt) => selectedValues.has(opt.value));
      setHighlightedIndex(firstSelected >= 0 ? firstSelected : 0);
      if (!wasOpenRef.current) focusCallbacksRef.current.onFocus?.();
      if (searchable && inputRef.current) inputRef.current.focus();
    } else {
      setHighlightedIndex(-1);
      setSearchValue("");
      if (wasOpenRef.current) focusCallbacksRef.current.onBlur?.();
    }
    wasOpenRef.current = open;
  }, [open, filteredOptions, searchable, selectedValues]);

  // Non-searchable: focus the listbox itself, so arrow keys reach the scoped
  // keydown handler and a screen reader follows aria-activedescendant. The
  // searchable variant keeps focus in its input instead.
  useEffect(() => {
    if (!open || searchable) return;
    listboxNode?.focus();
  }, [open, searchable, listboxNode]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (open && highlightedIndex >= 0) {
      const el = optionRefs.current.get(highlightedIndex);
      if (el && listboxRef.current) {
        const listbox = listboxRef.current;
        const top = el.offsetTop;
        const bottom = top + el.offsetHeight;
        if (top < listbox.scrollTop) listbox.scrollTop = top;
        else if (bottom > listbox.scrollTop + listbox.clientHeight) listbox.scrollTop = bottom - listbox.clientHeight;
      }
    }
  }, [highlightedIndex, open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      const reference = refs.reference.current;
      const floating = refs.floating.current;
      if (reference && floating && !(reference as HTMLElement).contains(target) && !floating.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, setOpen, refs]);

  // The listbox id must be unique per instance: it is referenced by
  // aria-controls, and a hardcoded value meant two Selects on one page
  // produced duplicate ids and cross-wired ARIA.
  const listboxId = useId();
  const activeOptionId = open && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length ? selectOptionId(listboxId, highlightedIndex) : undefined;

  // Strip mode from DOM props
  const { mode: _, value: _v, defaultValue: _dv, onValueChange: _oc, ...htmlProps } = restProps as Record<string, unknown>;

  // `role="listbox"` requires an accessible name of its own, and the trigger
  // can't supply one: its label is the current *value*, and in searchable mode
  // it is an input whose name would resolve to whatever has been typed. Use the
  // caller's `aria-label` when there is one, else the placeholder — the closest
  // thing this component has to a field label.
  const listboxLabel = typeof htmlProps["aria-label"] === "string" ? (htmlProps["aria-label"] as string) : placeholder;

  return (
    <>
      {searchable && open && !collapsed ? (
        <SelectTriggerSearch
          setReference={refs.setReference}
          rootRef={rootRef}
          inputRef={inputRef}
          searchValue={searchValue}
          disabled={disabled}
          displayLabel={displayLabel}
          open={open}
          className={className}
          onSearchChange={handleSearchChange}
          onKeyDown={handleListKeyDown}
          listboxId={listboxId}
          activeOptionId={activeOptionId}
          props={htmlProps as React.InputHTMLAttributes<HTMLInputElement>}
        />
      ) : (
        <SelectTriggerButton
          setReference={refs.setReference}
          rootRef={rootRef}
          open={open}
          disabled={disabled}
          collapsed={collapsed}
          displayLabel={displayLabel}
          showClearButton={Boolean(showClearButton)}
          className={className}
          onToggle={() => !disabled && !collapsed && setOpen(!open)}
          onKeyDown={handleTriggerKeyDown}
          onClear={handleClear}
          listboxId={listboxId}
          props={htmlProps as HTMLAttributes<HTMLElement>}
        />
      )}

      {open && !collapsed && (
        <SelectDropdown
          setFloating={refs.setFloating}
          listboxId={listboxId}
          setListbox={setListbox}
          label={listboxLabel}
          activeOptionId={activeOptionId}
          floatingStyles={floatingStyles}
          displayOptions={filteredOptions}
          highlightedIndex={highlightedIndex}
          selectedValues={selectedValues}
          searchValue={searchValue}
          optionRefs={optionRefs}
          multiple={isMultiple}
          onSelect={handleSelect}
          onHighlight={setHighlightedIndex}
          onKeyDown={handleListKeyDown}
        />
      )}
    </>
  );
});

SelectRoot.displayName = "Select";

/**
 * NOTE: Storybook shows the copy in Select.stories.tsx
 * (`parameters.docs.description.component`), not this comment. react-docgen
 * cannot extract a description from this declaration shape, so keeping a
 * second copy here would only drift. Edit the stories file.
 */
export const Select = SelectRoot as <T extends string = string>(props: SelectProps<T> & { ref?: Ref<HTMLDivElement> }) => ReactElement;
