# Component API Design

PA has three component API shapes — props-based, render props, and compound components — each with different trade-offs. This doc explains the choice.

## The three shapes

### Props-based (data array)

Pass collections as array props with configuration.

```tsx
<TaskList tasks={tasks} onTaskClick={handleClick} />
```

**Pros:**
- Simple, declarative API
- Easy to transform/filter data before passing
- Strong TypeScript typing on data shape
- Server data maps directly to props
- Easy to test (just pass different arrays)

**Cons:**
- Less flexible for per-item customization
- Configuration objects can grow unwieldy
- Can lead to "configuration hell" with nested options

**Best for:** Lists, tables, charts where items are uniform.

### Render props / children functions

Pass data with a render function for custom item rendering.

```tsx
<TaskList tasks={tasks}>
  {(task) => <CustomTaskCard task={task} />}
</TaskList>
```

**Pros:**
- Full control over item rendering
- Per-item customization without prop drilling
- Natural composition
- Can access parent context/state

**Cons:**
- More verbose
- Callback complexity (performance considerations)
- Less obvious data structure from API alone

**Best for:** Flexible rendering where items vary significantly.

### Compound components

Split component into composable sub-components connected via React Context.

```tsx
<TaskList>
  <TaskList.Header>
    <TaskList.Column>Title</TaskList.Column>
    <TaskList.Column>Due</TaskList.Column>
  </TaskList.Header>
  <TaskList.Body tasks={tasks}>
    {(task) => (
      <TaskList.Row>
        <TaskList.Cell>{task.title}</TaskList.Cell>
        <TaskList.Cell>{task.dueAt}</TaskList.Cell>
      </TaskList.Row>
    )}
  </TaskList.Body>
</TaskList>
```

**Pros:**
- Extremely flexible composition
- Self-documenting API (readable JSX structure)
- Parts share state via context
- Easy to add/remove/reorder sections
- Consumers can extend with custom sub-components

**Cons:**
- More boilerplate for simple cases
- Context overhead (performance)
- More components to maintain
- Harder to enforce required structure
- Easy to overengineer simple lists

**Best for:** Complex components with multiple configuration points (modals, forms, cards, navigation).

## Trade-off summary

| Aspect | Props-Based | Render Props | Compound Components |
|--------|-------------|--------------|---------------------|
| **Flexibility** | Low | Medium | High |
| **Simplicity** | High | Medium | Low |
| **Type Safety** | Excellent (one interface) | Good | Harder (optional children) |
| **Discovery** | IDE autocomplete | Clear from usage | Need to know sub-components |
| **Performance** | Easier to optimize | Callback overhead | Context re-renders |
| **Maintenance** | Centralized config | Moderate | Distributed logic |

## Hybrid: progressive disclosure

Provide both simple and advanced APIs in the same component.

```tsx
// Simple case — props
<TaskList tasks={tasks} />

// Complex case — compound
<TaskList>
  <TaskList.Filters>
    <SearchBox />
    <StatusFilter />
  </TaskList.Filters>
  <TaskList.Items tasks={tasks}>
    {(task) => <CustomTaskCard task={task} />}
  </TaskList.Items>
  <TaskList.Pagination />
</TaskList>
```

Simple props for common cases, compound components for power users.

## Decision framework

**Use props-based arrays when:**
- Items are uniform
- Configuration is simple
- Performance matters (large lists)
- Building for non-technical users

**Use render props when:**
- Need custom rendering per item
- Items vary in structure
- Need access to parent state/handlers

**Use compound components when:**
- Multiple configuration points
- Complex layout variations
- Building a component library
- Users need to extend/customize

## PA-specific guidance

Given PA's data-centric architecture:

1. **Collections (tasks, habits, events)** → Start with props-based arrays
2. **Complex displays (timeline, dashboard cards)** → Compound components
3. **Filters/aggregations** → Render props for flexibility

Start simple (props). Add compound APIs when patterns emerge.

### Primitives in `src/components`: the uniform-vs-slots rule

The primitives mix array-prop and compound shapes. The rule is the same axis applied at the primitive layer:

- **Array prop** when the children would be a *uniform repeating sequence* of the same node. Each item is data, not markup. Example shape: `items={[{ value, label }]}` or `options={[{ value, label }]}`.
- **Compound children** when the children are *unique, heterogeneous slots* that each carry their own markup. Example: a header, a body, a footer — three distinct sub-trees, none interchangeable.

How that lands in current code:

| Primitive       | Shape       | Why                                                                              |
|-----------------|-------------|----------------------------------------------------------------------------------|
| `Tabs`          | Array prop  | `items: TabItem[]` — uniform `{ value, label, content }` repeating items         |
| `Select`        | Array prop  | `options: SelectOption[]` — uniform `{ value, label }` repeating items           |
| `Modal`         | Compound    | `Modal.Header / Body / Footer` — unique slots, each with distinct markup         |
| `Popover`       | Compound    | `Popover.Trigger / Body / Close` — unique slots                                  |
| `Tooltip`       | Compound    | `Tooltip.Trigger / Body` — unique slots                                          |
| `HoverCard`     | Compound    | unique slots                                                                     |
| `Sheet`         | Compound    | unique slots                                                                     |
| `Card`          | Props-based | `title`/`headerAction` props — a header is a *parameter*, not a slot consumers vary |

**When the rule is ambiguous:** ask whether a typical consumer would put different markup in each child. If yes, compound. If they'd `.map()` over data to produce each child, array prop. If both feel plausible, the array prop is the more constrained, type-safer choice — start there and refactor to compound if the constraint becomes painful.

**Limit of the array-prop shape:** when consumers need per-item custom rendering (a Tab trigger with a badge, a Select option with an icon), the array prop becomes a `renderItem` render-prop or the primitive switches to compound. That refactor is the signal that the simple shape ran out, not a sign you should have started with compound. Most PA primitives never need it.
