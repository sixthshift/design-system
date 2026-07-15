import { Heading } from "@sixthshift/ui/heading";
import { InteractiveTokenRow } from "./InteractiveTokenRow";

export function TokenGroup({ title, tokens, type, mode }: { title: string; tokens: string[]; type: "bg" | "fg" | "border"; mode: "light" | "dark" }) {
  return (
    <div className="overflow-x-auto">
      <Heading as="h3" className="mb-3">
        {title}
      </Heading>
      <div className="flex flex-wrap gap-3">
        {tokens.map((token) => (
          <InteractiveTokenRow key={token} baseToken={token} type={type} mode={mode} />
        ))}
      </div>
    </div>
  );
}
