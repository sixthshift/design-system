/**
 * Assert every module that needs `"use client"` carries it — and that no module
 * carries it without needing it.
 *
 * In a Next.js App Router project every module is a Server Component until a
 * `"use client"` prologue says otherwise, and the react-server build of React
 * simply does not export `useState`, `useRef`, `useContext`, `useReducer`,
 * `useSyncExternalStore` or `createContext`. So the first
 * `import { Button } from "@sixthshift/design-system/button"` from a server file
 * used to throw at build time, with nothing the consumer could do about it
 * except wrap every import in a local shim.
 *
 * The directive goes on the *implementation* module rather than the subpath
 * entry (see docs/component-authoring.md): the boundary lands where the
 * client-only feature actually is, and the barrels plus the genuinely static
 * modules stay server-renderable.
 *
 * Both halves of the check matter. A missing directive breaks the consumer's
 * build; a spurious one silently drags a pure module — and everything it
 * imports — into the client bundle.
 */

/// <reference types="bun" />
// Same reasoning as scripts/fix-extensions.ts: `import.meta.dir` is Bun's, and
// the reference is scoped here rather than in tsconfig's deliberately empty
// `types` so the library's own compilation never sees these globals.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import ts from "typescript";

const ROOT = resolve(import.meta.dir, "..");
const SRC = join(ROOT, "src");

/**
 * Not shipped, and all of them run in a client environment already: happy-dom
 * for `unit`, a real browser for `visual` and `storybook`.
 */
const IGNORED = [/\.test\.tsx?$/, /\.stories\.tsx$/, /[/\\]__tests__[/\\]/, /^src[/\\]stories[/\\]/, /^src[/\\]testing[/\\]/];

/**
 * Globals that only exist in a browser. A module reading one at module or render
 * scope is client-only even when it calls no hook.
 */
const BROWSER_GLOBALS = new Set([
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "navigator",
  "matchMedia",
  "requestAnimationFrame",
  "getComputedStyle",
  "ResizeObserver",
  "IntersectionObserver",
  "MutationObserver",
]);

/**
 * Available in the react-server build, so calling one is not on its own a reason
 * for the directive. Kept as an explicit allowlist rather than a rule, because
 * the list is React's to change and a wrong guess here is a broken consumer
 * build.
 */
const SERVER_SAFE_REACT_APIS = new Set([
  "createElement",
  "cloneElement",
  "isValidElement",
  "forwardRef",
  "memo",
  "lazy",
  "createRef",
  "cache",
  "use",
  "Children",
  "Fragment",
  "Suspense",
]);

/**
 * Third-party components that establish a client boundary of their own. Nothing
 * in the AST distinguishes these from a plain element, so they are named.
 */
const CLIENT_ONLY_JSX = new Set(["FloatingPortal"]);

/**
 * Modules that need the directive for a reason no rule below can see. Each one
 * is a judgement call, so each one carries its reason.
 */
const ALWAYS_CLIENT = new Map<string, Reason>([
  [
    "src/lib/withErrorBoundary.tsx",
    "hands `fallback` straight to ErrorBoundary, a client component — a function fallback authored in a server module cannot cross that boundary",
  ],
  [
    "src/lib/withSuspenseAndErrorBoundary.tsx",
    "hands `errorFallback` straight to ErrorBoundary, a client component — a function fallback authored in a server module cannot cross that boundary",
  ],
]);

type Reason = string;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return walk(path);
    return /\.tsx?$/.test(entry) ? [path] : [];
  });
}

/** True when the file's first statement is the `"use client"` prologue. */
function hasDirective(source: ts.SourceFile): boolean {
  const first = source.statements[0];
  if (!first || !ts.isExpressionStatement(first)) return false;
  const { expression } = first;
  return ts.isStringLiteral(expression) && expression.text === "use client";
}

/** True when the directive is present but sits below another statement, where it is inert. */
function hasMisplacedDirective(source: ts.SourceFile): boolean {
  return source.statements.some(
    (statement, index) =>
      index > 0 && ts.isExpressionStatement(statement) && ts.isStringLiteral(statement.expression) && statement.expression.text === "use client"
  );
}

/** The callee's plain name for `foo()` and `React.foo()` alike, else null. */
function calleeName(node: ts.CallExpression): string | null {
  const { expression } = node;
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.name)) return expression.name.text;
  return null;
}

/** The tag's rightmost name for `<Foo>` and `<Foo.Bar>` alike, else null. */
function tagName(node: ts.JsxOpeningElement | ts.JsxSelfClosingElement): string | null {
  const { tagName: tag } = node;
  if (ts.isIdentifier(tag)) return tag.text;
  if (ts.isPropertyAccessExpression(tag) && ts.isIdentifier(tag.name)) return tag.name.text;
  return null;
}

/**
 * Every client-only feature the module uses, one line each. Empty means the
 * module is server-renderable.
 *
 * Reading the AST rather than the text matters more than it looks: `document`
 * appears in a prose comment in src/theming/vocabulary.ts and src/components/Popover,
 * and a grep-based version of this check flagged both.
 */
function clientReasons(source: ts.SourceFile): Reason[] {
  const reasons = new Map<string, Reason>();
  const at = (node: ts.Node) => source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
  const add = (key: string, reason: Reason) => {
    if (!reasons.has(key)) reasons.set(key, reason);
  };

  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const name = calleeName(node);
      if (name === "createContext") {
        add("createContext", `createContext() at line ${at(node)}`);
      } else if (name && /^use[A-Z]/.test(name) && !SERVER_SAFE_REACT_APIS.has(name)) {
        add(`hook:${name}`, `${name}() at line ${at(node)}`);
      }
    }

    // A handler the module wires up itself. `{...props}` spreads are not
    // handlers — the consumer owns those, and forwarding one is server-safe.
    if (ts.isJsxAttribute(node) && ts.isIdentifier(node.name) && /^on[A-Z]/.test(node.name.text) && node.initializer && ts.isJsxExpression(node.initializer)) {
      add(`handler:${node.name.text}`, `${node.name.text}={...} at line ${at(node)}`);
    }

    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = tagName(node);
      if (tag && CLIENT_ONLY_JSX.has(tag)) add(`jsx:${tag}`, `<${tag}> at line ${at(node)}`);
    }

    if (ts.isClassDeclaration(node)) {
      for (const clause of node.heritageClauses ?? []) {
        if (clause.token !== ts.SyntaxKind.ExtendsKeyword) continue;
        for (const type of clause.types) {
          const base = ts.isPropertyAccessExpression(type.expression)
            ? type.expression.name.text
            : ts.isIdentifier(type.expression)
              ? type.expression.text
              : "";
          if (base === "Component" || base === "PureComponent") add("class", `class component at line ${at(node)}`);
        }
      }
    }

    // Identifier references only: `foo.window` and `{ window: x }` are not the
    // global, and neither is a type position.
    if (ts.isIdentifier(node) && BROWSER_GLOBALS.has(node.text)) {
      const { parent } = node;
      const isMemberName = ts.isPropertyAccessExpression(parent) && parent.name === node;
      const isPropertyName = (ts.isPropertyAssignment(parent) || ts.isPropertySignature(parent)) && parent.name === node;
      const isDeclarationName = (ts.isVariableDeclaration(parent) || ts.isParameter(parent) || ts.isBindingElement(parent)) && parent.name === node;
      if (!isMemberName && !isPropertyName && !isDeclarationName) add(`global:${node.text}`, `${node.text} at line ${at(node)}`);
    }

    ts.forEachChild(node, visit);
  };

  ts.forEachChild(source, visit);
  return [...reasons.values()];
}

const missing: { file: string; reasons: Reason[] }[] = [];
const spurious: string[] = [];
const misplaced: string[] = [];
let directives = 0;
let checked = 0;

for (const path of walk(SRC).sort()) {
  const file = relative(ROOT, path);
  if (IGNORED.some((pattern) => pattern.test(file))) continue;
  checked++;

  const source = ts.createSourceFile(
    path,
    readFileSync(path, "utf8"),
    ts.ScriptTarget.ESNext,
    true,
    path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  const directive = hasDirective(source);
  const reasons = clientReasons(source);
  const always = ALWAYS_CLIENT.get(file.replaceAll("\\", "/"));
  if (always) reasons.unshift(always);

  if (directive) directives++;
  if (hasMisplacedDirective(source)) misplaced.push(file);
  if (reasons.length > 0 && !directive) missing.push({ file, reasons });
  if (reasons.length === 0 && directive) spurious.push(file);
}

if (missing.length > 0) {
  console.error(`check-use-client: ${missing.length} module(s) need the "use client" prologue:`);
  for (const { file, reasons } of missing) console.error(`  ${file}\n    ${reasons.join("\n    ")}`);
}

if (spurious.length > 0) {
  console.error(`check-use-client: ${spurious.length} module(s) carry "use client" without needing it:`);
  for (const file of spurious) console.error(`  ${file}`);
}

if (misplaced.length > 0) {
  console.error(`check-use-client: ${misplaced.length} module(s) have "use client" below another statement, where it is inert:`);
  for (const file of misplaced) console.error(`  ${file}`);
}

if (missing.length + spurious.length + misplaced.length > 0) process.exit(1);

console.log(`check-use-client: ${directives}/${checked} module(s) carry the directive, and every boundary is where it belongs`);
