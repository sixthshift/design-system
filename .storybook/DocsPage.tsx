import { Controls, Description, Primary, Source, Stories, Subtitle, Title, useOf } from "@storybook/addon-docs/blocks";

/**
 * The docs layout every component inherits.
 *
 * Defined once here rather than as an MDX file per component: the pages were
 * never thin because they were generated, they were thin because almost nothing
 * had prose to generate from. Fifty-three hand-written pages would be
 * fifty-three files to keep in sync with the props they describe — the failure
 * mode docs/component-catalog.md already demonstrates, where the hand-maintained
 * prop tables now disagree with the components.
 *
 * So: structure lives here, and the words live next to the code they describe —
 * a JSDoc above the component (which react-docgen feeds to `<Description />`,
 * and which also reaches IDE hover and the shipped `.d.ts`) plus a one-line
 * `subtitle` on the meta.
 *
 * A component that genuinely needs more than that can still ship an MDX page:
 * an attached `<Meta of={…} />` replaces this layout for that component alone.
 */

/** `TagChip` -> `tag-chip`, matching the package's subpath export names. */
const kebab = (name: string) => name.replace(/(?<!^)(?=[A-Z])/g, "-").toLowerCase();

/**
 * The import line, derived rather than written.
 *
 * There is no root barrel — every component is its own subpath — so "how do I
 * import this?" is the first question any page has to answer, and the one most
 * likely to be got wrong or to go stale if typed by hand. Kebab-casing the
 * component name matches 50 of the 52 exports; `DateTimePicker` and
 * `DateTimeRangePicker` publish as `datetime-*`, so they set `importPath`.
 */
function ImportLine() {
  // Called unconditionally, and deliberately not wrapped in try/catch: a hook
  // inside a `try` is a conditional call, because a throw skips every hook after
  // it. This page is only ever reached through `parameters.docs.page`, which
  // applies to attached docs, so the meta is always resolvable — and if that
  // ever stops being true, failing loudly beats rendering a page with no import.
  const { preparedMeta } = useOf("meta", ["meta"]);
  const title = String(preparedMeta.title ?? "");
  const importPath = preparedMeta.parameters?.importPath as string | undefined;

  const name = title.split("/").pop();
  if (!name) return null;

  return <Source code={`import { ${name} } from "@sixthshift/design-system/${importPath ?? kebab(name)}";`} language="tsx" />;
}

export function DocsPage() {
  return (
    <>
      <Title />
      <Subtitle />
      <ImportLine />
      <Description />
      <Primary />
      <Controls />
      <Stories includePrimary={false} />
    </>
  );
}
