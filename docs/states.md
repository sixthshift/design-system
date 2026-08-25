# Page States

Every data view is in one of a few states at any moment. Loaded is the happy path; the others — empty, loading, error, stale — get improvised on most pages, which makes each one feel slightly different. This doc names the states, when each applies, what it should look like, and where the primitives live.

## The states

| State | When | Looks like |
|---|---|---|
| **Loaded** | Data fetched, non-empty | The normal page content |
| **Empty** | Data fetched but no items | Friendly hint + a primary action to get unstuck |
| **Loading (initial)** | Data has never been fetched | Skeleton matching the eventual layout |
| **Loading (fetching more)** | Already-rendered list is fetching the next page | Inline spinner at the bottom |
| **Error** | Fetch failed | In-card message with retry, or toast for action errors |
| **Stale** | Data is rendered while cache is being refreshed | Muted indicator (rarely needed) |

## Where states live: the boundary tiers

The states above are *what the user sees*. This section is *where in the tree the switch happens*. Three tiers catch loading and error, each at a different scope, so a failure or a pending fetch is handled by the narrowest boundary that contains it.

1. **Shell** — the router `<Outlet>` is wrapped once in `withSuspenseAndErrorBoundary` (`packages/web/src/layouts/AppLayout/MainContentLayout.tsx:7`). This is the backstop: a global `Spinner` while *any* route is still resolving, and a generic "Something went wrong" with a `Try again` (`reset`) button for anything that escapes the tiers below. It catches errors no route claimed.

2. **Route** — each route sets `errorComponent` in its definition (e.g. `packages/web/src/routes/library.routes.ts:30`). Most routes point it at `PageError`; a route with a richer failure story points it at a page-specific component (the `$taskId` route uses `TaskDetailPageError`, `library.routes.ts:45`). This tier catches errors thrown during the route's loader or render — including the `NotFoundError` a loader throws for a missing resource — and renders the failure *inside* the shell chrome rather than replacing the whole app.

3. **Page** — a data-driven page wraps its own component in `withSuspense(...)` (`packages/web/src/modules/library/tasks/pages/TaskDetailPage/TaskDetailPage.tsx:15`). The page's own loading fallback (here a centered `Spinner`) renders *inside* the shell, so the nav stays put while just the content region shows a skeleton or spinner. This is the tier that owns the *initial-load* state from the table above.

The rule of thumb: shell catches the unclaimed, route catches the route's own load/render failure, page owns its own pending fetch. A page never needs an `isLoading` branch in its body — Suspense at tier 3 handles it; the body only runs once data is present (note `TaskDetailPage` reads `useLoaderData()` directly with no loading guard).

### States are wrappers, not props

States are composed *around* a component as HOC wrappers, never threaded through it as `isLoading` / `isEmpty` / `error` props on every component:

- `withSuspense(Component, fallback)` — `lib/withSuspense.tsx`
- `withErrorBoundary(Component, fallback)` — `lib/withErrorBoundary.tsx` (fallback may be a render function receiving `{ error, reset }`)
- `withEmpty(Component, isEmpty, fallback)` — `lib/withEmpty.tsx`
- `withSuspenseAndErrorBoundary(Component, { fallback, errorFallback })` — `lib/withSuspenseAndErrorBoundary.tsx`, the shell's combinator
- `EmptyBoundary` / `ErrorBoundary` — `lib/EmptyBoundary.tsx`, `lib/ErrorBoundary.tsx`, the underlying boundary elements when you need them inline rather than as a wrapper

`EmptyState` / `Skeleton` / `Spinner` are the *presentational leaves* these wrappers render. The primitives themselves stay state-ignorant: a `Button` or `Input` carries only a *localized* `disabled` / `loading` for its own affordance (e.g. a button disabled while its mutation is pending) — never a page-level loading flag.

Why externalize: an `isEmpty`/`isLoading`/`error` triplet on every component metastasizes — each one re-implements the same three branches, and the happy-path render gets deformed by edge handling it shouldn't carry (see *Edges are part of the problem*). Lifting state into a wrapper keeps the component a pure function of *loaded* data; the wrapper owns the off-states. It also lets the same component sit behind different policies (Suspense in one place, an explicit fallback in another) without touching it.

### `PageError` anatomy

`PageError` (`packages/web/src/components/errors/PageError.tsx:12`) is the default route `errorComponent`. It branches on the error kind:

- **Not found** — when `isNotFoundError(error)` (a loader threw `NotFoundError` for a missing resource), it renders an `EmptyState`: "Not found" with a *Go Home* link. A missing resource is an empty, not a crash.
- **Generic** — anything else renders "Something went wrong" with two recovery actions: **Go Back** (`router.history.back()`, leave the broken route) and **Try Again** (`reset`, re-mount and re-run the loader). The raw `error.message` shows in a muted monospace `Caption` — acceptable at the route boundary, but never leaked into normal content (see *Tone* below).

## Empty states

Empty is the most-mishandled state. Three rules:

### 1. Always suggest the next step

An empty page that says "No items yet" wastes the user's attention. Tell them what to *do* — the empty state is a primary navigation moment, not a placeholder.

### 2. Default to "connect a service"

PA's primary onramp is connecting external data sources. For domains that can be populated from integrations (Tasks, People, Notes, Events, Habit Checkins), the empty state should prompt connecting *first*; manual entry is the fallback, not the happy path.

Good:
> No tasks yet. **Connect Todoist** to pull yours in, or create one manually.

Bad:
> Click + to add your first task.

### 3. Tone: encouraging, not chirpy

PA is warm but not playful. Don't use exclamation marks. Don't apologize ("Oops, nothing here!"). State the fact, then offer the path.

## Loading states

### Initial load — skeletons

For the first paint of a data view, render skeletons that match the eventual layout. The user shouldn't see the page jump from "nothing" → "everything." Skeletons preserve layout stability.

Convention: each component that has a meaningful loading state ships a sibling skeleton file. Existing examples in the codebase:

- `packages/web/src/modules/activity/components/ActivityStream/ActivityStream.skeleton.tsx`
- `packages/web/src/modules/assist/components/ThreadList.skeleton.tsx`
- `packages/web/src/modules/automations/pages/AutomationsPage/AutomationsPage.skeleton.tsx`

Use the `Skeleton` primitive for the shimmer blocks. Match the row count to a believable default (5–10 rows for streams).

### Fetching more — inline spinner

When an already-rendered list fetches the next page, show a small inline spinner at the bottom. Don't replace rendered content with a skeleton.

Pattern, from `packages/web/src/components/InfiniteList.tsx`:

```tsx
{isFetchingNextPage && (
  <div className="flex items-center justify-center gap-2 py-4">
    <Spinner size="sm" />
    <Caption>Loading more…</Caption>
  </div>
)}
```

### Don't double-load

If the list is already rendered (cache hit), don't show any loading state during background revalidation. That's the *stale* state — content stays visible.

## Error states

### Page-level errors — in-card

If the data the page exists to show failed to load, the page can't proceed. Show the failure in place of the content, with a retry affordance.

### Action errors — toast

If an action the user took failed (delete, update, etc.), the page itself is fine. Show a toast.

**Rule: in-card for page data; toast for actions.**

### Tone: precise, not apologetic

Tell the user what failed and what they can do.

Good:
> Couldn't load tasks. [Retry]

Bad:
> Oops! Something went wrong.

Never expose stack traces or raw error messages in the UI. Those belong in the activity log.

## Stale states

Content rendered while the cache is being refreshed in the background. Don't blank the content. Optionally show a subtle indicator (a muted dot, a small "refreshing…" caption) if the user benefits from knowing.

Most pages don't need a stale indicator. Add one only when staleness is consequential (e.g., the user is making a decision that depends on freshness).

## Primitives

Presentational leaves:

- `EmptyState` — empty-state component (icon, message, description, action slot)
- `Skeleton` — rectangular shimmer block for skeleton rows
- `Spinner` — inline spinner for fetching-more / async actions
- `Toast` (via Toast primitive) — action errors, success confirmations

State wrappers (the boundaries that render the leaves — see [Where states live](#where-states-live-the-boundary-tiers)):

- `withSuspense`, `withErrorBoundary`, `withEmpty`, `withSuspenseAndErrorBoundary` — HOCs in `src/lib/`
- `EmptyBoundary`, `ErrorBoundary` — the boundary elements, for inline use

## Open questions

- **Filtered-empty.** When the data exists but a filter eliminated it (search "xyzzy" matches nothing). Same affordance as truly-empty, or different? Currently the same; this may need to diverge — filtered-empty should suggest *clearing the filter*, not connecting a service.
- **Skeleton fidelity.** Per-domain skeletons (matching the exact row shape) vs one generic row skeleton? Currently per-domain.
- **Optimistic rollback.** When an action succeeds visually but fails on the server, how does the page rewind? Currently inconsistent.

## Related

- [Visual Hierarchy](visual-hierarchy.md) — the surfaces these states render onto
- [Overlay Primitives](overlay-primitives.md) — loading and error inside modals/popovers, which sit outside the route boundary tree
- [Design Philosophy (Engineering)](design-philosophy.md) — context vs consequence (in-card vs toast)
