// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import type { CheckboxValue } from '../checkbox/checkbox.model';
import type { TreeNode } from './tree.model';

/**
 * Returns a copy of `nodes` with `patch` applied to the node with the given id. Only the branch
 * leading to that node is rebuilt, every other node keeps its identity.
 *
 * The tree never writes to the nodes it is given, so a consumer owns both expansion and lazily
 * loaded children. This is the update they need for either:
 *
 * ```ts
 * onExpandedChange({ node, expanded }: TreeExpandedChange) {
 *   this.nodes.update((nodes) => patchTreeNode(nodes, node.id, { expanded }));
 * }
 * ```
 *
 * Extra properties are carried over, and the node type is preserved, so an extended node is the
 * natural place to keep your own data — see {@link TreeNode}.
 */
export function patchTreeNode<T extends TreeNode & { children?: T[] }>(nodes: readonly T[], id: string, patch: Partial<T> & Partial<TreeNode>): T[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return { ...node, ...patch };
    }
    return node.children ? { ...node, children: patchTreeNode(node.children, id, patch) } : node;
  });
}

/**
 * Finds the node with the given id anywhere in the hierarchy, or `undefined`. Events carry the
 * node itself, so this is for the other direction: turning a stored id back into node data.
 */
export function findTreeNode<T extends TreeNode & { children?: T[] }>(nodes: readonly T[], id: string): T | undefined {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    const match = node.children ? findTreeNode(node.children, id) : undefined;
    if (match) {
      return match;
    }
  }
  return undefined;
}

/**
 * Returns the chain of nodes from the root down to the node with the given id, inclusive, or an
 * empty array when the id is not in `nodes`. Useful for breadcrumbs.
 */
export function getTreeNodePath<T extends TreeNode & { children?: T[] }>(nodes: readonly T[], id: string): T[] {
  for (const node of nodes) {
    if (node.id === id) {
      return [node];
    }
    const path = node.children ? getTreeNodePath(node.children, id) : [];
    if (path.length) {
      return [node, ...path];
    }
  }
  return [];
}

/**
 * Returns a copy of `nodes` with every ancestor of the given id expanded, so the node is visible.
 * The node itself keeps its own `expanded` value.
 *
 * Only reaches nodes that are already loaded — a lazily loaded branch has to be fetched level by
 * level before its descendants can be revealed.
 */
export function expandTreePath<T extends TreeNode & { children?: T[] }>(nodes: readonly T[], id: string): T[] {
  return nodes.map((node) => {
    if (!node.children?.length || node.id === id) {
      return node;
    }
    if (!findTreeNode(node.children, id)) {
      return node;
    }
    return { ...node, expanded: true, children: expandTreePath(node.children, id) };
  });
}

/**
 * Returns a copy of `nodes` with the check applied to the node with the given id, cascaded down to
 * its descendants, then re-derived on every ancestor: all children checked is `'checked'`, none is
 * `'unchecked'`, anything between is `'mixed'`.
 *
 * This is one policy, not the policy. The tree never applies it, so a hierarchy whose rows check
 * independently just patches the single node with {@link patchTreeNode} instead.
 */
export function cascadeTreeCheck<T extends TreeNode & { children?: T[] }>(nodes: readonly T[], id: string, checked: boolean): T[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return checkTreeBranch(node, checked ? 'checked' : 'unchecked');
    }
    if (!node.children?.length) {
      return node;
    }
    const children = cascadeTreeCheck(node.children, id, checked);
    return { ...node, children, checkState: rollUpCheckState(children) };
  });
}

/**
 * Returns every node whose `checkState` is `'checked'`, depth first. Containers are included, so
 * filter for leaves when a container is only a grouping.
 */
export function getCheckedTreeNodes<T extends TreeNode & { children?: T[] }>(nodes: readonly T[]): T[] {
  return nodes.flatMap((node) => [...(node.checkState === 'checked' ? [node] : []), ...(node.children ? getCheckedTreeNodes(node.children) : [])]);
}

function checkTreeBranch<T extends TreeNode & { children?: T[] }>(node: T, checkState: CheckboxValue): T {
  return {
    ...node,
    checkState,
    children: node.children?.map((child) => checkTreeBranch(child, checkState))
  };
}

function rollUpCheckState(children: readonly TreeNode[]): CheckboxValue {
  if (children.every((child) => child.checkState === 'checked')) {
    return 'checked';
  }
  if (children.every((child) => (child.checkState ?? 'unchecked') === 'unchecked')) {
    return 'unchecked';
  }
  return 'mixed';
}
