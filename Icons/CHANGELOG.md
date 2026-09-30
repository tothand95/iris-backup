# Changelog

All notable changes to `@oneidentity/iris-ui-icons` are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this package adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-09-29

Packaging only. No icons were added, removed or redrawn, so upgrading from 1.0.0 is safe and requires no work.

### Added

- `CHANGELOG.md` now ships inside the published package, so the release history is available from `node_modules`
  without visiting the repository.

## [1.0.0] - 2026-09-28

First stable release. Previously published as `0.1.1`.

### Changed

- Promoted to 1.0.0 so the icon library carries a stable version alongside `@oneidentity/iris-ui`. Package versions are
  independent from here: a release of one package does not imply a release of the others.

### Notes

- 1,513 icons, each exported as an optimised inline SVG with its name and category.
- `IconName` is a union of every icon name, so an unknown icon is a compile error rather than a blank space at runtime.
- Ships as a dependency of `@oneidentity/iris-ui`, which pins it exactly. Consumers receive it transitively and do not
  need to install it themselves.

[1.0.1]: https://github.com/oi-eng/iris-ui/releases/tag/iris-ui-icons%401.0.1
[1.0.0]: https://github.com/oi-eng/iris-ui/releases/tag/iris-ui-icons%401.0.0
