# Overlay Primitives

Every floating surface in `@sixthshift/design-system` — `Modal`, `Sheet`, `Popover`, `Tooltip`, `HoverCard`, `Select`, `Toast` — is built from the same small set of parts. This doc is the construction contract: what a new overlay must wire up, and why each piece exists. It sits underneath the surface-level docs ([Modals](modals.md), [Component API Design](component-api-design.md), [Composition](composition.md)) and the motion vocabulary ([Motion](motion.md)) those overlays consume. Read those for *when* to reach for a given overlay; read this for *how* one is assembled.

## The shared contract

All overlays rest on [`@floating-ui/react`](https://floating-ui.com/) and agree on five things:

1. **Positioning, portalling, and focus come from floating-ui.** `useFloating` for placement, `FloatingPortal` to escape the DOM tree, `FloatingFocusManager` for focus trapping, `useDismiss`/`useRole`/`useHover`/`useFocus`/`useClick` for behavior. No overlay computes its own coordinates or hand-rolls a portal.
2. **State is a `open` + `onOpenChange(open)` pair.** Trigger-anchored overlays drive this through `useControllableState` (`src/hooks/useControllableState.ts`) so they work controlled or uncontrolled. The mount-driven overlays (`Modal`, `Sheet`) keep the *same signature* even though their open-ness is really "am I rendered" — see [Why Modal keeps `onOpenChange`](#why-modal-keeps-onopenchange).
3. **Exit animations require staying mounted.** An overlay that unmounts on close can't animate out. The three mount-driven overlays solve this with `usePresence` (`src/hooks/usePresence.ts`), which holds the node in the DOM through its exit animation. See [The presence lifecycle](#the-presence-lifecycle).
4. **`data-state` drives the animation.** The floating node is stamped with `data-state={state}`, and the `animate-*` classes are gated on that state. The classes map to keyframes declared in the `@theme` block of `src/theme/tokens.css`.
5. **Escape and stack ordering are not per-component.** Modal escape handling and z-stacking live in `OverlayProvider` (`src/lib/contexts/OverlayContext/OverlayContext.tsx`), not in each overlay. See [OverlayContext responsibilities](#overlaycontext-responsibilities).

Two families fall out of this. **Trigger-anchored** overlays (`Popover`, `Tooltip`, `HoverCard`, `Select`) live next to a trigger, position against it, and hard-unmount on close — `if (!open) return null` in the content component (e.g. `src/components/HoverCard/components/HoverCardContent.tsx:11`). **Mount-driven** overlays (`Modal`, `Sheet`, `Toast`) are conditionally rendered by a parent or a stack, own their mount lifecycle, and animate out via `usePresence`.

## What every overlay must implement

- **Build on floating-ui.** Use `useFloating` + the interaction hooks; never reinvent positioning or portalling.
- **Expose `open` + `onOpenChange`** (controlled), and for trigger-anchored overlays a `defaultOpen` for the uncontrolled path via `useControllableState`.
- **Portal the floating node** with `FloatingPortal`. Trigger-anchored overlays portal to `document.body`; modals and toasts portal to their dedicated roots (below).
- **Pick a `z-*` token**, not a raw z-index. The vocabulary is `z-popover` (popover/tooltip/hover-card/select), `z-modal`, `z-sheet`, `z-toast` — defined in the Tailwind config.
- **If you animate on exit, use `usePresence`** and `useMergedFloatingRef` (`src/hooks/useMergedFloatingRef.ts`) to combine the floating ref, the presence ref, and any consumer ref into one callback ref. Stamp `data-state={state}` and gate `animate-*` classes on `state === "entering"` / `state === "exiting"`.
- **Assemble as a compound component** with `Object.assign(Root, { Sub })` plus a context — see [Compound assembly](#compound-assembly).
- **Don't handle Escape yourself if you're a modal.** Let `OverlayProvider` own it (`useDismiss` is configured with `escapeKey: false` in `Modal`). Trigger-anchored overlays and `Sheet` keep `useDismiss`'s own escape handling because they're not in the modal stack.

## The presence lifecycle

`usePresence` exists because React unmounts a component the instant its `open` goes false, which kills any exit animation. The hook keeps the node mounted through its exit, transitioning on the real `animationend` event rather than a `setTimeout` — so JS never has to know the CSS duration, and an interrupted animation still resolves correctly (`src/hooks/usePresence.ts:72`).

It is a four-state machine:

```
            show()                animationend
  hidden ──────────▶ entering ───────────────▶ visible
    ▲                                             │
    │ animationend                                │ hide(onComplete?)
    │                                             ▼
    └──────────────────── exiting ◀───────────────┘
                            │
                            └─▶ onComplete()  (fired after state reaches "hidden")
```

- `isMounted` is `state !== "hidden"` — the overlay returns `null` only in `hidden`.
- `show()` moves `hidden → entering`; the `animate-*-in` class plays; `animationend` advances to `visible`.
- `hide(onComplete)` moves to `exiting`; the `animate-*-out` class plays; `animationend` advances to `hidden`, *then* `onComplete` fires (deferred to an effect so it doesn't update state mid-render — `src/hooks/usePresence.ts:82`).

The `onComplete` callback is how a mount-driven overlay tells its owner "the exit finished, you can drop me now." In `Modal`, `handleClose` calls `hide(handleDismiss)`, so the stack removal/`onOpenChange(false)` runs only after the fade-out completes (`src/components/Modal/Modal.tsx:65`). `Sheet` drives the same hook from its controlled `open` prop instead: an effect calls `show()`/`hide()` as `open` flips (`src/components/Sheet/Sheet.tsx:60`).

Animations are defined once. `animate-fade-in/out` (Modal overlay + desktop modal, Toast), `animate-slide-up-in/out` (mobile modal sheet), and `animate-slide-{right,left}-in/out` (Sheet by side) all resolve to keyframes in the `@theme` block of `src/theme/tokens.css`, each `200ms ease-out forwards`. A global `prefers-reduced-motion` rule in the same file collapses every animation to `0.01ms`, so overlays inherit reduced-motion behavior for free.

## OverlayContext responsibilities

`OverlayProvider` is mounted once at the app root with the two portal targets:

```tsx
const modalRoot = document.getElementById("modal-root");
const toastRoot = document.getElementById("toast-root");
<OverlayProvider modal={modalRoot} toast={toastRoot}>...</OverlayProvider>
```

It owns three things no individual overlay should:

- **Two portal roots.** `modal-root` and `toast-root` are real DOM nodes in `index.html`; the provider falls back to `document.body` if either is absent (`OverlayContext.tsx:31`).
- **Two stacks.** A `useStack` (`src/hooks/useStack.ts`) each for modals and toasts. `useModal().openModal(Component)` pushes onto the modal stack; `useToast()` pushes onto the toast stack. Stack items carry their own `onClose` and live `data` (updatable via `update()`).
- **Global Escape for the modal stack.** A single `keydown` listener closes the *topmost* modal only — correct stack ordering, handled in one place rather than racing N per-component listeners (`OverlayContext.tsx:41`). This is why `Modal` sets `escapeKey: false` on its `useDismiss`. Trigger-anchored overlays are *not* in this stack, so they keep floating-ui's own escape dismissal; `Sheet` likewise keeps `escapeKey: true` because it's rendered inline, not via the stack.

Toasts render inside the provider's own positioned container (`fixed bottom-6 left-1/2 z-toast …`), which is why a stacked `Toast` is passed `standalone={false}` — the provider positions it, the toast just animates (`OverlayContext.tsx:81`, `src/components/Toast/Toast.tsx:104`).

## Compound assembly

Every overlay ships as a root plus named sub-parts joined with `Object.assign`, with a context carrying the floating refs, `open`, and the interaction prop-getters down to the parts. For example `Popover.tsx:64`:

```tsx
export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Body: PopoverBody,
  Close: PopoverClose,
});
```

`PopoverRoot` builds the floating context and publishes it through `PopoverContext`; `Popover.Trigger` reads `getReferenceProps` and `setReference`, `Popover.Body` reads `getFloatingProps`, `floatingStyles`, and `setFloating`. The mount-driven overlays follow the same shape (`Modal`/`Sheet` expose `.Header`/`.Body`/`.Footer`), but their context carries an `onClose` instead of floating refs, because the floating node lives in the root. The rationale for choosing compound children over array props is [Component API Design](component-api-design.md); the broader primitives-into-pages story is [Composition](composition.md).

## Worked example: Popover

`src/components/Popover/Popover.tsx` is the cleanest trigger-anchored overlay to copy:

- **State** — `useControllableState` at `Popover.tsx:26` makes it work both controlled (`open`/`onOpenChange`) and uncontrolled (`defaultOpen`).
- **Floating** — `useFloating` at `Popover.tsx:32` with `offset → flip → shift` middleware, `strategy: "fixed"`, and `whileElementsMounted: autoUpdate` to reposition on scroll/resize.
- **Behavior** — `useClick` + `useDismiss` composed through `useInteractions` (`Popover.tsx:41`). Escape and outside-press dismissal come from `useDismiss` directly — no `OverlayProvider` involvement, because a popover isn't in the modal stack.
- **Portal + unmount** — `PopoverBody` renders inside `FloatingPortal` and returns `null` when closed; no `usePresence`, because popovers don't currently animate out.
- **Assembly** — `Object.assign` + `PopoverContext` as above.

A new trigger-anchored overlay differs from this only in *which* interaction hooks it composes: `Tooltip`/`HoverCard` swap `useClick` for `useHover` + `useFocus` (`Tooltip.tsx:39`, `HoverCard.tsx:52`, the latter adding `safePolygon()` so the cursor can cross the gap to the card). For a mount-driven overlay, copy `Modal.tsx` instead: `usePresence` + `useMergedFloatingRef` + `FloatingFocusManager modal` + `data-state` + the `animate-fade-*` / `animate-slide-up-*` pairs.

## Why Modal keeps `onOpenChange`

`Modal` is mount-driven — a parent (or `useModal`'s stack) decides whether it renders, so `open` is effectively always `true` inside the component (`Modal.tsx:70`). It still exposes `onOpenChange(open)` and matches the trigger-anchored signature. Two reasons, documented at the prop (`Modal.tsx:12`): a uniform open/close contract across *all* overlays means consumers don't learn a second shape, and it leaves room to evolve `Modal` into a state-driven primitive without a breaking API change. The boolean is adapted internally — `useDismiss`'s `onOpenChange(false)` is funneled into `handleClose`, which plays the exit animation before the real dismissal fires.

## Anti-patterns

- **Hard-coded z-index.** Use the `z-*` tokens. A raw `z-50` will eventually sit wrong relative to a modal or toast.
- **Per-component Escape on a modal.** Don't add `escapeKey: true` to a stacked modal's `useDismiss` — you'll double-close or close the wrong layer. `OverlayProvider` owns modal-stack escape.
- **`setTimeout` for exit animations.** Use `usePresence`. Hand-timed unmounts drift out of sync with the CSS duration and break under interruption.
- **Unmounting before the exit plays.** Returning `null` the moment `open` goes false skips the animation. Mount-driven overlays must gate unmount on `isMounted`, not `open`.
- **A second open/close shape.** Don't invent `isVisible` + `onClose` for a new overlay. The contract is `open` + `onOpenChange`, even when open-ness is really mount-ness.
- **Reaching past the compound context.** Sub-parts should read refs and prop-getters from their overlay's context, not receive them as drilled props.

## Related

- [Modals](modals.md) — sizes, close affordances, and when to use a modal at all
- [Component API Design](component-api-design.md) — why these overlays use compound children over array props
- [Composition](composition.md) — composing primitives into composites into pages
- [Motion](motion.md) — the animation vocabulary overlays draw the `animate-*` classes from
- [Component Catalog](component-catalog.md) — the overlay components' public APIs
