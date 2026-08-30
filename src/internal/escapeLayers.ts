"use client";

import { useEffect } from "react";

/**
 * Registry of open "escape layers" — transient floating overlays (popovers,
 * select dropdowns, picker calendars) that should consume an Escape press
 * before any dialog beneath them reacts to it.
 *
 * The dialogs and these overlays each listen for Escape on `document`
 * independently (floating-ui's `useDismiss` has no tree here), and document
 * listeners fire in registration order — usually the dialog's first, since it
 * opened first. So a dialog cannot rely on `defaultPrevented`; instead it asks
 * this registry whether a layer is open and, if so, leaves the Escape to it.
 * The registry is read synchronously during the event, before React commits
 * the layer's close, so the layer that is handling this Escape still counts.
 *
 * Module-level on purpose: Popover, Select and Modal live in separate subpath
 * entries with no shared context, and a context would also miss overlays
 * rendered outside an `OverlayProvider`.
 */
const transientLayers = new Set<symbol>();
const dialogLayers = new Set<symbol>();

/** True while any transient escape-consuming overlay (popover-like) is open. */
export const hasOpenEscapeLayer = () => transientLayers.size > 0;

/** True while any modal dialog is open. A non-modal Sheet under a Modal defers Escape to it. */
export const hasOpenEscapeDialog = () => dialogLayers.size > 0;

function useRegistration(registry: Set<symbol>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const token = Symbol("escape-layer");
    registry.add(token);
    return () => {
      registry.delete(token);
    };
  }, [registry, active]);
}

/**
 * Marks this component as an open transient escape layer while `active` is
 * true. Call with the overlay's `open` state.
 */
export function useEscapeLayer(active: boolean) {
  useRegistration(transientLayers, active);
}

/** Marks this component as an open modal dialog while `active` is true. */
export function useEscapeDialog(active: boolean) {
  useRegistration(dialogLayers, active);
}
