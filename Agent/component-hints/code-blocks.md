# Code Blocks — Functional Requirements and Hints

## Display modes

The component renders code in one of three modes, chosen by `type`:

- **`inline`** — a snippet rendered inline within surrounding prose (e.g. a command or variable inside a sentence). No copy button.
- **`single-line`** — a self-contained block for a single copyable command or URL, with a copy button.
- **`multi-line`** (default) — a block for multi-line code, with an optional line-number gutter and a copy button.

## Inline variants

The `variant` input applies to `inline` type only. `default` uses the tertiary background; `alt` uses the primary (white) background for use on tinted or shaded surfaces. It has no effect on block modes.

## Line numbers

For `multi-line`, `showLineNumbers` (default on) renders a leading gutter numbering each line from 1. The gutter and the code share the same monospace typography and line height so the numbers stay aligned with their code rows, including when the block wraps to many lines. The gutter is right-aligned, has its own trailing divider, and is presentational only.

## Copy behaviour

Single-line and multi-line blocks render a copy button. The component owns the clipboard write: clicking the button writes the current `code` to the clipboard via the Clipboard API and, only after the write resolves successfully, emits the `copied` output with the copied string. If the write is rejected (e.g. permissions or an insecure context), no event is emitted.

## Width

Block modes fit their content by default. Setting `fullWidth` stretches a single-line or multi-line block to fill its container instead; the copy button stays pinned to the trailing edge. `fullWidth` has no effect on `inline` type. Long lines that exceed the available width scroll horizontally within the block; the block never introduces a vertical scrollbar.

## Spacing

Block modes carry a small margin so they have breathing room from surrounding content. Single-line rows are vertically centred against the copy button; multi-line content is top-aligned.

## Accessibility

- The copy button carries `aria-label="Copy code"` so its purpose is conveyed to assistive technology.
- The line-number gutter is marked `aria-hidden` so numbers are not read as part of the code content.
- The block container is not focusable; only the copy button receives focus. Its focus ring (and hover background) render on the button itself, shown for keyboard focus via `:focus-visible`.
