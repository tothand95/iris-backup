<!-- Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED. -->

# @oneidentity/iris-ui — AI usage guide

> One Identity's Angular component library. Standalone, signal-based components published to the One Identity Azure Artifacts feed.

## How to use this guide

`component-registry.json` in this folder is the source of truth for the component API. It is generated from the component
sources at build time, so it always matches the installed version. Read it for selectors, inputs, defaults, variant values,
outputs, two-way bindable inputs, content slots, and which components nest inside which.

This file holds only what the registry cannot express: how to install and theme the library, and the rules that govern how its
API is meant to be used. It never lists individual components.

## Quick start

### Install

```bash
npm install @oneidentity/iris-ui @oneidentity/iris-ui-tokens @angular/cdk
```

`@angular/cdk` is a required peer. The popover, menu, and tooltip components are built on its overlay.
`@oneidentity/iris-ui-tokens` supplies the design tokens. The supported Angular range is in `peerDependencies`. Release
history is in `CHANGELOG.md`.

The Table needs the AG Grid peers. They resolve only through `@oneidentity/iris-ui/table`. Apps without a Table never
install them.

```bash
npm install ag-grid-angular ag-grid-community
```

```ts
import { irisTheme } from '@oneidentity/iris-ui/table';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridOptions } from 'ag-grid-community';
```

### Stylesheet (required)

Add `iris-ui.css` to the `styles` array in `angular.json`. It loads the fonts, registers every design token, and applies the
base resets and global typography.

```json
// angular.json
"styles": ["node_modules/@oneidentity/iris-ui/iris-ui.css"]
```

It can also be pulled in by specifier from a global stylesheet. This works in plain CSS only, not SCSS.

```css
@import '@oneidentity/iris-ui/iris-ui.css';
```

> `iris-ui.css` is the only supported entry point for the fonts. No other file imports the `@fontsource` stylesheets, and the
> token partials carry no `@font-face` rules. Skipping it does not error. The app renders with `--oi-font-family-default`
> silently falling back to `system-ui`.

### Theme (required)

Put one of the four theme classes on the root element. Components adapt automatically.

```html
<!-- index.html -->
<body class="theme-light">
  <!-- or theme-dark / theme-hc-light / theme-hc-dark -->
</body>
```

Every `--oi-*` token is then readable anywhere in the app.

```css
.my-element {
  color: var(--oi-content-color-primary);
  background: var(--oi-background-color-secondary);
  border-radius: var(--oi-border-radius-default);
}
```

### Token values in SCSS

Read tokens as `var(--oi-*)`. No import is needed.

```scss
.my-element {
  color: var(--oi-content-color-primary);
}
```

`@oneidentity/iris-ui` ships no SCSS, only the compiled `iris-ui.css`. The SCSS lives in `@oneidentity/iris-ui-tokens`. Every
token group ships twice there, as a `.scss` partial and as a `.css` file. The two forms carry identical content.

The partials expose no Sass API. There are no `$` variables, maps, functions, or mixins. Each is a block of custom property
declarations with a `.scss` extension, so tokens cannot feed compile-time Sass math or colour functions.

Use the partials only when a stylesheet must register the custom properties itself, such as a shadow root or a bundle that
never loads `iris-ui.css`. Let the compiler resolve the package, then import the barrel.

```json
// angular.json
"stylePreprocessorOptions": { "includePaths": ["node_modules"] }
```

```scss
@use '@oneidentity/iris-ui-tokens/dist/tokens' as tokens;
```

> `@use`-ing the barrel emits roughly 23 kB of CSS into the consuming file. A component-scoped stylesheet repeats the whole
> token set per component. Import it once globally, or not at all.

The barrel is `dist/_tokens.scss`. It forwards all seven partials: `primitives`, `typography`, the four themes, and `custom`.
Importing two partials directly fails — they share the basename `tokens`, so Sass rejects the second with
`There's already a module with namespace "tokens"`. One partial is fine if aliased.

```scss
@use '@oneidentity/iris-ui-tokens/dist/_tokens.primitives' as *;
```

Check contrast in all four themes when building from primitives.

### Component usage

Components are standalone. Import the class, use its `iris-*` selector.

```ts
import { IrisButtonComponent } from '@oneidentity/iris-ui';

@Component({
  imports: [IrisButtonComponent],
  template: `<iris-button variant="primary" (click)="save()">Save</iris-button>`
})
export class MyComponent {}
```

## Critical rules

1. **Standalone imports, not modules.** Add each `Iris*Component`/`Iris*Directive` to your `imports` array. There is no `IrisUiModule`.
1. **Use the `iris-*` selector** in templates (`<iris-button>`), never the class name.
1. **Inputs are signals.** Bind dynamic values with `[input]="expr"`. Pass static values as attributes (`variant="primary"`).
1. **Two-way bind `model()` inputs** with `[(input)]`, for example `<iris-toggle [(checked)]="enabled" />`. The registry marks them `bindable`.
1. **Outputs** are subscribed with `(event)="handler($event)"`.
1. **A bracketed selector is an attribute directive.** Put it on your own trigger element, as in `<button [irisTooltip]="text">`.
1. **Overlay panels are internal.** Components such as `iris-tooltip`, `iris-popover`, and `iris-menu` are rendered by their directive. Never place them in a template yourself.
1. **Footer marker directives go on an `<ng-template>`**, not on a trigger. They take no inputs and project a footer into an overlay.
1. **Theme with tokens, never hardcoded colors.** Styling comes from `iris-ui.css` and the active `theme-*` class.
1. **Icons** render with `iris-icon` using names from `@oneidentity/iris-ui-icons`.
1. **Accessibility strings** are set once at bootstrap with `provideIrisUiLocalization` from `@oneidentity/iris-ui/i18n`.

## Entry points

| Import | Contents |
| --- | --- |
| `@oneidentity/iris-ui` | All components, directives, and patterns. No AG Grid dependency. |
| `@oneidentity/iris-ui/table` | `irisTheme` + AG Grid module registration (needs `ag-grid-angular`/`ag-grid-community`). |
| `@oneidentity/iris-ui/i18n` | The accessibility label map and `provideIrisUiLocalization`. |
| `@oneidentity/iris-ui/iris-ui.css` | Global stylesheet: fonts, design tokens, base resets, global typography. |
| `@oneidentity/iris-ui-tokens/dist/tokens` | SCSS barrel forwarding the seven token partials, for `@use` in your own Sass. |
| `@oneidentity/iris-ui-tokens/dist/tokens.css` | The same tokens as plain CSS. Already pulled in by `iris-ui.css`. |

## Accessibility labels

Built-in `aria-label`s, screen-reader announcements, and pagination text resolve through one injectable label map. Set it once
at bootstrap. Every key is optional and falls back to English.

```ts
import { provideIrisUiLocalization } from '@oneidentity/iris-ui/i18n';

bootstrapApplication(AppComponent, {
  providers: [
    provideIrisUiLocalization({
      labels: { 'modal.close': 'Schließen', 'pagination.next': 'Weiter' }
    })
  ]
});
```

## Registry file

`component-registry.json` is the generated API description. Each component entry carries its `selector`, `className`,
`description`, `inputs` (with `type`, `default`, `required`, `bindable`), `outputs`, `slots`, and its composition relations.

Composition tells you what may nest inside what. `contains` lists the child selectors a component projects. `parent` names
the component it belongs inside, with `required` telling you whether that nesting is mandatory. Honour both when composing a
template.

The registry describes the API exactly. It carries no usage examples, so build markup from the selector, the `inputs` entry
for each attribute you set, and the composition relations.
