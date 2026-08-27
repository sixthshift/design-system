import { Badge } from "@sixthshift/design-system/badge";
import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";
import { TagChip } from "@sixthshift/design-system/tag-chip";
import { Text } from "@sixthshift/design-system/text";

/**
 * The live strip under the title: real components, not screenshots.
 *
 * It exists to make two things true on first sight — the library renders, and
 * the toolbar's theme control is real. Everything here reads the same tokens
 * every other page documents, so flipping light/dark repaints it.
 *
 * Deliberately four components and no captions. This is proof, not a catalog;
 * the sidebar is the catalog.
 */
export function ProofStrip() {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border-subtle bg-bg-subtle p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="solid">Save</Button>
        <Button variant="outline">Cancel</Button>
        <Button variant="ghost" intent="danger">
          Delete
        </Button>
        <Badge intent="success">Shipped</Badge>
        <Badge variant="soft" intent="warning">
          Draft
        </Badge>
        <TagChip tag="project:website" />
      </div>
      <Input placeholder="Search components…" className="max-w-xs" />
      <Text as="p" className="text-fg-subtle text-sm">
        Live components, not screenshots. Flip the theme control in the toolbar — every colour above resolves through the token pipeline, so both modes are the
        same code.
      </Text>
    </div>
  );
}
