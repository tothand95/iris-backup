# Stepper — Functional Requirements and Hints

## Purpose

The stepper communicates progress through an ordered, multi-step process. It renders a sequence of steps, each with an indicator and a label, highlights where the user is in the flow, and shows the selected step's content.

## API shape (template-driven, Material-style)

The stepper is **content-projection driven**, not DTO driven. The consumer declares one `<iris-step>` per step inside `<iris-stepper>`:

```html
<iris-stepper [(selectedIndex)]="index" orientation="horizontal">
  <iris-step label="Account" [irisStepControl]="accountForm">…content…</iris-step>
  <iris-step label="Profile" [irisStepControl]="profileForm">…content…</iris-step>
  <iris-step label="Review">…content…</iris-step>
</iris-stepper>
```

- **`iris-stepper`** — container. Inputs: `orientation` (`'horizontal'` default | `'vertical'`), `selectedIndex` (two-way `model`, default `0`), `linear` (boolean, default `false`). Queries its steps via `contentChildren(IrisStepComponent)`.
- **`iris-step`** — one step. Inputs: `label` (string), `irisStepControl` (`AbstractControl | null`, optional), `completed` (`boolean | null`, default `null`). Its projected content is captured as a `TemplateRef` and rendered by the parent only when the step is selected. `isComplete()` is a **method** (not a computed) resolving completion: explicit `completed` wins, else `irisStepControl.valid`, else `true`. It must stay a method because it reads the control's non-reactive `valid` flag — the parent re-evaluates it via `controlTick`.

There is **no** `StepDefinition` DTO and **no** `stepClicked` output. Selection is owned by `selectedIndex`; clicking a step header sets it.

## Visited memory

The stepper remembers which steps have been visited (selected at least once) in an internal `visitedIndices` signal, updated by an `effect` that watches `selectedIndex`. A step counts as **visited** only when its index is in `visitedIndices` — i.e. it has actually been landed on. Being merely earlier than the current step does **not** make a step visited: if the user jumps ahead (non-linear) or sets `selectedIndex` programmatically, the skipped earlier steps stay `waiting` until they are actually selected. This memory survives moving backwards, so a step you went forward to and then left stays "visited" even though it is now ahead of the current step.

Visited memory drives two behaviours:

- **Styling (non-linear and linear):** a visited step ahead of the current one resolves to `default`/`error`/`completed` (per its control) instead of `waiting`. Only never-visited steps show `waiting`.
- **Access (linear only):** any visited step is directly selectable, plus the single step immediately after the furthest step reached — gated on that furthest step being **complete** (see Linear mode).

## Linear mode

When `linear` is `true`, forward movement is restricted. A step is reachable when it is the current step or earlier (backwards is never restricted), a **previously visited** step, or the **step immediately after the furthest step reached** (`max(visitedIndices, selectedIndex) + 1`) — but only when that furthest step's `isComplete()` returns `true`. Everything else is unreachable. The frontier follows the furthest step reached, not the current step, so after moving backwards the user can still jump straight to the next unstarted step (once it unlocks).

**Completion gating.** A step controls whether the user may advance past it via `IrisStepComponent.isComplete()`: explicit `[completed]` boolean wins; otherwise the attached `irisStepControl`'s validity; otherwise `true`. This lets a step block progress **with or without** a form control — bind `[completed]="someCondition"` when there is no control. `canAccess` reads `steps()[frontier].isComplete()`, so an incomplete frontier step disables (and un-focuses) the next step.

- Unreachable steps get the native `disabled` attribute on their `<button>`, so they are non-focusable (skipped by keyboard) and ignore pointer/keyboard activation. They show a `not-allowed` cursor and reduced opacity (`--oi-opacity-content-disabled`).
- The reachability guard (`canAccess`) is enforced in both the view model (`disabled` flag on each `StepView`) and the `select()` method, so programmatic and DOM paths agree.
- `linear` defaults to `false`, in which case every step is freely selectable (though styling still reflects visited memory).

## Step status is derived, not set

The consumer never sets a step's visual state. The stepper resolves each step's `StepState` internally from the step's index relative to `selectedIndex`, the visited set, and its optional `irisStepControl`:

| Position | No control | Invalid control | Valid control |
| --- | --- | --- | --- |
| **Current** (`index === selectedIndex`) | `current` | `error-current` | `current` |
| **Visited** (in `visitedIndices` — actually selected at least once) | `default` | `error` | `completed` |
| **Not visited** (never selected, whether ahead of or behind the current step) | `waiting` | `waiting` | `waiting` |

- Never-visited steps never evaluate control validity — they are always `waiting`, even when the current step is ahead of them.
- `irisStepControl` accepts any Angular `AbstractControl` — a `FormGroup` (typically bundling that step's fields), a single `FormControl`, or a `FormArray`. The step's error/completed state is driven by the control's `invalid` flag; a `FormGroup` is `invalid` when any descendant control is invalid.

### Reactivity gotcha

`AbstractControl` is not a signal, so validity changes don't recompute an OnPush+signal computed on their own. The stepper subscribes to each attached control's `statusChanges` in an `effect` and bumps a private `controlTick` signal; the `stepViews` computed reads `controlTick()` to establish the dependency. Initial validity is read directly (statusChanges doesn't fire on subscribe). The effect uses `onCleanup` to unsubscribe when the step set changes.

## Orientation

- **Horizontal** — step headers sit in a `__header` flex row, distributed evenly; each header carries a top keyline (see below). No connectors between headers. The selected step's content renders below the header row in `__content`.
- **Vertical** — each step is an `__item` (header + inline content when selected + a short `__connector` to the next). Content indents to align under the label.

## Indicator

Every step renders a 16px circular indicator:

- **default / waiting** — white fill, neutral outline, showing the step's 1-based number.
- **current** — brand-blue fill, white number.
- **completed** — white fill, dark outline, a check glyph (no number).
- **error** (visited) — the `WarningCircle` icon in content-error (red), white background, no number.
- **error-current** — the `WarningCircle` icon rendered white on a red (`--oi-base-color-error`) filled disc, distinguishing the errored current step from a visited errored step.

The number is the step's position in the sequence (1, 2, 3 …), rendered in the monospace typeface (`--oi-font-family-code`).

## Horizontal top keyline

In horizontal layout each header has a top keyline spanning its width. The keyline is dark (content-primary) for `default`, `current`, `completed`, `error`, and `error-current`, and light grey (border-default) only for `waiting`. Reached steps read as one continuous dark line while future steps stay muted. The current step is distinguished by its filled indicator and bold label, not by the keyline.

## Label

- The label uses content-primary for `default`, `current`, `error`, and `error-current`, and content-secondary for `completed` and `waiting`.
- The label is bold (weight 600) only for pure `current` (an `error-current` label stays regular weight).
- Labels are truncated with an ellipsis when they exceed the available width.

## Content projection

Each `iris-step` wraps its content in an internal `<ng-template>` and exposes it as a required `viewChild(TemplateRef)`. The stepper renders the selected step's template with `ngTemplateOutlet`. Non-selected steps' content is not in the DOM.

## Accessibility

- The root is a `nav` labelled `Progress` (`aria-label="Progress"`).
- The button of the `current` and `error-current` step carries `aria-current="step"` so assistive technology can announce the active step.
- Indicator glyphs (check, `WarningCircle`) are decorative (`aria-hidden`); the step's meaning is conveyed by its label.
- Steps are reachable and activatable with the keyboard through native button semantics (Tab to move, Enter/Space to activate).
- In `linear` mode, unreachable steps are native `disabled` buttons — skipped by keyboard navigation and inert to activation.
