# Changelog

All notable changes to `@oneidentity/iris-ui-tokens` are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this package adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-09-29

Packaging only. No tokens changed, so upgrading from 1.0.0 is safe and requires no work.

### Added

- `CHANGELOG.md` now ships inside the published package, so the release history is available from `node_modules`
  without visiting the repository.

## [1.0.0] - 2026-09-28

First stable release. Previously published as `0.1.2`.

### Changed

- Promoted to 1.0.0 so the token set carries a stable version alongside `@oneidentity/iris-ui`. Package versions are
  independent from here: a release of one package does not imply a release of the others.

### Notes

- Ships the design tokens generated from the Figma variable export, as CSS custom properties (`--oi-*`) and as SCSS
  sources.
- Four themes: `theme-light`, `theme-dark`, `theme-hc-light`, `theme-hc-dark`. Activate one by putting the class on a
  root element.
- Seven SCSS partials — primitives, typography, the four themes, and custom — re-exported through the
  `dist/tokens` barrel. Import the barrel rather than the partials: they share the `tokens` basename, so importing two
  directly fails with `There's already a module with namespace "tokens"`.
- Consumed automatically through `@oneidentity/iris-ui/iris-ui.css`. Import the SCSS sources only when you need raw token
  values in your own stylesheets.

[1.0.1]: https://github.com/oi-eng/iris-ui/releases/tag/iris-ui-tokens%401.0.1
[1.0.0]: https://github.com/oi-eng/iris-ui/releases/tag/iris-ui-tokens%401.0.0
