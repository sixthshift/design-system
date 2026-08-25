import { autoUpdate, flip, offset, shift, size, useFloating } from "@floating-ui/react";
import { useControllableState } from "@sixthshift/design-system/hooks";
import { type HTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SelectDropdown } from "./SelectDropdown";
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

export const Select = <T extends string = string>(props: SelectProps<T>) => {
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

  const handleTriggerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled || collapsed) return;
      if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        setOpen(true);
      }
      if (searchable && !open && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        setOpen(true);
      }
    },
    [disabled, collapsed, open, setOpen, searchable]
  );

  const handleSearchChange = useCallback((val: string) => {
    setSearchValue(val);
    setHighlightedIndex(0);
  }, []);

  // Focus/blur lifecycle
  useEffect(() => {
    if (open) {
      const firstSelected = filteredOptions.findIndex((opt) => selectedValues.has(opt.value));
      setHighlightedIndex(firstSelected >= 0 ? firstSelected : 0);
      if (!wasOpenRef.current) onFocus?.();
      if (searchable && inputRef.current) inputRef.current.focus();
    } else {
      setHighlightedIndex(-1);
      setSearchValue("");
      if (wasOpenRef.current) onBlur?.();
    }
    wasOpenRef.current = open;
  }, [open, filteredOptions, searchable, selectedValues]);

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

  useSelectKeyboard({
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

  // Strip mode from DOM props
  const { mode: _, value: _v, defaultValue: _dv, onValueChange: _oc, ...htmlProps } = restProps as Record<string, unknown>;

  return (
    <>
      {searchable && open && !collapsed ? (
        <SelectTriggerSearch
          setReference={refs.setReference}
          inputRef={inputRef}
          searchValue={searchValue}
          disabled={disabled}
          displayLabel={displayLabel}
          open={open}
          className={className}
          onSearchChange={handleSearchChange}
          props={htmlProps as React.InputHTMLAttributes<HTMLInputElement>}
        />
      ) : (
        <SelectTriggerButton
          setReference={refs.setReference}
          open={open}
          disabled={disabled}
          collapsed={collapsed}
          displayLabel={displayLabel}
          showClearButton={Boolean(showClearButton)}
          className={className}
          onToggle={() => !disabled && !collapsed && setOpen(!open)}
          onKeyDown={handleTriggerKeyDown}
          onClear={handleClear}
          props={htmlProps as HTMLAttributes<HTMLElement>}
        />
      )}

      {open && !collapsed && (
        <SelectDropdown
          setFloating={refs.setFloating}
          listboxRef={listboxRef}
          floatingStyles={floatingStyles}
          displayOptions={filteredOptions}
          highlightedIndex={highlightedIndex}
          selectedValues={selectedValues}
          searchValue={searchValue}
          optionRefs={optionRefs}
          multiple={isMultiple}
          onSelect={handleSelect}
          onHighlight={setHighlightedIndex}
        />
      )}
    </>
  );
};
