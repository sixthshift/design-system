import { Text } from "@sixthshift/ui/text";

export function InteractiveButton({
  variant,
  label,
}: {
  variant:
    | "strong"
    | "brand-subtle"
    | "brand"
    | "brand-strong"
    | "normal"
    | "success-subtle"
    | "success"
    | "success-strong"
    | "warning-subtle"
    | "warning"
    | "warning-strong"
    | "danger-subtle"
    | "danger"
    | "danger-strong";
  label: string;
}) {
  const bgToken = variant === "normal" ? "bg-normal" : `bg-${variant}`;
  const fgToken = variant === "normal" ? "fg-normal" : `fg-on-${variant}`;
  const borderToken = variant === "normal" ? "border-normal" : undefined;

  return (
    <div className="flex flex-col gap-2">
      <Text className="font-medium text-fg-subtle text-xs">{label}</Text>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-md px-3 py-1.5 font-medium text-sm transition-none"
          style={{
            backgroundColor: `var(--${bgToken})`,
            color: `var(--${fgToken})`,
            border: borderToken ? `1px solid var(--${borderToken})` : "none",
          }}
        >
          Base
        </button>
        <button
          type="button"
          className="rounded-md px-3 py-1.5 font-medium text-sm transition-none"
          style={{
            backgroundColor: `var(--${bgToken}-hovered)`,
            color: `var(--${fgToken}-hovered)`,
            border: borderToken ? `1px solid var(--${borderToken}-hovered)` : "none",
          }}
        >
          Hover
        </button>
        <button
          type="button"
          className="rounded-md px-3 py-1.5 font-medium text-sm transition-none"
          style={{
            backgroundColor: `var(--${bgToken}-pressed)`,
            color: `var(--${fgToken}-pressed)`,
            border: borderToken ? `1px solid var(--${borderToken}-pressed)` : "none",
          }}
        >
          Press
        </button>
        <button
          type="button"
          className="rounded-md px-3 py-1.5 font-medium text-sm transition-none"
          style={{
            backgroundColor: `var(--${bgToken}-disabled)`,
            color: `var(--${fgToken}-disabled)`,
            border: borderToken ? `1px solid var(--${borderToken}-disabled)` : "none",
            cursor: "not-allowed",
          }}
        >
          Disabled
        </button>
      </div>
    </div>
  );
}
