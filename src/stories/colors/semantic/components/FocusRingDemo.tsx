import { Heading } from "@sixthshift/design-system/heading";
import { Text } from "@sixthshift/design-system/text";
import { readTokens } from "../../../theme/read-tokens";

export function FocusRingDemo({ mode }: { mode: "light" | "dark" }) {
  const value = readTokens(mode)["focus-ring"];

  return (
    <div>
      <Heading as="h3" className="mb-3">
        Focus Ring
      </Heading>
      <div className="flex items-center gap-4 rounded p-3" style={{ border: "1px solid var(--border-normal)" }}>
        <div
          className="flex h-10 w-10 items-center justify-center rounded"
          style={{
            backgroundColor: "var(--bg-normal)",
            outline: "2px solid var(--focus-ring)",
            outlineOffset: "2px",
          }}
        />
        <div className="flex min-w-0 flex-1 justify-between gap-4">
          <Text className="truncate font-mono text-sm">focus-ring</Text>
          <Text className="truncate text-fg-subtle text-xs">{value}</Text>
        </div>
      </div>
    </div>
  );
}
