# Tree — Functional Requirements and Hints

## Node structure

A tree renders a hierarchical list of nodes. Each node has a label and an optional icon. A node can be expanded or collapsed to show or hide its descendants.

A node declares whether it can be expanded. By default that follows from whether it currently has children, but a node can also be marked expandable while its children are still unknown — that is how a remote hierarchy is browsed one level at a time. A node's children therefore carry a third meaning: absent means the level was never fetched, an empty list means it was fetched and there was nothing in it.

The node type is designed to be extended, and doing so is the recommended pattern. The tree reads the properties it knows and ignores everything else, so consumer data belongs on the node rather than in a parallel map keyed by identifier. An extending type should redeclare its children as its own type, otherwise descendants stay the base type. Every provided helper is generic over the node type and rebuilds nodes by spreading, so extra properties survive each update and the extended type is preserved end to end. Event payloads are typed as the base node, because the component has no knowledge of the extension — look the emitted identifier up with the provided helper rather than casting.

A node can also be marked as pending while its level is being fetched. A pending node shows a progress indicator in place of the expand affordance, is announced as busy, and ignores further expand and collapse attempts until the level arrives.

## Node icons

Each node has an optional icon name. When no icon is provided the component selects a default based on the node's state:

- Expandable node, collapsed → `Folder` icon
- Expandable node, expanded → `FolderOpen` icon
- Node that cannot be expanded → `Placeholder` icon, rendered in muted colour

Expandability drives this choice, not the presence of children, so a container that turned out to be empty still reads as a container.

When an explicit icon is given it is used as-is, with one exception: a node whose icon is `Folder` will automatically switch to `FolderOpen` while expanded. The consumer can replace the whole rule with its own resolver, which receives the node together with its resolved expanded, expandable and active state.

## Expansion state

The consumer owns expansion. Each node's expanded flag is the single source of truth, and the component only reads it — it never writes back onto the consumer's node objects, so the node data can be frozen or derived. A toggle emits the affected node together with the direction, and nothing moves until the consumer applies that intent to its own node data. The same write covers every programmatic case: revealing a deep-linked path, collapsing a stale branch, expanding everything. The package exports a helper that returns a copy of a node array with a patch applied to one node, rebuilding only the branch above it.

Two consequences follow. Re-projecting the node array from raw data discards expansion unless the flags are carried over. Two tree instances bound to the same array expand in lockstep, so panes that need to differ require their own copy.

When an expanded node resolves to no children, the component can optionally render a single disabled row so an empty container does not read as a leaf.

## Multi-check

The tree can optionally render a checkbox on every row. It sits between the expand affordance and the leading icon, and rests dimmed until the row is hovered, focused or active, at which point it comes to full opacity. A checked or mixed row keeps its checkbox fully visible at all times, otherwise the user could not see what is ticked.

Check state is consumer-owned in exactly the same way as expansion: the node carries a tri-state check flag — unchecked, checked or mixed, the same vocabulary the standalone checkbox uses — the component reads it, and activating a checkbox only emits the requested state. Activating a mixed node clears it. The component never cascades a check to descendants and never rolls a mixed state up to ancestors — those are product decisions, so the consumer applies them when it writes the new node array.

Checking is distinct from activation. The active node is the single row that drives the detail pane; checking is a bulk set. They can be used together.

## Active node

One node at a time is active. The active identifier is a two-way bindable model: clicking a node, or pressing Enter on it, makes it active and emits the new identifier, and the consumer can bind one way and override the value instead. Activating a node does not expand it. A separate option makes activation also open the node — open only, never close, so a second click cannot hide what the user just revealed.

Activation emits the identifier only. A consumer that needs the node object looks it up with the provided lookup helper.

## Trailing icons

Each node row optionally shows trailing action icons on hover and when active. A node can individually opt out of showing trailing icons regardless of the global setting.

## Indent guides

Nested levels render vertical guide lines that visually connect siblings. The guide line for a column terminates at the midpoint of the last sibling row in that group, so there are no floating lines below the final child. A curve connector joins the vertical line to the node icon on the innermost column.

> **Do not modify the indent guide logic (`indentGuides`, `indentGuideArray`, `buildNestedIndentGuides` context) or the `__trail` SCSS rules.** The alignment, cutoff, and curve behaviour are intentional and fragile.

## Provided helpers

Because every piece of state is consumer-owned, the package ships the pure functions that state needs. Each one returns a new node array and leaves untouched branches identical by reference, so change detection stays cheap. All of them are generic over the node type, so an extended node keeps both its extra data and its type.

- **Patch one node** — applies a single emitted intent: expansion, pending, or a level of children that just arrived.
- **Cascade a check** — writes a check onto a node and its descendants, then re-derives every ancestor from its children. This is one policy, not the policy: a hierarchy whose rows check independently patches the single node instead.
- **Collect checked nodes** — harvests the result depth first, excluding mixed nodes.
- **Find a node by identifier** — turns a stored identifier, such as the active one or a route parameter, back into node data.
- **Path to a node** — the ancestor chain from the root down to a node, for breadcrumbs.
- **Expand a path** — reveals a node by expanding its ancestors. Only reaches loaded branches, so a remote hierarchy still has to be fetched one level at a time.

## Keyboard navigation

- **Enter** — makes the focused node active.
- **Space** — toggles the focused node's checkbox when multi-check is on, otherwise makes the node active.
- **Arrow Right** — requests expansion of a collapsed expandable node, including one whose children have not been fetched yet.
- **Arrow Left** — requests collapse of an expanded node.
- **Arrow Down / Arrow Up** — moves focus to the next or previous visible node row.

Expand and collapse are ignored while a node is pending.
