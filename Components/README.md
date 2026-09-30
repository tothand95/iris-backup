# `@oneidentity/iris-ui`

One Identity's shared Angular component library. Built against Angular 20 and supported on
Angular 20, 21 and 22. Published to the One Identity Azure Artifacts feed.

---

## Installation

> **Internal package** — requires the One Identity Azure Artifacts registry.

Add the registry to your project's `.npmrc`:

```
@oneidentity:registry=https://pkgs.dev.azure.com/OneIdentity/_packaging/iris-ui/npm/registry/
```

Then install the package:

```bash
npm install @oneidentity/iris-ui
```

### Peer dependencies

| Package | Version | Required |
|---|---|---|
| `@angular/core` | `^20.0.0 \|\| ^21.0.0 \|\| ^22.0.0` | Yes |
| `@angular/common` | `^20.0.0 \|\| ^21.0.0 \|\| ^22.0.0` | Yes |
| `@angular/forms` | `^20.0.0 \|\| ^21.0.0 \|\| ^22.0.0` | Yes |
| `@angular/platform-browser` | `^20.0.0 \|\| ^21.0.0 \|\| ^22.0.0` | Yes |
| `@angular/router` | `^20.0.0 \|\| ^21.0.0 \|\| ^22.0.0` | Yes |
| `rxjs` | `^7.4.0` | Yes |
| `@angular/cdk` | `^20.0.0 \|\| ^21.0.0 \|\| ^22.0.0` | Yes |
| `@oneidentity/iris-ui-tokens` | `^0.1.2` | Yes |
| `ag-grid-angular` | `^35.0.0` | Only for `@oneidentity/iris-ui/table` |
| `ag-grid-community` | `^35.0.0` | Only for `@oneidentity/iris-ui/table` |

`@angular/forms`, `@angular/platform-browser`, `@angular/router` and `rxjs` are installed by
`ng new`, so most applications already satisfy them. They are declared so the versions are
actually enforced and so strict resolvers (Yarn PnP, pnpm without hoisting) can resolve the
library's imports.

`@angular/cdk` and `@oneidentity/iris-ui-tokens` are **not** part of a default Angular
application and must be installed explicitly.

---

## Versioning and Angular support

Iris UI is versioned **independently of Angular**. The package major reflects breaking changes to
the Iris public API — it is not an Angular version marker.

| Question | Answer |
|---|---|
| Which Angular versions does a release support? | Exactly those allowed by the `@angular/*` peer range above — nothing else. |
| Does an Angular 22 app need an `iris-ui@22`? | No. A single Iris release supports every Angular major in its peer range. |
| What does an Iris major bump mean? | A breaking change to Iris's own API, unrelated to Angular. |
| Are all supported majors actually tested? | Yes — CI builds and runs the full test suite against each one before anything is published. |

Angular majors are added to the peer range one at a time, and only after CI is green against that
major.

> **Version reset.** Preview builds before `1.0.0` were numbered `20.0.0-preview.<build>`. That
> `20` was inherited from the project bootstrap and wrongly implied lockstep with Angular 20. It
> has been reset to `1.0.0`. If you pinned a `20.0.0-preview.*` version, move to `^1.0.0`.

---

## Entry points

| Entry point | Contents |
|---|---|
| `@oneidentity/iris-ui` | All components and patterns. No AG Grid dependency. |
| `@oneidentity/iris-ui/i18n` | The accessibility label map and `provideIrisUiLocalization`. See [Accessibility labels](#accessibility-labels). |
| `@oneidentity/iris-ui/table` | `irisTheme` plus the AG Grid module registration. Grid types and components come from AG Grid directly. |
| `@oneidentity/iris-ui/iris-ui.css` | Global stylesheet: fonts, design tokens and base resets. Also published at the package root as `iris-ui.css`. |

The Table lives in its own entry point so that AG Grid stays out of the root module graph.
Applications that never render a table do not resolve or bundle it, which keeps the AG Grid
peers genuinely optional.

---

## Usage

Import the components you need directly — tree-shaking is fully supported:

```ts
import { IrisTaskComponent } from '@oneidentity/iris-ui';

@Component({
  imports: [IrisTaskComponent],
  template: `<iris-task [task]="myTask" />`,
})
export class MyComponent { ... }
```

### Theming

Add the library stylesheet to the `styles` array in your `angular.json`:

```json
// angular.json
"styles": ["node_modules/@oneidentity/iris-ui/iris-ui.css"]
```

It can also be referenced by specifier, e.g. from a global stylesheet:

```css
@import '@oneidentity/iris-ui/iris-ui.css';
```

Then add a theme class to your application's `<body>` element:

```html
<body class="theme-light">
  <!-- or theme-dark / theme-hc-light / theme-hc-dark -->
</body>
```

#### Supplementary token access

`iris-ui.css` is the **only** supported entry point for the fonts — it imports the eight
`@fontsource` stylesheets as well as every design token. The `@oneidentity/iris-ui-tokens`
partials are an *addition* to it, never a replacement: they contain no `@font-face` rules, so a
token-only setup renders with `--oi-font-family-default` silently falling back to `system-ui`.
A correct setup emits 8 `woff2` files into the build output; a token-only setup emits none,
which is the quickest way to tell the two apart.

To use raw token values in your own SCSS, import the barrel:

```scss
@use '@oneidentity/iris-ui-tokens/dist/tokens' as tokens;
```

Importing the individual partials directly does **not** work — all seven share the basename
`tokens`, so Sass rejects the second one with `There's already a module with namespace "tokens"`.
Use the barrel above, or give every partial an explicit alias.

---

## Accessibility labels

Every built-in accessibility string (`aria-label`, screen-reader announcement, and the visible
`Previous`/`Next` pagination text) resolves through a single injectable label map, published as
the `@oneidentity/iris-ui/i18n` entry point. Configure it once at bootstrap:

```ts
import { provideIrisUiLocalization } from '@oneidentity/iris-ui/i18n';

bootstrapApplication(AppComponent, {
  providers: [
    provideIrisUiLocalization({
      labels: {
        'toast.dismiss': 'Schließen',
        'modal.close': 'Schließen',
        'pagination.previous': 'Zurück',
        'pagination.next': 'Weiter',
      },
    }),
  ],
});
```

The map is `IrisLabelConfig` — every key is optional and autocompletes, so nothing is mandatory
and new keys added by future Iris versions never break your build. Unset keys fall back to the
built-in English defaults. Each value may be a plain string or a `Signal<string>`.

### Recommended: bind to your i18n library

For a multi-language app, supply signals — a runtime language switch then re-renders every
affected component, including overlays already on screen, without recreating providers.

With Transloco:

```ts
import { provideIrisUiLocalization } from '@oneidentity/iris-ui/i18n';
import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';

bootstrapApplication(AppComponent, {
  providers: [
    provideIrisUiLocalization(() => {
      const t = inject(TranslocoService);
      const key = (id: string) => toSignal(t.selectTranslate(id), { initialValue: '' });

      return {
        labels: {
          'toast.dismiss': key('iris.toast.dismiss'),
          'modal.close': key('iris.modal.close'),
          'pagination.previous': key('iris.pagination.previous'),
          'pagination.next': key('iris.pagination.next'),
        },
      };
    }),
  ],
});
```

Pass a **factory** rather than a plain object whenever the labels come from another service: the
factory runs inside an injection context, so `inject()` works. A plain object is fine for
hard-coded strings.

Because the whole map is driven by `selectTranslate`, adding a language is a JSON file, not a
code change.

### Parameterised labels

Announcement labels are functions, so word order and separator stay translatable rather than
being concatenated in the template:

```ts
provideIrisUiLocalization({
  labels: {
    'toast.announcement': (type: string, title: string) => `${type} – ${title}`,
  },
});
```

Wrap it in a `signal(...)` — or a `computed(...)` reading your translation — if it must change
with the language.

### Per-instance overrides

Components that previously had an English default `*AriaLabel` input still accept one. Set it
only when a single instance needs a different string; leaving it unset uses the application
label. Truly per-instance labels (`tabs.ariaLabel`, `tree.ariaLabel`, `popover.ariaLabel`,
radio-group, button-group) are not part of the map — they describe your
content, not the widget.

### Enforcing exhaustiveness

Opt in on your side if you want a compile error whenever Iris adds a key:

```ts
import type { IrisLabelKey } from '@oneidentity/iris-ui/i18n';

const LABEL_IDS = {
  'toast.dismiss': 'iris.toast.dismiss',
  // …
} satisfies Record<IrisLabelKey, string>;
```


---

## Development

### Prerequisites

- Node.js 22+
- npm 11+
- Angular CLI 20: `npm install -g @angular/cli@20`

### Setup

```bash
git clone https://github.com/oi-eng/iris-ui.git
cd iris-ui
npm install
```

### Commands

| Command | Description |
|---|---|
| `pnpm run storybook:start` | Start Storybook dev server at `localhost:6006` |
| `pnpm test` | Run Vitest unit tests |
| `pnpm run lint` | ESLint + Prettier check |
| `pnpm run lint:autofix` | Auto-fix lint and formatting issues |
| `pnpm run components:build` | Build library → `Components/dist/` |
| `pnpm run storybook:build` | Build static Storybook → `Storybook/dist/` |

---

## Adding a Component

1. **Generate the files** inside `Components/src/lib/`:
   ```
   <name>/
   ├── <name>.component.ts
   ├── <name>.component.html
   ├── <name>.component.scss
   ├── <name>.component.spec.ts
   └── <name>.model.ts        ← interfaces/types
   ```

2. **Follow conventions** (see `Agent/AGENTS.md` for the full ruleset):
   - Standalone component, `OnPush` change detection
   - Selector prefix `iris-`, class prefix `Iris`
   - `@if` / `@for` control flow — never `*ngIf` / `*ngFor`
   - All colours, spacing and radii from CSS custom property tokens (`--oi-*`)
   - No hardcoded values

3. **Export through the public API** — add to `Components/src/public-api.ts`:
   ```ts
   export * from './lib/<name>/<name>.model';
   export * from './lib/<name>/<name>.component';
   ```

4. **Add a Storybook story** at `Storybook/<name>/<name>.stories.ts`.
   See `Storybook/README.md` for the wrapper pattern required by interactive OnPush components.

---

## Publishing

The package publishes to the One Identity Azure Artifacts feed. Publishing is performed by
the CI/CD pipeline — do not run `npm publish` manually.

Build the library before publishing:

```bash
ng build iris-ui
# output: Components/dist/
```

---

## Tech Stack

Versions the library is **developed and built** with. Angular 21 and 22 are additionally built
and tested in CI before every publish — see [Versioning and Angular support](#versioning-and-angular-support)
for what is actually supported at runtime.

| Tool | Version |
|---|---|
| Angular | 20 |
| Angular CLI | 20 |
| TypeScript | 5.8 |
| Storybook | 10 |
| Vitest | 3 |
| ng-packagr | 20 |
| ESLint | 9 |
| Prettier | 3 |
