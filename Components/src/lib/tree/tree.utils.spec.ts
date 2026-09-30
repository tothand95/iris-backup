// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import type { TreeNode } from './tree.model';
import { cascadeTreeCheck, expandTreePath, findTreeNode, getCheckedTreeNodes, getTreeNodePath, patchTreeNode } from './tree.utils';

const nodes = (): TreeNode[] => [
  {
    id: 'root',
    label: 'Root',
    children: [
      {
        id: 'a',
        label: 'A',
        children: [
          { id: 'a-1', label: 'A1' },
          { id: 'a-2', label: 'A2' }
        ]
      },
      { id: 'b', label: 'B' }
    ]
  },
  { id: 'other', label: 'Other' }
];

describe('patchTreeNode', () => {
  it('should apply the patch to the matching node', () => {
    const result = patchTreeNode(nodes(), 'a', { expanded: true });
    expect(result[0].children?.[0].expanded).toBe(true);
  });

  it('should keep the identity of untouched branches', () => {
    const source = nodes();
    const result = patchTreeNode(source, 'a', { expanded: true });
    expect(result[1]).toBe(source[1]);
  });
});

describe('findTreeNode', () => {
  it('should find a deeply nested node', () => {
    expect(findTreeNode(nodes(), 'a-2')?.label).toBe('A2');
  });

  it('should return undefined for an unknown id', () => {
    expect(findTreeNode(nodes(), 'missing')).toBeUndefined();
  });
});

describe('getTreeNodePath', () => {
  it('should return the chain from root to node', () => {
    expect(getTreeNodePath(nodes(), 'a-1').map((node) => node.id)).toEqual(['root', 'a', 'a-1']);
  });

  it('should return an empty array for an unknown id', () => {
    expect(getTreeNodePath(nodes(), 'missing')).toEqual([]);
  });
});

describe('expandTreePath', () => {
  it('should expand every ancestor of the node', () => {
    const result = expandTreePath(nodes(), 'a-1');
    expect(result[0].expanded).toBe(true);
    expect(result[0].children?.[0].expanded).toBe(true);
  });

  it('should leave the node itself untouched', () => {
    const result = expandTreePath(nodes(), 'a');
    expect(result[0].children?.[0].expanded).toBeUndefined();
  });

  it('should leave unrelated branches untouched', () => {
    const source = nodes();
    const result = expandTreePath(source, 'a-1');
    expect(result[1]).toBe(source[1]);
  });
});

describe('cascadeTreeCheck', () => {
  it('should check every descendant of the checked node', () => {
    const result = cascadeTreeCheck(nodes(), 'a', true);
    const a = result[0].children?.[0];
    expect(a?.checkState).toBe('checked');
    expect(a?.children?.every((child) => child.checkState === 'checked')).toBe(true);
  });

  it('should mark partially checked ancestors as mixed', () => {
    const result = cascadeTreeCheck(nodes(), 'a-1', true);
    expect(result[0].checkState).toBe('mixed');
    expect(result[0].children?.[0].checkState).toBe('mixed');
  });

  it('should roll an ancestor up to checked once all children are checked', () => {
    const result = cascadeTreeCheck(cascadeTreeCheck(nodes(), 'a-1', true), 'a-2', true);
    expect(result[0].children?.[0].checkState).toBe('checked');
  });

  it('should clear descendants and ancestors when unchecked', () => {
    const result = cascadeTreeCheck(cascadeTreeCheck(nodes(), 'a', true), 'a', false);
    expect(result[0].checkState).toBe('unchecked');
    expect(result[0].children?.[0].children?.[0].checkState).toBe('unchecked');
  });
});

describe('getCheckedTreeNodes', () => {
  it('should collect checked nodes depth first', () => {
    const result = getCheckedTreeNodes(cascadeTreeCheck(nodes(), 'a', true));
    expect(result.map((node) => node.id)).toEqual(['a', 'a-1', 'a-2']);
  });

  it('should exclude mixed nodes', () => {
    const result = getCheckedTreeNodes(cascadeTreeCheck(nodes(), 'a-1', true));
    expect(result.map((node) => node.id)).toEqual(['a-1']);
  });
});

interface DirectoryNode extends TreeNode {
  objectType: string;
  children?: DirectoryNode[];
}

const directoryNodes = (): DirectoryNode[] => [
  {
    id: 'root',
    label: 'Root',
    objectType: 'domain',
    children: [{ id: 'a', label: 'A', objectType: 'ou', children: [{ id: 'a-1', label: 'A1', objectType: 'user' }] }]
  }
];

describe('extended nodes', () => {
  it('should carry extra properties through a patch', () => {
    const result = patchTreeNode(directoryNodes(), 'a-1', { expanded: true });
    expect(result[0].children?.[0].children?.[0]).toEqual({ id: 'a-1', label: 'A1', objectType: 'user', expanded: true });
  });

  it('should patch a consumer property', () => {
    const result = patchTreeNode(directoryNodes(), 'a', { objectType: 'container' });
    expect(result[0].children?.[0].objectType).toBe('container');
  });

  it('should carry extra properties through a cascaded check', () => {
    const result = cascadeTreeCheck(directoryNodes(), 'a', true);
    expect(result[0].children?.[0].children?.[0].objectType).toBe('user');
    expect(result[0].objectType).toBe('domain');
  });

  it('should return the extended type from every read helper', () => {
    const source = directoryNodes();
    expect(findTreeNode(source, 'a-1')?.objectType).toBe('user');
    expect(getTreeNodePath(source, 'a-1').map((node) => node.objectType)).toEqual(['domain', 'ou', 'user']);
    expect(expandTreePath(source, 'a-1')[0].objectType).toBe('domain');
    expect(getCheckedTreeNodes(cascadeTreeCheck(source, 'a-1', true)).map((node) => node.objectType)).toEqual(['domain', 'ou', 'user']);
  });
});
