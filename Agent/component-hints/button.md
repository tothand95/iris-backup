# Button — Functional Requirements and Hints

## Label text is slotted content

The visible button text is provided by the consumer as slotted content, not as a component property. This keeps the button composable — consumers can project plain text, formatted spans, or other inline elements as the label.

## Size override by a parent group

The `size` property must be two-way bindable. This allows `iris-button-group` to externally override the size of child buttons. Consumers using the button standalone are unaffected.

## Icon slots

Layout is derived from the icon inputs rather than a separate mode input: `leadingIconName` renders an icon before the label, `trailingIconName` after it, and either or both may be set. There is no layout enum to keep in sync, so an icon can never be silently dropped by a mismatched mode.

## Hidden-label accessible name

When `labelHidden` is set, the button has no visible text. The slotted label text must still be provided — it is visually hidden using the `iris-screen-reader-only` utility class so that screen readers can announce the button's purpose. Consumers must always slot a meaningful text description. Both icon slots still render in this state; the square sizing is a `min-width`, so two icons widen the button instead of overflowing it.
