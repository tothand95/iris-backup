// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
// AI/agent registry generator: statically parses Angular signal components (primary
// + secondary entry points), their union variants, content-projection slots and
// composition relations, and emits Components/api/component-registry.json.
// Zero new dependencies — uses the repo's existing `typescript` package. Run: pnpm --filter @oneidentity/iris-ui codegen:registry
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
// Primary entry point plus the secondary entry points (table, i18n). Scanning the primary source root rather than an
// enumerated subfolder keeps a new top-level folder (patterns, and anything added later) in the registry automatically.
const libDirs = [join(repoRoot, 'Components', 'src'), join(repoRoot, 'Components', 'table', 'src'), join(repoRoot, 'Components', 'i18n', 'src')];
const outDir = join(repoRoot, 'Components', 'api');

/** Recursively collect every file under `dir` in a single traversal. */
function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

// Walk each root once, then filter the cached file lists by suffix.
const libFiles = libDirs.flatMap((dir) => walk(dir));
const filesEndingWith = (files, suffix) => files.filter((f) => f.endsWith(suffix));

function parse(file) {
  return ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
}

/** Normalize a TS JSDoc comment (string | node array) to a single-line string. */
function jsDocText(node) {
  const doc = node.jsDoc?.at(-1)?.comment;
  if (!doc) return undefined;
  const text = typeof doc === 'string' ? doc : doc.map((p) => p.text ?? '').join('');
  // Keep the leading summary only. A JSDoc body may continue into fenced usage examples, which collapse into unreadable noise on one line.
  const summary = text.split('```')[0].split(/\r?\n\s*\r?\n/)[0];
  return summary.replace(/\s+/g, ' ').trim() || undefined;
}

// ── Union-type alias map (from *.model.ts) ────────────────────────────────────
// name -> string-literal options, so `input<ButtonStyle>(...)` can list variants.
const aliasOptions = new Map();
for (const file of filesEndingWith(libFiles, '.model.ts')) {
  const sf = parse(file);
  sf.forEachChild((node) => {
    if (!ts.isTypeAliasDeclaration(node)) return;
    const { options, pure } = stringLiteralsOf(node.type);
    if (options.length && pure) aliasOptions.set(node.name.text, options);
  });
}

/**
 * Return the string-literal members of a union/literal type node.
 * `pure` is false when a non-string-literal member (e.g. a type reference) is present,
 * so callers can avoid emitting a misleading partial `options` list.
 */
function stringLiteralsOf(typeNode) {
  const out = [];
  let pure = true;
  const visit = (t) => {
    if (ts.isUnionTypeNode(t)) t.types.forEach(visit);
    else if (ts.isLiteralTypeNode(t) && ts.isStringLiteral(t.literal)) out.push(t.literal.text);
    else pure = false;
  };
  visit(typeNode);
  return { options: out, pure };
}

/** Describe an input's type: prefer enumerated options when known. */
function describeType(typeNode, defaultText) {
  if (typeNode) {
    const inline = stringLiteralsOf(typeNode);
    if (inline.options.length && inline.pure) return { type: typeNode.getText(), options: inline.options };
    if (ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName)) {
      const name = typeNode.typeName.text;
      const options = aliasOptions.get(name);
      return options ? { type: name, options } : { type: typeNode.getText() };
    }
    return { type: typeNode.getText() };
  }
  // No generic: infer a coarse type from the default literal.
  if (defaultText === 'true' || defaultText === 'false') return { type: 'boolean' };
  if (defaultText && /^['"`]/.test(defaultText)) return { type: 'string' };
  if (defaultText && /^-?\d/.test(defaultText)) return { type: 'number' };
  return { type: 'unknown' };
}

function isPublic(member) {
  const mods = ts.getModifiers?.(member) ?? member.modifiers ?? [];
  return !mods.some((m) => m.kind === ts.SyntaxKind.PrivateKeyword || m.kind === ts.SyntaxKind.ProtectedKeyword);
}

/** Identify a signal-primitive initializer: input/input.required/model/output. */
function signalCall(init) {
  if (!init || !ts.isCallExpression(init)) return undefined;
  const callee = init.expression;
  if (ts.isIdentifier(callee)) {
    if (callee.text === 'input') return { kind: 'input', call: init };
    if (callee.text === 'model') return { kind: 'model', call: init };
    if (callee.text === 'output') return { kind: 'output', call: init };
  }
  if (
    ts.isPropertyAccessExpression(callee) &&
    ts.isIdentifier(callee.expression) &&
    callee.expression.text === 'input' &&
    callee.name.text === 'required'
  ) {
    return { kind: 'input', call: init, required: true };
  }
  return undefined;
}

// ── Component discovery + API extraction ──────────────────────────────────────
/** Resolve a component's template text from its decorator (inline or templateUrl). */
function templateOf(meta, componentFile) {
  for (const prop of meta.properties) {
    if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name)) continue;
    if (prop.name.text === 'template' && ts.isStringLiteralLike(prop.initializer)) return prop.initializer.text;
    if (prop.name.text === 'templateUrl' && ts.isStringLiteralLike(prop.initializer)) {
      const file = join(dirname(componentFile), prop.initializer.text);
      if (existsSync(file)) return readFileSync(file, 'utf8');
    }
  }
  return '';
}

/** Extract content-projection slots (`<ng-content select="...">`) from a template. */
function slotsOf(template) {
  const slots = [];
  const seen = new Set();
  for (const match of template.matchAll(/<ng-content\b([^>]*)>/g)) {
    const select = match[1].match(/select\s*=\s*["']([^"']+)["']/);
    const key = select ? select[1] : 'default';
    if (seen.has(key)) continue;
    seen.add(key);
    slots.push(select ? { select: select[1] } : { select: 'default' });
  }
  return slots;
}

/** Name of a decorator call (`@Component(...)` -> 'Component'), else undefined. */
function decoratorName(d) {
  return ts.isCallExpression(d.expression) && ts.isIdentifier(d.expression.expression) ? d.expression.expression.text : undefined;
}

/** Class names queried with `contentChildren()`/`contentChild()` — the components this one expects to be projected into it. */
function contentChildClasses(node) {
  const found = new Set();
  for (const member of node.members) {
    if (!ts.isPropertyDeclaration(member) || !member.initializer || !ts.isCallExpression(member.initializer)) continue;
    const call = member.initializer;
    if (!ts.isIdentifier(call.expression) || (call.expression.text !== 'contentChildren' && call.expression.text !== 'contentChild')) continue;
    const arg = call.arguments[0];
    if (arg && ts.isIdentifier(arg)) found.add(arg.text);
  }
  return [...found];
}

/** Injection tokens a class consumes, with whether the injection is optional. A token provided by another component implies a parent. */
function injectedTokens(node) {
  const found = [];
  const visit = (n) => {
    if (
      ts.isCallExpression(n) &&
      ts.isIdentifier(n.expression) &&
      n.expression.text === 'inject' &&
      n.arguments[0] &&
      ts.isIdentifier(n.arguments[0])
    ) {
      const options = n.arguments[1];
      const optional = Boolean(
        options &&
        ts.isObjectLiteralExpression(options) &&
        options.properties.some(
          (p) =>
            ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === 'optional' && p.initializer.kind === ts.SyntaxKind.TrueKeyword
        )
      );
      found.push({ token: n.arguments[0].text, optional });
    }
    n.forEachChild(visit);
  };
  node.forEachChild(visit);
  return found;
}

/** Tokens a component registers itself under via `providers: [{ provide: TOKEN, useExisting: ... }]`. */
function providedTokens(meta) {
  const found = [];
  for (const prop of meta.properties) {
    if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name) || prop.name.text !== 'providers') continue;
    if (!ts.isArrayLiteralExpression(prop.initializer)) continue;
    for (const entry of prop.initializer.elements) {
      if (!ts.isObjectLiteralExpression(entry)) continue;
      let token;
      let selfReferential = false;
      for (const p of entry.properties) {
        if (!ts.isPropertyAssignment(p) || !ts.isIdentifier(p.name)) continue;
        if (p.name.text === 'provide' && ts.isIdentifier(p.initializer)) token = p.initializer.text;
        if (p.name.text === 'useExisting') selfReferential = true;
      }
      if (token && selfReferential) found.push(token);
    }
  }
  return found;
}

const components = [];
// Class-name keyed relation data, resolved to selectors once every component is known.
const providesByClass = new Map();
const injectsByClass = new Map();
const childrenByClass = new Map();
// Directives (`.directive.ts`) carry public API too (e.g. `[irisTooltip]`), so scan both.
for (const file of [...filesEndingWith(libFiles, '.component.ts'), ...filesEndingWith(libFiles, '.directive.ts')]) {
  const sf = parse(file);
  sf.forEachChild((node) => {
    if (!ts.isClassDeclaration(node) || !node.name) return;
    const decorators = ts.getDecorators?.(node) ?? [];
    const classDec = decorators.find((d) => decoratorName(d) === 'Component' || decoratorName(d) === 'Directive');
    if (!classDec) return;
    const isDirective = decoratorName(classDec) === 'Directive';

    const meta = classDec.expression.arguments[0];
    let selector;
    let standalone = true;
    let slots = [];
    let provides = [];
    if (meta && ts.isObjectLiteralExpression(meta)) {
      for (const prop of meta.properties) {
        if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name)) continue;
        if (prop.name.text === 'selector' && ts.isStringLiteral(prop.initializer)) selector = prop.initializer.text;
        if (prop.name.text === 'standalone') standalone = prop.initializer.kind === ts.SyntaxKind.TrueKeyword;
      }
      slots = slotsOf(templateOf(meta, file));
      provides = providedTokens(meta);
    }
    if (!selector) return;

    providesByClass.set(node.name.text, provides);
    injectsByClass.set(node.name.text, injectedTokens(node));
    childrenByClass.set(node.name.text, contentChildClasses(node));

    const inputs = [];
    const outputs = [];
    for (const member of node.members) {
      if (!ts.isPropertyDeclaration(member) || !ts.isIdentifier(member.name) || !isPublic(member)) continue;
      const sig = signalCall(member.initializer);
      if (!sig) continue;
      const name = member.name.text;
      const description = jsDocText(member);
      const typeNode = sig.call.typeArguments?.[0];
      if (sig.kind === 'output') {
        outputs.push({ name, payload: typeNode ? typeNode.getText() : 'void', ...(description && { description }) });
        continue;
      }
      const defaultText = sig.call.arguments[0]?.getText();
      const { type, options } = describeType(typeNode, defaultText);
      inputs.push({
        name,
        type,
        ...(options && { options }),
        ...(defaultText !== undefined && { default: defaultText }),
        required: Boolean(sig.required),
        ...(sig.kind === 'model' && { bindable: true }),
        ...(description && { description })
      });
    }

    const description = jsDocText(node);
    components.push({
      name: isDirective ? selector.replace(/[[\]]/g, '') : selector.replace(/^iris-/, ''),
      selector,
      className: node.name.text,
      ...(isDirective && { type: 'directive' }),
      standalone,
      sourceFile: relative(repoRoot, file),
      ...(description && { description }),
      inputs: inputs.sort((a, b) => a.name.localeCompare(b.name)),
      outputs: outputs.sort((a, b) => a.name.localeCompare(b.name)),
      ...(slots.length && { slots })
    });
  });
}

// ── Story-authored descriptions ──────────────────────────────────────────────
// Most components document themselves in their Storybook MDX rather than in a class JSDoc. The MDX never names the class, so
// it is joined through the sibling *.stories.ts, whose `meta.component` does.
const storyFiles = walk(join(repoRoot, 'Storybook'));
const classByStoriesDir = new Map();
for (const file of filesEndingWith(storyFiles, '.stories.ts')) {
  parse(file).forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return;
    for (const decl of node.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text !== 'meta') continue;
      if (!decl.initializer || !ts.isObjectLiteralExpression(decl.initializer)) continue;
      for (const prop of decl.initializer.properties) {
        if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === 'component' && ts.isIdentifier(prop.initializer)) {
          classByStoriesDir.set(dirname(file), prop.initializer.text);
        }
      }
    }
  });
}

// First prose paragraph under the top-level heading, skipping JSX blocks and tables.
const descriptionByClass = new Map();
for (const file of filesEndingWith(storyFiles, '.docs.mdx')) {
  const componentClass = classByStoriesDir.get(dirname(file));
  if (!componentClass) continue;
  const text = readFileSync(file, 'utf8');
  const heading = text.match(/^#\s+(.+)$/m);
  if (!heading) continue;
  const intro = text
    .slice(text.indexOf(heading[0]) + heading[0].length)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .find((paragraph) => paragraph && !paragraph.startsWith('#') && !paragraph.startsWith('<') && !paragraph.startsWith('|'));
  if (intro) descriptionByClass.set(componentClass, intro.replace(/\s+/g, ' '));
}

for (const component of components) {
  if (!component.description && descriptionByClass.has(component.className)) component.description = descriptionByClass.get(component.className);
}

// ── Resolve composition relations ─────────────────────────────────────────────
// Two idioms express a parent/child pairing: the parent queries the child with contentChildren(), or the child injects a
// token the parent provides. Both are resolved to selectors here, so a new pairing is picked up without touching this file.
const selectorByClass = new Map(components.map((c) => [c.className, c.selector]));
const parentSelectorByToken = new Map();
for (const c of components) for (const token of providesByClass.get(c.className) ?? []) parentSelectorByToken.set(token, c.selector);

for (const component of components) {
  const contains = (childrenByClass.get(component.className) ?? [])
    .map((className) => selectorByClass.get(className))
    .filter((selector) => selector && selector !== component.selector)
    .sort();
  if (contains.length) component.contains = contains;

  const parent = (injectsByClass.get(component.className) ?? [])
    .map(({ token, optional }) => ({ selector: parentSelectorByToken.get(token), optional }))
    .find((candidate) => candidate.selector && candidate.selector !== component.selector);
  if (parent) component.parent = { selector: parent.selector, required: !parent.optional };
}

components.sort((a, b) => a.name.localeCompare(b.name));

// ── Emit artifact ─────────────────────────────────────────────────────────────
const registry = { generatedBy: 'Components/scripts/build-registry.mjs', componentCount: components.length, components };

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'component-registry.json'), JSON.stringify(registry, null, 2) + '\n');

const withRelations = components.filter((c) => c.contains || c.parent).length;
console.log(`Registry: ${components.length} components (${withRelations} with composition relations) → Components/api/`);
