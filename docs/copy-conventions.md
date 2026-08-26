# Copy Conventions

Builder reference for writing UI strings. Terminology, microcopy patterns, and rules.

The system has a distinct voice (warm, capable, direct, respectful). This doc captures the practical conventions that produce that voice in code — terminology, phrasing patterns, and what to avoid.

## Terminology

Prefer the warm, plain word over the technical or enterprise one. The cross-product cases:

| Use | Not |
|---|---|
| Lock / Unlock | Login / Logout |
| Connect | Integrate, Sync, Link, Authenticate |
| Capture | Add, Create, New (for casual entry — Quick Add) |
| Library | Database, Records, Resources |

Entity nouns are the consuming product's own vocabulary — pick one word per concept and use it everywhere, in labels, empty states, and errors alike. When adding a new concept, ask: *what is the warmest, simplest English word for this?* If you can't find one, that's a signal the concept might be over-abstracted.

## Microcopy patterns

### Buttons

- **Verb-first, imperative.** "Add Item", not "New Item" or "Create Item".
- **Specific.** "Delete Document", not "Delete". The verb names what's affected.
- **Title-case the verb and noun.** "Mark Done", "Connect Account".
- **No trailing punctuation.** Button labels are commands, not sentences.

### Insight strips / counts

- **Lowercase.** "18 items · 8 active this week" — the strip is supporting context, not a heading.
- **No exclamation.** Even when the count is good.
- **Pivot only when useful.** Each segment should say something the rest of the page doesn't already show. If the count is duplicated below, drop it.

### Empty states

Pattern: *state the fact, offer the path*.

```
[Icon]
No items yet
Connect a source to pull yours in, or create one manually.
[Connect a source] [Create item]
```

- First line: the fact, two or three words.
- Second line: one sentence offering the next step.
- Action: connect first, manual second (per the onramp preference).

### Error messages

Pattern: *what failed, what to try*.

```
Couldn't load items. [Retry]
```

- Past tense for the failure ("Couldn't"), not present ("Can't").
- Actionable verb in the button: "Retry", not "OK" or "Dismiss".
- No "Oops", no "Sorry", no apology.
- Never expose stack traces, error codes, or technical detail to the user. Log those; show humans the fact.

### Destructive confirmations

Pattern: *name the consequence, ask plainly*.

```
Delete Sarah?
This will remove her and her 47 messages. This can't be undone.
[Cancel] [Delete Sarah]
```

- Title is the question.
- Body names what specifically will be lost.
- Confirm button restates the verb + noun — not just "Confirm" or "OK".

### Loading affordances

- **Initial load**: no copy needed — skeletons speak for themselves.
- **Fetching more**: "Loading more…" with ellipsis (the ellipsis carries the *in-progress* meaning).
- **Action in flight**: button label changes — "Save" → "Saving…". Don't add a separate spinner if the verb-with-ellipsis is clear.

### Toast messages

- **Success**: state what happened, in past tense. "Item added." not "Successfully added the item!"
- **Error (action)**: state what failed and offer retry where possible. "Couldn't add item. [Retry]"
- **No icons** beyond the toast primitive's built-in semantic affordance.

## What never appears in copy

- **Exclamation marks.** Even for celebrations.
- **Emoji** in static UI strings. Lucide icons cover semantic needs.
- **"Oops"**, **"Whoops"**, **"Uh oh"**, etc. Don't perform surprise at errors.
- **"Successfully"**, **"Awesome"**, **"Great"**, etc. Don't congratulate routine actions.
- **"User"** referring to the person using the product. It's *you*.
- **Stack traces, error codes, technical jargon** in user-facing surfaces.
- **All-caps section titles** ("ACTIVE", "ARCHIVED"). Title case or sentence case only.
- **Marketing voice.** "Powerful", "seamless", "intelligent" — show, don't tell.

## Capitalization

- **Title Case** for page titles, section headings, and button labels.
- **Sentence case** for body text, insight strips, descriptions, and empty-state copy.
- **lowercase** for tiny metadata (timestamps "2d ago", labels "professional", state words "active").
- **No ALL CAPS** anywhere except acronyms (AI, OAuth, URL).

## Punctuation

- **Middle dot (·)** as separator in inline lists: "18 items · 8 active · 7 to review".
- **Em dash (—)** for asides in prose; rare in UI strings.
- **Ellipsis (…)** for in-progress states ("Loading more…", "Saving…").
- **No trailing periods** on button labels or one-line counts.
- **Periods** on descriptive sentences in empty states, modals, and longer copy.

## Related

- [Design Philosophy (Engineering)](design-philosophy.md) — practice that copy fits into
- [States](states.md) — copy patterns for empty / loading / error states
