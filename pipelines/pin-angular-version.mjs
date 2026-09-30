// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.

/**
 * Pins the Angular toolchain to a single major across the whole workspace, for
 * the Version Validation matrix in pipelines/release.yml.
 *
 * Why overrides rather than `pnpm add -D -w`: the Components package declares
 * Angular as peerDependencies, and pnpm resolves those into its own
 * Components/node_modules copy. Installing into the root workspace therefore
 * leaves two Angular versions in the tree — the builder runs the new one while
 * the specs import the old one, and every test fails with
 * "Need to call TestBed.initTestEnvironment() first". pnpm.overrides applies to
 * every package in the workspace, so there is exactly one Angular.
 *
 * The compiler also pins a narrow TypeScript range per major (20: >=5.8 <6.0,
 * 21: >=5.9 <6.1, 22: >=6.0 <6.1) and @angular/build pins vitest (20: ^3.1.1,
 * 21+: ^4.0.8), so both are passed in per matrix row.
 *
 * Usage: node pipelines/pin-angular-version.mjs <angularMajor> <ts> <vitest>
 */

import { readFileSync, writeFileSync } from 'node:fs';

const [angularMajor, tsRange, vitestRange] = process.argv.slice(2);

if (!angularMajor || !tsRange || !vitestRange) {
  console.error('Usage: node pipelines/pin-angular-version.mjs <angularMajor> <tsRange> <vitestRange>');
  process.exit(1);
}

const ANGULAR_PACKAGES = [
  '@angular/animations',
  '@angular/build',
  '@angular/cdk',
  '@angular/cli',
  '@angular/common',
  '@angular/compiler',
  '@angular/compiler-cli',
  '@angular/core',
  '@angular/forms',
  '@angular/platform-browser',
  '@angular/platform-browser-dynamic',
  '@angular/router',
  '@angular-devkit/build-angular',
  'ng-packagr'
];

const angularRange = `^${angularMajor}.0.0`;
const manifestPath = 'package.json';
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

manifest.pnpm ??= {};
manifest.pnpm.overrides = {
  ...manifest.pnpm.overrides,
  ...Object.fromEntries(ANGULAR_PACKAGES.map((name) => [name, angularRange])),
  typescript: tsRange,
  vitest: vitestRange,
  '@vitest/coverage-v8': vitestRange
};

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Pinned Angular ${angularRange}, TypeScript ${tsRange}, vitest ${vitestRange}`);
