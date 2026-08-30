/**
 * Vite's `?raw` suffix, typed locally rather than by pulling in `vite/client`.
 *
 * The wider client types would also declare `import.meta.env` and the whole
 * asset-import surface across the package, which is a bigger claim than this
 * one story-only import needs. Story-only: `src/stories` is excluded from the
 * published package, and nothing in `dist/` resolves this.
 */
declare module "*.css?raw" {
  const content: string;
  export default content;
}
