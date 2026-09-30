# MultiSelect — Functional Requirements and Hints

## Directive trigger

The multi-select is opened by attaching a directive to any host element. The host element acts as the trigger: clicking it opens the panel in a floating overlay positioned relative to the trigger. Clicking the trigger again closes the multi-select.

## Overlay positioning

The default preferred position is bottom-start (the panel appears below and left-aligned with the trigger). When the preferred position does not fit within the viewport, the overlay automatically tries fallback positions, flipping the vertical side before the alignment: bottom-start → top-start → bottom-end → top-end. The preferred position is configurable by the consumer.

## Item selection

Clicking or pressing Enter/Space on a non-disabled item selects the item: it toggles the item's checked state and emits the updated selection. Unlike a menu, selecting an item does not close the panel — the overlay stays open so the user can toggle several items in one session. The panel closes through the trigger, an outside click, or Escape.

## Item content

Each item renders a leading checkbox indicator (the shared `iris-checkbox`, presentational only) reflecting its selected state. It shows its `label` as the main line. When an item also provides a `description`, it is displayed automatically as a second meta line beneath the label; when omitted, only the label is shown. Items may also render an optional leading icon between the checkbox and the label.

## Disabled items

Disabled items are not focusable and do not emit a selection event on click or keyboard activation.

## Search

The panel can optionally include a search input in its header, built on the shared `iris-text-input` with a leading magnifying-glass icon; it is toggleable on or off by the consumer and shown by default. When enabled, typing filters the visible options by label and by description (when present), and the search input receives focus when the panel opens.

## Footer actions

The panel can optionally include a footer, toggleable on or off by the consumer and shown by default. When enabled, the footer exposes `Clear` (deselects every option) and `Select all` (selects every non-disabled option) actions. Both emit the updated selection through the same output as individual item toggles.

## Width

The panel grows to fit its content within a minimum and maximum width. Labels that exceed the available width are clipped with an ellipsis.

## Open animation

When the panel appears, it plays a brief entrance animation. This gives users a clear visual cue that the overlay has opened. The animation is suppressed when the user prefers reduced motion.

## Accessibility

The trigger element carries `aria-haspopup="listbox"` at all times. When the panel is open, the trigger also carries `aria-expanded="true"` and `aria-controls` referencing the panel element. When the panel is closed, `aria-expanded` is `false` and `aria-controls` is removed. The panel uses `role="listbox"` with `aria-multiselectable="true"`, and each interactive item uses `role="option"` with `aria-selected` reflecting its checked state. Disabled items carry `aria-disabled="true"` and the native `disabled` attribute on their button, which removes them from keyboard navigation and conveys the disabled state to assistive technology.

Keyboard navigation:
- **ArrowDown / ArrowUp** — move focus to the next / previous focusable item.
- **Home / End** — move focus to the first / last focusable item.
- **Enter / Space** — toggle selection of the focused item; the panel stays open.
- **Escape** — closes the panel and returns focus to the trigger.
- **Tab** — moves focus normally to the next/previous element (default browser behaviour); it does not close the panel.
