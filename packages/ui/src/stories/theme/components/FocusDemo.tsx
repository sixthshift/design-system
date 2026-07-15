import { Text } from "@sixthshift/ui/text";

export function FocusDemo() {
  return (
    <div className="flex flex-col gap-2">
      <Text className="font-medium text-fg-subtle text-xs">Focus Ring</Text>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-md px-3 py-1.5 font-medium text-sm"
          style={{
            backgroundColor: "var(--bg-brand)",
            color: "var(--fg-on-brand)",
            outline: "2px solid var(--focus-ring)",
            outlineOffset: "2px",
          }}
        >
          Focused
        </button>
        <button
          type="button"
          className="rounded-md px-3 py-1.5 font-medium text-sm"
          style={{
            backgroundColor: "var(--bg-normal)",
            color: "var(--fg-normal)",
            border: "1px solid var(--border-normal)",
            outline: "2px solid var(--focus-ring)",
            outlineOffset: "2px",
          }}
        >
          Focused
        </button>
      </div>
    </div>
  );
}
