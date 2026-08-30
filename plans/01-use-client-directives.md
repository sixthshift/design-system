# 01 — `"use client"` directives and an SSR smoke test

**Effort:** M · **Risk:** low · **Blocks:** adoption by any Next.js App Router consumer

## Problem

There is not a single `"use client"` directive in the package:

```bash
grep -rl "use client" src --include=*.tsx | wc -l   # 0
```

Every component in `src/components/` uses React hooks. In a Next.js App Router
project (the dominant React deployment target), modules are Server Components by
default. The first `import { Button } from "@sixthshift/design-system/button"`
inside a server component throws at build time:

> You're importing a component that needs `useState`. This React hook only works
> in a client component.

There is no way for the consumer to fix this from their side except to wrap every
import in a local `"use client"` shim file. That is the kind of friction that
makes a design system get dropped rather than debugged.

Nothing currently renders the library through `react-dom/server`, so this would
not have been caught by any existing suite. The `unit` project runs happy-dom,
the `visual`/`storybook` projects run a real browser — all of them are client
environments.

## Scope

**In:**
- Add `"use client"` to every module that uses a client-only feature.
- Verify the directive survives the `tsc` build into `dist/`.
- Add an `ssr` vitest project that renders every component through
  `renderToString` in a Node environment.
- A lint-style guard so new components can't regress.

**Out:**
- Splitting components into server/client halves. Nothing here benefits from
  being a Server Component; the goal is only that importing the package from a
  server file does not explode.
- RSC-specific APIs (`useFormStatus` etc.).

## Approach

### 1. Decide the boundary granularity

Put the directive on the **implementation module** (`Button.tsx`), not the
subpath entry (`index.ts`). A server component importing `index.ts` still works —
the client boundary is established at the module that actually needs it, and
genuinely static modules stay server-renderable.

Modules that need it, by rule:
- anything calling a React hook (`useState`, `useEffect`, `useRef`, `useId`,
  `useSyncExternalStore`, …)
- anything attaching an event handler prop (`onClick`, `onChange`, …)
- anything touching `window` / `document` / `localStorage` at module or render
  scope — 25 such call sites today across `src/components`, `src/hooks`,
  `src/lib`
- every file in `src/hooks/`
- the context providers in `src/lib/contexts/`
- `ErrorBoundary.tsx` / `EmptyBoundary.tsx` and the `with*` HOCs (class
  components and hooks respectively)

Modules that should **not** get it: pure presentational typography
(`src/typography/Body.tsx`, `Caption.tsx`, `Display.tsx`, `Lead.tsx`,
`Muted.tsx`, `Mono.tsx`, `Subtitle.tsx`, …) if they render no handlers and call
no hooks — check each rather than assuming. `src/theme/schema.ts` and
`src/lib/utils.ts` are pure and must stay server-safe.

### 2. Confirm the directive survives the build

`bun run build` compiles with `tsc -p tsconfig.build.json` then rewrites
specifiers in `scripts/fix-extensions.ts`. TypeScript preserves the directive
prologue, but `fix-extensions.ts` rewrites file contents — confirm it does not
strip or displace the first line. A directive that ends up below an import is
inert and silently does nothing.

Check after building:

```bash
head -1 dist/components/Button/Button.js   # expect: "use client";
```

### 3. Add the SSR project

New project in `vitest.config.ts`, modelled on the existing `date-time` project
(Node environment, no DOM):

```ts
{
  extends: true,
  test: {
    name: "ssr",
    include: ["src/**/*.ssr.test.tsx"],
    environment: "node",
  },
}
```

One test file that walks the composed stories and asserts
`renderToString(<Story />)` neither throws nor references `document`. Stories are
already the fixtures for the visual suite (`src/testing/visual.tsx`), so reuse
`composeStories` the same way. Components that legitimately cannot render on the
server (Monaco-backed `Code`, anything mounting into a portal on first render)
get an explicit skip list with a one-line reason each — an empty skip list that
silently shrinks is worse than a documented one.

Wire it into `package.json`'s `test` script so it runs in the main CI job:

```
"test": "vitest run --project unit --project date-time --project ssr --reporter=dot"
```

### 4. Guard against regression

A `scripts/check-use-client.ts` in the shape of the existing
`scripts/check-exports.ts` and `scripts/check-contrast.ts`: parse each module,
flag any file that uses a hook or handler prop but lacks the directive, and any
file that has the directive without needing it. Run it from `build` alongside
`check-exports`.

## Acceptance criteria

- [ ] Every hook-using / handler-attaching / browser-API module carries `"use client"` as its first statement
- [ ] Pure modules (`utils.ts`, `schema.ts`, static typography) deliberately do **not** carry it, and that decision is recorded in `docs/component-authoring.md`
- [ ] `head -1` of the corresponding `dist/**/*.js` shows the directive after a clean build
- [ ] `ssr` vitest project exists, is in the `test` script, and passes
- [ ] `scripts/check-use-client.ts` runs in `build` and fails on a missing directive
- [ ] README gains a short "Server Components / Next.js App Router" note under **Consuming from a project**

## Notes

- Conventional commit: `fix:` at minimum — it changes shipped bytes. Arguably
  `feat:` since it unlocks a consumer environment that did not work before.
- Worth doing before any 1.0 discussion; adding directives later is not breaking,
  but shipping a package that cannot be imported by App Router users is a poor
  1.0.
