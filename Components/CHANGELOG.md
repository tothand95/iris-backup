# Changelog

All notable changes to `@oneidentity/iris-ui` are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this package adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-09-29

Documentation and packaging only. No component behaviour changed; upgrading from 1.0.0 needs no work.

The package is now self-documenting: API reference, usage rules and release history all ship in the tarball, so
Storybook and repository access are no longer needed to work with Iris UI.

### Added

- `api/component-registry.json` — all 53 entries with inputs (type, default, required, options), outputs, slots and
  composition relations. Generated from the sources at build time, so it always matches the installed version, and it
  records what the type declarations cannot: defaults, parent/child requirements, and descriptions.
- `api/USAGE.md` — entry points, theming, accessibility labelling and common pitfalls. Point an AI agent at
  `node_modules/@oneidentity/iris-ui/api/USAGE.md`.
- `CHANGELOG.md` now ships in the package.
- Class-level documentation for the 14 components that had none.

## [1.0.0] - 2026-09-28

First stable release. Published to the One Identity Azure Artifacts feed.

### Added

- 46 standalone components and layout patterns, exported from the package root.
- `@oneidentity/iris-ui/i18n` entry point: `provideIrisUiLocalization()` replaces every built-in accessibility label in one
  place. Labels accept plain strings or signals, so they can follow the active language at runtime.
- `@oneidentity/iris-ui/table` entry point: the `irisTheme` AG Grid theme. `ag-grid-angular` and `ag-grid-community` are
  optional peers, so an application that does not use the Table never installs them.
- `iris-ui.css`, the single stylesheet that loads the fonts and registers every `--oi-*` design token.

### Changed

- **Versioning is no longer tied to Angular.** The previous `20.x` preview versioning mirrored Angular 20, which misrepresented
  compatibility: the package supports Angular 20, 21 and 22. Iris UI now has its own version line, starting at 1.0.0.

### Deprecated

- The entire `20.0.0-preview.*` line. It receives no further updates. Move to 1.0.0.

### Notes

- Components are standalone and zoneless-ready: signals and `OnPush` throughout, with no dependency on `zone.js`.
- Requires `@angular/cdk` and `rxjs ^7.4.0`. Supports Angular 20, 21 and 22.
- Every component is still marked **Preview** in Storybook. The API is stable enough to depend on, but individual
  components may change before they are promoted to Stable following UX validation.

[1.0.1]: https://github.com/oi-eng/iris-ui/releases/tag/iris-ui%401.0.1
[1.0.0]: https://github.com/oi-eng/iris-ui/releases/tag/iris-ui%401.0.0
