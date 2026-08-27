import { TagChip } from "@sixthshift/design-system/tag-chip";
import { cn } from "@sixthshift/design-system/utils";
import { forwardRef, type KeyboardEvent, useState } from "react";

export type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  id?: string;
  className?: string;
};

/**
 * Token input for tags: existing tags render as removable `TagChip`s, typing
 * plus Enter or comma commits a new one, Backspace on an empty field removes
 * the last. Duplicates are ignored. Controlled only — there is no
 * `defaultValue`, the parent always owns `value`.
 *
 * The chrome matches `Input` (same border/focus tokens) so it sits naturally
 * among other form fields; the field has no visible label of its own, so
 * give it an accessible name via a `<label htmlFor={id}>` (pass `id`) or
 * `aria-label`.
 */
export const TagInput = forwardRef<HTMLDivElement, TagInputProps>(({ value, onChange, placeholder = "Add a tag…", id, className }, ref) => {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const tag = draft.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-border-normal bg-bg-normal px-2 py-1.5 text-sm shadow-xs transition-colors focus-within:ring-2 focus-within:ring-focus-ring",
        className
      )}
    >
      {value.map((tag) => (
        <TagChip key={tag} tag={tag} onRemove={() => onChange(value.filter((t) => t !== tag))} />
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={value.length > 0 ? "" : placeholder}
        className="min-w-[8ch] flex-1 bg-transparent outline-none placeholder:text-fg-subtle"
      />
    </div>
  );
});
TagInput.displayName = "TagInput";
