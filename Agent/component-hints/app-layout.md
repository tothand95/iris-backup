# App layout — Functional Requirements and Hints

The application shell for Iris-based products. Provides the outer chrome around every page: a top bar, an optional left sidebar with primary navigation, and a scrollable content area for page content. The layout owns the collapsed/expanded state of the sidebar and the global shortcut for toggling it; individual pages are only responsible for what renders inside the content area.

## Structure

The layout is composed of a group of components that live together in the same folder and are consumed as a set:

- **App layout** — the outer container. Renders the sidebar on the left and the main region on the right, and coordinates the collapsed/expanded state.
- **Top bar** — always visible at the top of the main region. Contains, from left to right: the product identity area, the sidebar toggle (its icon reflects whether the sidebar is currently expanded or collapsed), a page title / breadcrumb slot, and a right-hand actions slot.
- **Sidebar** — nav-only container. Contains one or more nav groups and an optional footer slot. Hidden entirely when the layout is collapsed.
- **Nav group** and **nav group header** — group related nav items with an optional labeled, collapsible header (e.g. "Other").
- **Nav item** — a single navigation entry with an icon and label. Supports `active` and `disabled` states.
- **Product switcher** — optional. When provided, renders the product identity area as a menu trigger.
- **AI CTA** — the "Ask AI" pill used in the top bar's right-hand actions.

Sidebar and top bar are never used in isolation; they are always children of the app layout.

## Collapsed and expanded states

The layout has two states, expanded (default) and collapsed. The state is owned by the consumer via a two-way bindable input. In the collapsed state the sidebar column animates to zero width, clipping the sidebar away and taking it out of the tab order; the top bar remains unchanged. In both states the top bar shows the product identity area and the sidebar toggle in the same position, so the toggle never shifts. The width animation is skipped while the resize handle is dragged and when the user prefers reduced motion.

## Keyboard shortcut

`Ctrl + B` (Windows/Linux) and `Cmd + B` (macOS) toggle the sidebar globally. The shortcut is ignored when the focus is inside a text input, textarea, or contenteditable element so it does not interfere with typing.

## Resizable sidebar

The vertical edge between the sidebar column and the content column is a drag handle. Hovering it shows a horizontal resize cursor; dragging it left or right changes the width of the whole left column (product identity area and sidebar together). The width is clamped to a fixed range (210px–340px, not configurable), is exposed as a two-way bindable input so the consumer can persist it, and the handle can be turned off entirely. Dragging the handle close to the left edge of the layout (within 100px) collapses the layout and ends the drag; the width from before the drag is kept, so expanding restores it. The handle is keyboard operable: it is focusable, arrow keys resize in fixed steps, and Home/End jump to the minimum and maximum. It is not rendered while the layout is collapsed.

## Product identity area

The top bar's leftmost slot renders the product identity. Three modes:

- **With product switcher** — when two or more products are provided, the area renders the product logo, the active product's name, and a caret. Activating it opens a menu of products; selecting one emits a product-change event. The active product is marked with a check.
- **Single product** — the logo and the product name are rendered without a caret or menu. Activating it emits a `logoClick` event; the consuming app decides what happens (typically navigating home).
- **Without products** — only the logo is rendered, and activating it emits a `logoClick` event. There is no product name and no caret.

The product switcher menu is available in both collapsed and expanded layout states.

## Page title / breadcrumb slot

The top bar exposes a slot between the sidebar toggle and the right-hand actions. Consumers project either a plain page title or an `iris-breadcrumb`. Nothing about the layout depends on which is used.

## Right-hand actions

The top bar exposes a right-hand actions slot with a sensible default (search, notifications, AI CTA, avatar). Consumers can replace the default entirely by projecting their own content.

## Sidebar footer

The sidebar exposes a footer slot at the bottom. It has no default content; consumers project their own. When the layout is collapsed the sidebar is hidden and the footer is not visible.

## Nav items

Each nav item has an icon, a label, and optional `active` and `disabled` states. Only one nav item is `active` at a time; the active state is owned by the consumer. A disabled item is visible but not interactive and is not part of the tab order. Activating an enabled item emits a selection event; the consumer decides whether to update the active identifier and how to route.

## Content area

The main region below the top bar hosts a single content slot with an internal padding and a scrolling container so long pages scroll inside the content area rather than the whole viewport. The top bar and sidebar remain fixed while the content scrolls.

## Accessibility

- The sidebar renders as `<nav aria-label="Primary">` (label overridable).
- The sidebar toggle is a button with `aria-expanded` reflecting the layout state and an accessible label describing the action ("Collapse sidebar" / "Expand sidebar").
- The product switcher, when present, is a button with `aria-haspopup="menu"` and `aria-expanded` reflecting the menu state.
- The logo-only fallback is either an anchor (when a home URL is provided) or a button, never a plain non-interactive element.
- Active nav items expose `aria-current="page"`; disabled nav items expose `aria-disabled="true"` and are removed from the tab order.
