"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Upload } from "lucide-react";
import * as React from "react";

/**
 * Geometry only. Every colour reads a `--file-dropzone-*` component token
 * whose value is decided by src/components/FileDropzone/file-dropzone.recipe.css.
 *
 * `size` is the target's footprint: `sm` sits inline in a form row beside other
 * fields, `md` is a panel of its own (an image manager's "add photos" tile).
 */
const fileDropzoneVariants = cva(
  // One literal, deliberately — see Button.tsx for why a `+` concatenation is a trap.
  "file-dropzone border-(color:--file-dropzone-border) focus-visible:ring-(color:--file-dropzone-ring) relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-(--file-dropzone-bg) text-center text-(--file-dropzone-fg) transition-colors hover:bg-(--file-dropzone-bg-hovered) focus-visible:outline-hidden focus-visible:ring-2 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50",
  {
    variants: {
      size: {
        sm: "min-h-20 gap-1 px-4 py-3 text-xs [&_svg]:size-4",
        md: "min-h-36 gap-2 px-6 py-6 text-sm [&_svg]:size-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export type FileDropzoneSize = NonNullable<VariantProps<typeof fileDropzoneVariants>["size"]>;

export type FileDropzoneRejection = {
  file: File;
  /** `type` — not in `accept`; `size` — over `maxSize`. */
  reason: "type" | "size";
};

export type FileDropzoneProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onDrop" | "children"> &
  VariantProps<typeof fileDropzoneVariants> & {
    /** Called with the accepted files from a drop or the file picker. Never called with an empty list. */
    onFilesChange: (files: File[]) => void;
    /** Called with files that failed `accept` or `maxSize`, when any did. */
    onFilesRejected?: (rejections: FileDropzoneRejection[]) => void;
    /** Same syntax as the native `accept` attribute: `"image/*"`, `".pdf,.docx"`. Also checked on drop. */
    accept?: string;
    /** Allow more than one file per drop or pick. */
    multiple?: boolean;
    /** Largest accepted file, in bytes. */
    maxSize?: number;
    disabled?: boolean;
    /** Shows a busy state (e.g. while uploading) and blocks new files without disabling the control. */
    pending?: boolean;
    /** The main line. Default: "Drop files here or click to browse". */
    label?: React.ReactNode;
    /** A secondary line, e.g. accepted types and size limit. */
    hint?: React.ReactNode;
    /** Replaces the default upload icon. Pass `null` for none. */
    icon?: React.ReactNode;
    /** Input name, for native form submission of the picked files. */
    name?: string;
  };

function matchesAccept(file: File, accept: string | undefined): boolean {
  if (!accept) return true;
  const rules = accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (rules.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith(".")) return name.endsWith(rule);
    if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

/**
 * A drop target for files that doubles as a file-picker button — product
 * photos, attachments, imports.
 *
 * The whole surface is one control: `role="button"`, a tab stop, and `Enter`
 * or `Space` opens the native picker, the same as a click. Dragging files over
 * it sets `data-state="active"`, which the recipe styles. The hidden `<input
 * type="file">` is the real picker, so `accept`, `multiple` and `name` behave
 * natively; `accept` and `maxSize` are also enforced on drop, where the
 * browser does not, and failures go to `onFilesRejected` rather than being
 * silently dropped. Without `multiple`, a drop of several files keeps the first.
 *
 * `pending` shows a spinner-free busy state (`aria-busy`) and ignores new
 * files while an upload runs, without leaving the tab order — the same split
 * Switch makes between `pending` and `disabled`.
 *
 * The component holds no file list of its own: it reports files and the
 * caller decides what to show, so there is no value/defaultValue triad.
 */
export const FileDropzone = React.forwardRef<HTMLDivElement, FileDropzoneProps>(
  (
    {
      className,
      size = "md",
      onFilesChange,
      onFilesRejected,
      accept,
      multiple = false,
      maxSize,
      disabled = false,
      pending = false,
      label = "Drop files here or click to browse",
      hint,
      icon,
      name,
      onKeyDown,
      onClick,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [active, setActive] = React.useState(false);
    // dragenter/dragleave fire for every child crossed; count them so the state does not flicker.
    const depth = React.useRef(0);
    const labelId = React.useId();
    const hintId = React.useId();

    const interactive = !disabled && !pending;

    const handleFiles = (list: FileList | null) => {
      if (!list || !interactive) return;
      const files = Array.from(list);
      const accepted: File[] = [];
      const rejected: FileDropzoneRejection[] = [];
      for (const file of files) {
        if (!matchesAccept(file, accept)) rejected.push({ file, reason: "type" });
        else if (maxSize !== undefined && file.size > maxSize) rejected.push({ file, reason: "size" });
        else accepted.push(file);
      }
      const kept = multiple ? accepted : accepted.slice(0, 1);
      if (rejected.length > 0) onFilesRejected?.(rejected);
      if (kept.length > 0) onFilesChange(kept);
    };

    const openPicker = () => {
      if (interactive) inputRef.current?.click();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || event.target !== event.currentTarget) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPicker();
      }
    };

    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!interactive) return;
      depth.current += 1;
      setActive(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setActive(false);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = interactive ? "copy" : "none";
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      depth.current = 0;
      setActive(false);
      handleFiles(event.dataTransfer.files);
    };

    return (
      // biome-ignore lint/a11y/useSemanticElements: the target holds the native file <input>, and interactive content is not allowed inside a <button>; role="button" with Enter/Space handling is the WAI-ARIA button pattern
      <div
        ref={ref}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-busy={pending || undefined}
        aria-labelledby={labelId}
        aria-describedby={hint ? hintId : undefined}
        data-state={active ? "active" : "idle"}
        data-disabled={disabled}
        className={fileDropzoneVariants({ size, className })}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) openPicker();
        }}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        {...props}
      >
        {icon === undefined ? <Upload aria-hidden="true" className="text-(--file-dropzone-icon-fg)" /> : icon}
        <span id={labelId} className="font-medium">
          {label}
        </span>
        {hint && (
          <span id={hintId} className="text-(--file-dropzone-hint-fg)">
            {hint}
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          // `hidden`, not `sr-only`: a rendered input inside role="button" is a nested
          // interactive control (axe `nested-interactive`). `click()` and form submission
          // still work on a display:none file input.
          hidden
          accept={accept}
          multiple={multiple}
          name={name}
          disabled={disabled}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => {
            handleFiles(event.target.files);
            // Reset so picking the same file again still fires change.
            event.target.value = "";
          }}
        />
      </div>
    );
  }
);
FileDropzone.displayName = "FileDropzone";

export { fileDropzoneVariants };
