// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
//
// Replaces pnpm `workspace:` protocol specifiers in a built package manifest with
// the real versions of the workspace packages.
//
// ng-packagr copies `dependencies` and `peerDependencies` verbatim into the dist
// manifest, and the release pipeline publishes that directory with `npm publish`.
// Neither step understands `workspace:*`, so without this rewrite the published
// package declares requirements no package manager can resolve.
//
// Usage: node pipelines/resolve-workspace-protocol.mjs <path-to-package.json>

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DEP_FIELDS = ['dependencies', 'peerDependencies', 'optionalDependencies'];

const target = process.argv[2];
if (!target) {
  console.error('usage: node pipelines/resolve-workspace-protocol.mjs <path-to-package.json>');
  process.exit(1);
}

/** Package directories listed in pnpm-workspace.yaml (simple `- 'Name'` entries). */
function workspaceDirs() {
  const yaml = readFileSync(join(ROOT, 'pnpm-workspace.yaml'), 'utf8');
  return yaml
    .split('\n')
    .map((line) => line.match(/^\s*-\s*['"]?([^'"#]+?)['"]?\s*$/))
    .filter((match) => match !== null)
    .map((match) => match[1]);
}

const versions = new Map();
for (const dir of workspaceDirs()) {
  try {
    const pkg = JSON.parse(readFileSync(join(ROOT, dir, 'package.json'), 'utf8'));
    if (pkg.name && pkg.version) versions.set(pkg.name, pkg.version);
  } catch {
    // Directory is not a package; pnpm tolerates this, so we do too.
  }
}

const manifest = JSON.parse(readFileSync(target, 'utf8'));
const rewritten = [];

for (const field of DEP_FIELDS) {
  const deps = manifest[field];
  if (!deps) continue;

  for (const [name, range] of Object.entries(deps)) {
    if (typeof range !== 'string' || !range.startsWith('workspace:')) continue;

    const version = versions.get(name);
    if (!version) {
      console.error(`${name}: "${range}" in ${field}, but no workspace package provides it.`);
      process.exit(1);
    }

    // workspace:* pins the exact version; workspace:^ and workspace:~ keep their range operator.
    const suffix = range.slice('workspace:'.length);
    const resolved = suffix === '^' || suffix === '~' ? `${suffix}${version}` : version;

    deps[name] = resolved;
    rewritten.push(`  ${field}.${name}: ${range} -> ${resolved}`);
  }
}

if (rewritten.length === 0) {
  console.log('No workspace: specifiers found; manifest left unchanged.');
} else {
  writeFileSync(target, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Resolved workspace: specifiers in ${target}`);
  console.log(rewritten.join('\n'));
}
