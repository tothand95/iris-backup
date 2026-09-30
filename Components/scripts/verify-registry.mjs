// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
// Publish guard: fails when the registry inside Components/dist does not match the one the generator produces from the
// current sources. Building with `ng build iris-ui` directly skips codegen, so dist can otherwise carry a stale registry —
// or none at all — without any error. Run: pnpm --filter @oneidentity/iris-ui verify:registry
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const sourceRegistry = join(repoRoot, 'Components', 'api', 'component-registry.json');
const distRegistry = join(repoRoot, 'Components', 'dist', 'api', 'component-registry.json');

const fail = (reason) => {
  console.error(`Registry verification failed: ${reason}\nRun \`pnpm run components:build\` and publish from that output.`);
  process.exit(1);
};

if (!existsSync(sourceRegistry)) fail('no generated registry found — codegen has not run');
if (!existsSync(distRegistry)) fail('Components/dist/api/component-registry.json is missing');

const source = readFileSync(sourceRegistry, 'utf8');
const dist = readFileSync(distRegistry, 'utf8');
if (source !== dist) fail('the registry in Components/dist is stale');

console.log(`Registry verified: ${JSON.parse(dist).componentCount} components match the current sources.`);
