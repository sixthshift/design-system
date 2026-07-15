# Forms

How PA handles user input: validation, errors, submit affordances, modal forms vs page forms.

Form UX is the part of PA most likely to drift. Every Create modal, Edit modal, and settings panel is a form, and each one improvises slightly differently. This doc codifies the patterns so they converge.

## Form types

PA has three form contexts. They share rules but differ in shape:

| Form type | Where | Shape |
|---|---|---|
| **Modal form** | CreateTask, CreateNote, CreatePerson | A modal with fields + Cancel/Save buttons |
| **Page form** | Settings, integration config | Inline on a page, with Save at the bottom |
| **Inline edit** | Edit a single field in place | Click-to-edit pattern, blur-to-save |

Modal forms are the most common in PA.

## Validation

### Timing

Validate at three moments, in order of how disruptive each one feels:

1. **On blur** — when the user leaves a field. Show the field's error inline. Least disruptive.
2. **On submit** — when the user tries to save. Show *all* errors at once and prevent submission. Use for validations that can only run server-side or that don't make sense per-field.
3. **On change** — as the user types. **Avoid** for new input — it's noisy. Use only after a field has already errored (so the user sees the error clear as they fix it).

The flow: type freely → blur shows per-field errors → submit shows any remaining errors and blocks. No "as-you-type" red highlighting on a fresh field.

### Error placement

| Error scope | Where it appears |
|---|---|
| Per-field error | Beneath the field, in `intent="danger"` text |
| Cross-field error | At the top of the form, in a banner |
| Submission error (server failed) | At the top of the form, in a banner with retry |

Don't use toasts for form errors — they vanish before the user can read and act.

### Error wording

Per [Copy Conventions](copy-conventions.md):

- Tell the user what's wrong, not what they did wrong: "Email is required" not "You forgot the email"
- Use sentence case: "Name must be at least 2 characters"
- Don't use "Please" — it adds nothing
- Don't apologize ("Sorry, that email is taken")
- Be specific: "This email is already used by another person" not "Invalid"

## Submit affordances

### Button labels

The submit button names what's about to happen, not just "Submit":

| Form | Label |
|---|---|
| Create | "Create Task", "Create Note", "Add Person" |
| Edit | "Save Changes" or "Save" |
| Delete | "Delete Task" (in a confirmation modal) |

Never use "OK", "Submit", "Apply" — they don't name the action.

### Button state during submit

- **Idle:** label as above
- **In flight:** label changes to verb-ing — "Creating…", "Saving…", "Deleting…". Button is disabled. No spinner needed; the ellipsis carries the meaning.
- **After success:** form closes (modal) or shows a success toast (page form). Button returns to idle if the form stays open.
- **After error:** button returns to idle. Error appears at the top of the form.

### Primary vs secondary

- **Save / Create / primary action:** `variant="solid"`, `intent="brand"` (or `intent="danger"` for destructive)
- **Cancel:** `variant="outline"` (or text-only for very simple modals)

Always put the primary action on the *right* in horizontal button rows. Cancel on the left.

## Modal forms

### Structure

```tsx
<Modal>
  <Modal.Header>Create Task</Modal.Header>
  <Modal.Body>
    {/* form fields */}
    {/* cross-field error banner if needed */}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="outline" onClick={onClose}>Cancel</Button>
    <Button variant="solid" onClick={onSubmit} disabled={isSubmitting}>
      {isSubmitting ? "Creating…" : "Create Task"}
    </Button>
  </Modal.Footer>
</Modal>
```

### Sizes

- **Small modal** (`size="sm"`) for 1–3 fields ("Quick Add" style)
- **Medium modal** (default) for typical Create flows
- **Large modal** (`size="lg"`) only when fields are dense or have rich content

See [Modal Patterns](modals.md) for size guidance overall.

### Closing the modal

A modal form closes when:
- The user clicks Cancel
- The user presses Escape (always)
- The user clicks the backdrop (configurable; default yes for read-only modals, no for forms with unsaved input)
- The submit succeeds

If the user has typed something and tries to close, **prompt before discarding**:

> Discard changes? Your task hasn't been saved.
> [Cancel] [Discard]

Don't silently lose user input.

### Worked example

`packages/web/src/modules/library/tasks/components/CreateTaskModal.tsx` is the closest reference implementation. `CreateNoteModal.tsx` and `CreateHabitModal.tsx` follow similar shapes with domain-specific fields.

## Page forms

Page forms (settings, integration configuration) follow the same rules with a few differences:

- **No modal wrapper.** The form fills its page section.
- **Save button at the bottom** of the form, right-aligned.
- **Auto-save vs explicit save:** prefer explicit. Auto-save introduces ambiguity ("did that take?"). Explicit Save is unambiguous.
- **Cancel/discard** behavior: if the page is purely a form (like a Settings panel), there's nowhere to navigate "back to" — instead, show a "Discard changes" link near Save once changes exist.

## Inline edits

For "click a field to edit it in place":

- **Click-to-enter-edit.** A normal display value, click to activate.
- **Blur-to-save.** When the user clicks away or presses Tab, save automatically.
- **Escape-to-cancel.** Press Escape to revert.
- **Visual feedback.** When the field is in edit mode, show its border or background change. When saving, a subtle inline indicator (small spinner or "Saved" caption that fades).

Inline edits are best for *small* fields where the cost of being wrong is low and there are many to edit (e.g., editing a list of items rapidly). Don't use inline editing for fields where validation matters or the change has side effects.

## Anti-patterns

- **As-you-type validation on fresh fields.** Wait for blur.
- **Toast for form errors.** They vanish; the error returns when the user comes back. Use inline.
- **Submit button labeled "OK".** Name the action.
- **Silent data loss.** Prompt before discarding modal input. Don't auto-close on outside click for forms with unsaved data.
- **Disabled submit button with no explanation.** If you disable it, also show *why*: "Add an email to continue" near the disabled button or beneath the empty field.
- **Spinners in addition to verb-ing labels.** "Creating…" is enough; no extra spinner needed.
- **Form fields without labels.** Placeholder-only fields fail accessibility and break under autocomplete. Always include a label.

## Accessibility checklist

- Every input has a `<label>` (use the primitives, they handle this).
- Per-field errors are linked to inputs via `aria-describedby`.
- Submit button is reachable by keyboard; pressing Enter inside an input submits (unless inside a textarea).
- Escape closes modal forms.
- Focus moves to the first error field after a failed submit.
- Focus returns to the trigger element after the modal closes.

## Open questions

- **Form library.** PA doesn't currently mandate one (no react-hook-form, no Formik in @sixthshift/ui). Validation is hand-rolled per form. Worth deciding if/when to add one.
- **Dirty-state tracking.** Right now each form tracks its own dirty state. A `useDirtyForm` hook in `@sixthshift/ui/hooks` could centralize this and the discard-prompt.
- **Server-side validation surfacing.** When the server rejects a submit with field errors, mapping those to per-field state isn't standardized.

## Related

- [Modal Patterns](modals.md) — the container most forms live in
- [States](states.md) — error and loading states for forms
- [Copy Conventions](copy-conventions.md) — error message wording
- [Design Philosophy (Engineering)](design-philosophy.md) — context vs consequence (forms are consequence — they earn their friction)
