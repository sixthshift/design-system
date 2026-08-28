/**
 * A consumer, from the outside.
 *
 * Imported by name rather than by path — `@sixthshift/design-system/button`,
 * not `../../src/components/Button` — so TypeScript has to go through the
 * `exports` map in package.json and land on the built `.d.ts`, exactly as a
 * consumer's compiler would. Nothing here has an alias helping it.
 *
 * Five subpaths, not eighty. Each one is a different *shape* of export target,
 * which is what the resolution modes actually differ on:
 *
 * | subpath      | target                                  |
 * | ------------ | --------------------------------------- |
 * | `/button`    | a component directory's `index.d.ts`    |
 * | `/utils`     | a single file, not a directory          |
 * | `/heading`   | a bare `.d.ts` under `typography/`      |
 * | `/date-time` | a nested module with its own index      |
 * | `/hooks`     | a barrel that only re-exports           |
 *
 * Adding the other seventy-five would not test another resolution behaviour;
 * scripts/check-exports.ts is what covers the map exhaustively.
 */

import { Button, type ButtonProps } from "@sixthshift/design-system/button";
import { formatDateMedium, parseDate } from "@sixthshift/design-system/date-time";
import { Heading } from "@sixthshift/design-system/heading";
import { useControllableState } from "@sixthshift/design-system/hooks";
import { cn } from "@sixthshift/design-system/utils";

// Values, types and a hook all have to come through, not just the module — an
// `exports` entry can resolve while its `types` condition is missing, and only
// using the types catches that.
export function Panel({ variant, isoDate }: { variant: ButtonProps["variant"]; isoDate: string }) {
  const [open, setOpen] = useControllableState({ defaultValue: false });

  return (
    <section className={cn("panel", open && "panel-open")}>
      <Heading as="h2">{formatDateMedium(parseDate(isoDate))}</Heading>
      <Button variant={variant} onClick={() => setOpen(!open)}>
        Toggle
      </Button>
    </section>
  );
}
