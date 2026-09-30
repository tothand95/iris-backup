// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import type { IconName } from '../icon/icon.model';
import type { CheckboxValue } from '../checkbox/checkbox.model';
/** Internal visual state of a tree node. Not a component input; driven by interaction events. */
export type TreeNodeState = 'default' | 'active' | 'hover';

/**
 * A node in the tree hierarchy. Nodes with `children` are expandable.
 *
 * Extend it rather than keeping a parallel lookup. The tree reads the properties it knows and
 * ignores the rest, and every helper in `tree.utils` preserves both the extra properties and the
 * node type, so the hierarchy can be the single source of truth for your own data too:
 *
 * ```ts
 * interface DirectoryNode extends TreeNode {
 *   objectType: string;
 *   children?: DirectoryNode[];
 * }
 *
 * nodes = signal<DirectoryNode[]>(INITIAL);
 *
 * // still DirectoryNode[], and objectType survives
 * this.nodes.update((nodes) => patchTreeNode(nodes, id, { expanded: true }));
 * ```
 *
 * Redeclaring `children` as your own type is what keeps descendants narrow — without it, children
 * stay plain `TreeNode`.
 */
export interface TreeNode {
  /** Unique identifier for the node, used to match `activeNodeId`. */
  id: string;
  /** Visible label text. */
  label: string;
  /** Optional icon name shown to the left of the label. */
  icon?: IconName;
  /**
   * Whether the node is open. The tree never writes this back — it emits `nodeExpandedChange`
   * and the consumer applies the change, for example with `patchTreeNode`. Defaults to `false`.
   */
  expanded?: boolean;
  /**
   * Renders the expand toggle even when `children` has not arrived yet, so a level can be
   * fetched on demand. Defaults to `children.length > 0`.
   */
  expandable?: boolean;
  /**
   * Child nodes. `undefined` means the level has not been loaded yet, `[]` means it was loaded
   * and is empty. When present, the node renders an expand/collapse toggle.
   */
  children?: TreeNode[];
  /** Renders a pending indicator in the toggle, marks the row busy and blocks further toggles. */
  loading?: boolean;
  /**
   * Tri-state of the row's checkbox. Only rendered when the tree is `checkable`. Defaults to
   * `'unchecked'`. Yours to set — the component reads it and never writes it back.
   */
  checkState?: CheckboxValue;
  /** When `true`, trailing action icons (edit, delete, etc.) are shown on hover for this node. */
  showTrailingIcons?: boolean;
}

/** Payload of `nodeExpandedChange`. Fires before lazily loaded children are available. */
export interface TreeExpandedChange {
  /** The node the user expanded or collapsed. */
  node: TreeNode;
  /** `true` when the node was opened, `false` when it was closed. */
  expanded: boolean;
}

/** Payload of `nodeCheckedChange`. The tree never applies it — patch `nodes` yourself. */
export interface TreeCheckedChange {
  /** The node whose checkbox the user clicked. */
  node: TreeNode;
  /** `true` when the box was ticked, `false` when it was cleared. Mixed always clears. */
  checked: boolean;
}

/** Resolved state of a node, passed to a custom `iconResolver`. */ export interface TreeIconState {
  /** Whether the node is currently open. */
  expanded: boolean;
  /** Whether the node renders an expand toggle. */
  expandable: boolean;
  /** Whether the node is the active node. */
  active: boolean;
}

/** Picks the icon for a node. Overrides the built-in folder/leaf resolution. */
export type TreeIconResolver = (node: TreeNode, state: TreeIconState) => IconName;
