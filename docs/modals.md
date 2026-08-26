# Modals

When to use a modal, what size, how it closes, and when *not* to use one.

Use modals deliberately. A modal is a focused interruption — it earns the user's attention by being modal. Use it when the interruption is justified; otherwise route to a page, open a sheet, or display inline.

## When to use a modal

Three legitimate cases:

| Case | Example |
|---|---|
| **Consequence** | Confirming a delete, archive, or bulk operation |
| **Focused form** | Quick Add, Create Item, Create Document |
| **Preview for a resolution entity** | Opening an actionable item from a row to glance + act |

If the interaction is *editorial* (deep editing, multi-step), strongly prefer a page. Modals are for short, focused intent — including the **preview** form for resolution entities, which is short by construction.

The preview case is governed by an entity's engagement class: resolution entities get modal previews; reference entities don't (the row already IS their preview).

## Sizes

The `Modal` primitive supports three sizes:

| Size | Width | Use for |
|---|---|---|
| `size="sm"` | ~480px | 1–3 fields, simple confirmations, rename dialogs |
| `size="md"` (default) | ~640px | Typical Create flows, single-purpose forms |
| `size="lg"` | ~800px | Inspector/preview modals showing rich content |

If a modal is reaching for `size="lg"`, consider whether it has overgrown its role. Two specific smells:

- **A preview modal at `size="lg"`** — preview modals are five-slot decision frames; they shouldn't need `lg`. If yours does, you're cramming page content into a preview. Strip back.
- **A focused form at `size="lg"`** — if the form needs that much room, it's probably multi-step or workspace-shaped. Route to a page.

### Examples

- `size="sm"` — a rename dialog (one field, focused); confirmation modals
- `size="md"` — Create flows (the default); typical preview modals for resolution entities
- `size="lg"` — reserved for richer focused forms; preview modals shouldn't reach this size

## Structure

Every modal uses the three sub-components: `Header`, `Body`, `Footer`. None are required, but the conventional shape is all three:

```tsx
<Modal onClose={onClose} size="md">
  <Modal.Header>Create Item</Modal.Header>
  <Modal.Body>
    {/* content */}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="outline" onClick={onClose}>Cancel</Button>
    <Button variant="solid" onClick={onSave}>Create Item</Button>
  </Modal.Footer>
</Modal>
```

### Header

- A single line, sentence case, no trailing punctuation.
- Names what the modal is *for*: "Create Item", "Delete Document", "Edit Profile".
- No subtitle unless the modal's purpose isn't obvious from the title alone.

### Body

- The actual content (form fields, message, preview).
- Scrolls internally if content overflows; the modal itself doesn't grow indefinitely.
- Density: typically Read or Scan depending on whether it's a preview or a form (see [Density Modes](density.md)).

### Footer

- Buttons aligned right, primary action on the rightmost position.
- Cancel on the left, primary on the right.
- Maximum 3 buttons. If you need more, the modal is doing too much.

## Close affordances

A modal can be closed by any of:

| Affordance | When supported |
|---|---|
| **X button in header** | Always |
| **Escape key** | Always |
| **Backdrop click** | Default yes, except for forms with unsaved input (prompt first) |
| **Cancel button in footer** | When the modal is editorial (form) |
| **Submit button success** | When the action completes |

### Backdrop click and unsaved input

For modals containing forms with unsaved input, **backdrop click should prompt before closing**, not silently lose data:

> Discard changes? Your edits haven't been saved.
> [Cancel] [Discard]

For read-only modals (previews, inspectors), backdrop click closes immediately.

## Confirmation modals

A confirmation modal is its own pattern. Structure:

```tsx
<Modal onClose={onClose} size="sm">
  <Modal.Header>Delete Sarah?</Modal.Header>
  <Modal.Body>
    This will remove her and her 47 messages. This can't be undone.
  </Modal.Body>
  <Modal.Footer>
    <Button variant="outline" onClick={onClose}>Cancel</Button>
    <Button variant="solid" intent="danger" onClick={onConfirm}>Delete Sarah</Button>
  </Modal.Footer>
</Modal>
```

Conventions:

- **Title is the question.** "Delete Sarah?" not "Confirm Delete".
- **Body names the consequence.** What specifically will happen, what's irreversible.
- **Confirm button restates the verb + noun.** "Delete Sarah", not "Confirm" or "OK".
- **Confirm button uses `intent="danger"`** for destructive actions, `intent="brand"` otherwise.
- **Cancel is the default focus.** A user pressing Enter accidentally shouldn't delete.

## Modal vs sheet vs popover

There are three overlay primitives. Pick by what kind of interruption fits:

| Primitive | Feels like | Use for |
|---|---|---|
| **Modal** | Centered, dimmed backdrop, must engage | Forms, confirmations, focused tasks |
| **Sheet** | Slides in from the side, dismissible | Inspectors, contextual detail, longer reads |
| **Popover** | Anchored to a trigger, no backdrop | Menus, tiny edits, info-on-demand |

If the user might want to keep the underlying page partially visible / interactive, prefer **sheet** or **popover**. If the user's attention should be fully on the interruption, **modal**.

## Anti-patterns

- **Modal as deep workspace.** If the user is settling in to edit or read at length, that's the page. Modal previews are dismissed in seconds; modal workspaces aren't a thing.
- **Modal preview for a reference (content) entity.** Documents and messages don't get modal previews — the list row IS the preview, and clicks route to the page. Wrapping them in a modal adds friction without answering a new question.
- **Preview modal that mirrors the page.** A preview that's "the page minus a few cards" is dead weight. The preview must answer a different question (the decision question) than the page (the workspace question). If you can't name two distinct questions, drop the preview.
- **Stacked modals.** Don't open a modal from inside a modal. If a confirmation is needed mid-form, use an inline state in the existing modal.
- **Modal with no clear primary action.** Every modal earns its existence with a verb. If there's no verb, it's a panel.
- **Generic title ("Edit").** Name what's being edited.
- **Silent backdrop dismiss with unsaved data.** Always prompt.
- **Submit and Cancel reversed.** Primary action goes on the right. Reversing this trains users to misread modals across the product.
- **Massive modal with scrolling content.** If the body needs to scroll a lot, this should be a page.

## Accessibility

Handled by the Modal primitive, but worth knowing:

- Focus moves into the modal on open (typically to the first interactive element or a close button).
- Focus is trapped inside the modal while open.
- Escape closes the modal (unless the form-discard prompt is active).
- Focus returns to the trigger on close.
- The modal has `aria-modal="true"` and the rest of the page is `aria-hidden`.

## Related

- [Forms](forms.md) — how forms inside modals behave
- [Design Philosophy (Engineering)](design-philosophy.md) — context vs consequence (modals are consequence)
- [States](states.md) — loading / error states inside modals
