export function ColorSwatch({ hex, label }: { hex: string; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="h-16 w-16 rounded-lg border border-black/10 shadow-xs" style={{ backgroundColor: hex }} />
      {label && <span className="text-fg-subtle text-xs">{label}</span>}
      <span className="font-mono text-fg-subtle text-xs">{hex}</span>
    </div>
  );
}
