import { Text } from "@sixthshift/design-system/text";
import theme from "../../../theme/theme.json";

const interactiveStates = ["hovered", "pressed", "disabled"] as const;

type ThemeMode = typeof theme.light;

export function InteractiveTokenRow({ baseToken, type, mode }: { baseToken: string; type: "bg" | "fg" | "border"; mode: "light" | "dark" }) {
  // Check if this is a fg-on-* token
  const isOnToken = type === "fg" && baseToken.startsWith("fg-on-");
  // Extract the variant (e.g., "strong" from "fg-on-strong")
  const variant = isOnToken ? baseToken.replace("fg-on-", "") : null;

  const getStyle = (token: string) => {
    if (type === "bg") {
      return { backgroundColor: `var(--${token})` };
    } else if (type === "fg") {
      if (isOnToken && variant) {
        // For fg-on-* tokens, use the corresponding bg-* as background
        // and derive the bg state from the fg token state
        const state = token.replace(baseToken, "").replace("-", "");
        const bgToken = state ? `bg-${variant}-${state}` : `bg-${variant}`;
        return {
          backgroundColor: `var(--${bgToken})`,
          color: `var(--${token})`,
        };
      }
      return { backgroundColor: `var(--${token})` };
    } else {
      return {
        borderColor: `var(--${token})`,
        borderWidth: 2,
        borderStyle: "solid" as const,
      };
    }
  };

  const getValue = (token: string): string => {
    const themeMode = theme[mode] as ThemeMode;
    const value = themeMode[token as keyof ThemeMode];
    if (!value) return "";
    // Extract just the color reference, e.g., "var(--color-emerald-100)" -> "emerald-100"
    const match = value.match(/var\(--color-([^)]+)\)/);
    return match?.[1] ?? value;
  };

  return (
    <div className="w-[24rem] rounded p-3" style={{ border: "1px solid var(--border-normal)" }}>
      <Text className="mb-2 font-medium font-mono text-sm">{baseToken}</Text>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-10 w-10 items-center justify-center rounded font-bold text-xs" style={getStyle(baseToken)}>
            {isOnToken && "Aa"}
          </div>
          <Text className="text-fg-subtle text-xs">base</Text>
          <Text className="font-mono text-fg-subtle text-xs">{getValue(baseToken)}</Text>
        </div>
        {interactiveStates.map((state) => {
          const token = `${baseToken}-${state}`;
          return (
            <div key={state} className="flex flex-col items-center gap-1">
              <div className="flex h-10 w-10 items-center justify-center rounded font-bold text-xs" style={getStyle(token)}>
                {isOnToken && "Aa"}
              </div>
              <Text className="text-fg-subtle text-xs">{state}</Text>
              <Text className="font-mono text-fg-subtle text-xs">{getValue(token)}</Text>
            </div>
          );
        })}
      </div>
    </div>
  );
}
