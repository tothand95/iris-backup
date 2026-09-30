// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisTreeComponent } from './tree.component';
import { TreeCheckedChange, TreeExpandedChange, TreeNode } from './tree.model';
import { patchTreeNode } from './tree.utils';

describe('IrisTreeComponent', () => {
  let component: IrisTreeComponent;
  let fixture: ComponentFixture<IrisTreeComponent>;

  const mockNodes: TreeNode[] = [
    {
      id: '1',
      label: 'Root',
      icon: 'Folder',
      expanded: true,
      children: [
        { id: '1-1', label: 'Child 1', icon: 'File' },
        { id: '1-2', label: 'Child 2', icon: 'File' }
      ]
    },
    { id: '2', label: 'Leaf', icon: 'File' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisTreeComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(IrisTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render tree nodes', () => {
    fixture.componentRef.setInput('nodes', mockNodes);
    fixture.detectChanges();
    const elements = fixture.nativeElement.querySelectorAll('.iris-tree__element');
    expect(elements.length).toBe(4);
  });

  it('should apply active class to active node', () => {
    fixture.componentRef.setInput('nodes', mockNodes);
    fixture.componentRef.setInput('activeNodeId', '1-1');
    fixture.detectChanges();
    const activeEls = fixture.nativeElement.querySelectorAll('.iris-tree__element--active');
    expect(activeEls.length).toBe(1);
  });

  it('should emit activeNodeIdChange on click', () => {
    fixture.componentRef.setInput('nodes', mockNodes);
    fixture.detectChanges();
    let activeId: string | null | undefined;
    component.activeNodeId.subscribe((id: string | null) => (activeId = id));
    const firstElement = fixture.nativeElement.querySelector('.iris-tree__element');
    firstElement.click();
    expect(activeId).toBe(mockNodes[0].id);
  });

  it('should hide children when not expanded', () => {
    const collapsedNodes: TreeNode[] = [{ id: '1', label: 'Root', expanded: false, children: [{ id: '1-1', label: 'Child' }] }];
    fixture.componentRef.setInput('nodes', collapsedNodes);
    fixture.detectChanges();
    const children = fixture.nativeElement.querySelectorAll('.iris-tree__children');
    expect(children.length).toBe(0);
  });

  it('should hide trailing icons when showTrailingIcons is false', () => {
    fixture.componentRef.setInput('nodes', mockNodes);
    fixture.componentRef.setInput('showTrailingIcons', false);
    fixture.detectChanges();
    const trailing = fixture.nativeElement.querySelectorAll('.iris-tree__trailing');
    expect(trailing.length).toBe(0);
  });

  it('should emit activeNodeIdChange on Enter key', () => {
    fixture.componentRef.setInput('nodes', mockNodes);
    fixture.detectChanges();
    let activeId: string | null | undefined;
    component.activeNodeId.subscribe((id: string | null) => (activeId = id));
    const elements = fixture.nativeElement.querySelectorAll('.iris-tree__element');
    elements[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(activeId).toBe(mockNodes[0].id);
  });

  it('should emit activeNodeIdChange on Space key', () => {
    const freshNodes: TreeNode[] = [
      {
        id: '1',
        label: 'Root',
        icon: 'Folder',
        expanded: true,
        children: [
          { id: '1-1', label: 'Child 1', icon: 'File' },
          { id: '1-2', label: 'Child 2', icon: 'File' }
        ]
      },
      { id: '2', label: 'Leaf', icon: 'File' }
    ];
    fixture.componentRef.setInput('nodes', freshNodes);
    fixture.detectChanges();
    let activeId: string | null | undefined;
    component.activeNodeId.subscribe((id: string | null) => (activeId = id));
    const elements = fixture.nativeElement.querySelectorAll('.iris-tree__element');
    elements[1].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: false }));
    expect(activeId).toBe(freshNodes[0].children![0].id);
  });

  it('should expand collapsed node on ArrowRight key', () => {
    const collapsedNodes: TreeNode[] = [{ id: '1', label: 'Root', expanded: false, children: [{ id: '1-1', label: 'Child' }] }];
    fixture.componentRef.setInput('nodes', collapsedNodes);
    fixture.detectChanges();
    let change: TreeExpandedChange | undefined;
    component.nodeExpandedChange.subscribe((event: TreeExpandedChange) => (change = event));
    const elements = fixture.nativeElement.querySelectorAll('.iris-tree__element');
    elements[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(change?.expanded).toBe(true);
    expect(collapsedNodes[0].expanded).toBe(false);
  });

  it('should collapse expanded node on ArrowLeft key', () => {
    const expandedNodes: TreeNode[] = [
      {
        id: '1',
        label: 'Root',
        icon: 'Folder',
        expanded: true,
        children: [{ id: '1-1', label: 'Child 1', icon: 'File' }]
      }
    ];
    fixture.componentRef.setInput('nodes', expandedNodes);
    fixture.detectChanges();
    let change: TreeExpandedChange | undefined;
    component.nodeExpandedChange.subscribe((event: TreeExpandedChange) => (change = event));
    const elements = fixture.nativeElement.querySelectorAll('.iris-tree__element');
    elements[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(change?.expanded).toBe(false);
    expect(expandedNodes[0].expanded).toBe(true);
  });

  it('should move focus to next element on ArrowDown key', () => {
    fixture.componentRef.setInput('nodes', mockNodes);
    fixture.detectChanges();
    const elements = fixture.nativeElement.querySelectorAll('.iris-tree__element') as NodeListOf<HTMLElement>;
    const focusSpy = vi.spyOn(elements[1], 'focus');
    elements[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(focusSpy).toHaveBeenCalled();
  });

  it('should move focus to previous element on ArrowUp key', () => {
    fixture.componentRef.setInput('nodes', mockNodes);
    fixture.detectChanges();
    const elements = fixture.nativeElement.querySelectorAll('.iris-tree__element') as NodeListOf<HTMLElement>;
    const focusSpy = vi.spyOn(elements[0], 'focus');
    elements[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(focusSpy).toHaveBeenCalled();
  });

  it('should return Placeholder icon for node without icon and no children', () => {
    expect(component.resolveNodeIcon({ id: 'l', label: 'Leaf' })).toBe('Placeholder');
  });

  it('should return FolderOpen for expanded node without icon but with children', () => {
    expect(component.resolveNodeIcon({ id: 'n', label: 'Node', expanded: true, children: [{ id: 'c', label: 'Child' }] })).toBe('FolderOpen');
  });

  it('should return FolderOpen for node with icon Folder when expanded', () => {
    expect(component.resolveNodeIcon({ id: 'n', label: 'Node', icon: 'Folder', expanded: true })).toBe('FolderOpen');
  });

  it('should return concatenated guide array from buildNestedIndentGuides when level > 0', () => {
    expect(component.buildNestedIndentGuides([true, false], true, 2)).toEqual([true, false, true]);
  });

  it('should not set aria-label on tree by default', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="tree"]').getAttribute('aria-label')).toBeNull();
  });

  it('should set aria-label on tree when ariaLabel is provided', () => {
    fixture.componentRef.setInput('ariaLabel', 'File explorer');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="tree"]').getAttribute('aria-label')).toBe('File explorer');
  });

  it('should use default collapseAriaLabel and expandAriaLabel on caret buttons', () => {
    fixture.componentRef.setInput('nodes', [{ id: '1', label: 'Parent', children: [{ id: '2', label: 'Child' }], expanded: false }]);
    fixture.detectChanges();
    const caret = fixture.nativeElement.querySelector('.iris-tree__caret');
    expect(caret.getAttribute('aria-label')).toBe('Expand');
  });

  it('should use custom collapseAriaLabel when node is expanded', () => {
    fixture.componentRef.setInput('collapseAriaLabel', 'Zuklappen');
    fixture.componentRef.setInput('nodes', [{ id: '1', label: 'Parent', children: [{ id: '2', label: 'Child' }], expanded: true }]);
    fixture.detectChanges();
    const caret = fixture.nativeElement.querySelector('.iris-tree__caret');
    expect(caret.getAttribute('aria-label')).toBe('Zuklappen');
  });

  describe('lazy loaded levels', () => {
    const unloaded: TreeNode[] = [{ id: '1', label: 'Container', expandable: true }];

    it('should render the toggle for an expandable node whose children have not arrived', () => {
      fixture.componentRef.setInput('nodes', unloaded);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.iris-tree__caret')).toBeTruthy();
      expect(fixture.nativeElement.querySelectorAll('.iris-tree__element').length).toBe(1);
    });

    it('should expose aria-expanded on an expandable node whose children have not arrived', () => {
      fixture.componentRef.setInput('nodes', unloaded);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[role="treeitem"]').getAttribute('aria-expanded')).toBe('false');
    });

    it('should not expose aria-expanded on a leaf', () => {
      fixture.componentRef.setInput('nodes', [{ id: '1', label: 'Leaf' }]);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[role="treeitem"]').getAttribute('aria-expanded')).toBeNull();
    });

    it('should emit an expand intent for a node whose children have not arrived', () => {
      const nodes: TreeNode[] = [{ id: '1', label: 'Container', expandable: true }];
      fixture.componentRef.setInput('nodes', nodes);
      fixture.detectChanges();
      let change: TreeExpandedChange | undefined;
      component.nodeExpandedChange.subscribe((event: TreeExpandedChange) => (change = event));
      fixture.nativeElement.querySelector('.iris-tree__caret').click();
      expect(change).toEqual({ node: nodes[0], expanded: true });
    });

    it('should expand an unloaded node on ArrowRight key', () => {
      fixture.componentRef.setInput('nodes', unloaded);
      fixture.detectChanges();
      let change: TreeExpandedChange | undefined;
      component.nodeExpandedChange.subscribe((event: TreeExpandedChange) => (change = event));
      const element = fixture.nativeElement.querySelector('.iris-tree__element');
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      expect(change?.expanded).toBe(true);
    });

    it('should render children that arrive after the node was expanded', () => {
      const nodes: TreeNode[] = [{ id: '1', label: 'Container', expandable: true }];
      fixture.componentRef.setInput('nodes', nodes);
      fixture.detectChanges();
      fixture.nativeElement.querySelector('.iris-tree__caret').click();
      fixture.componentRef.setInput('nodes', [
        { id: '1', label: 'Container', expandable: true, expanded: true, children: [{ id: '1-1', label: 'Child' }] }
      ]);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.iris-tree__element').length).toBe(2);
    });
  });

  describe('immutable node input', () => {
    it('should not write expanded back onto the caller node when toggling', () => {
      const nodes: TreeNode[] = [{ id: '1', label: 'Root', expanded: false, children: [{ id: '1-1', label: 'Child' }] }];
      fixture.componentRef.setInput('nodes', nodes);
      fixture.detectChanges();
      fixture.nativeElement.querySelector('.iris-tree__caret').click();
      fixture.detectChanges();
      expect(nodes[0].expanded).toBe(false);
      expect(component.isExpanded(nodes[0])).toBe(false);
      expect(fixture.nativeElement.querySelectorAll('.iris-tree__element').length).toBe(1);
    });

    it('should accept frozen nodes', () => {
      const nodes = Object.freeze([Object.freeze({ id: '1', label: 'Root', expanded: false, children: [{ id: '1-1', label: 'Child' }] })]);
      fixture.componentRef.setInput('nodes', nodes);
      fixture.detectChanges();
      expect(() => fixture.nativeElement.querySelector('.iris-tree__caret').click()).not.toThrow();
    });
  });

  describe('loading state', () => {
    const loadingNodes: TreeNode[] = [{ id: '1', label: 'Container', expandable: true, loading: true }];

    it('should render a spinner in the toggle', () => {
      fixture.componentRef.setInput('nodes', loadingNodes);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.iris-tree__caret iris-spinner')).toBeTruthy();
    });

    it('should mark the node busy and disable the toggle', () => {
      fixture.componentRef.setInput('nodes', loadingNodes);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[role="treeitem"]').getAttribute('aria-busy')).toBe('true');
      expect(fixture.nativeElement.querySelector('.iris-tree__caret').disabled).toBe(true);
    });

    it('should ignore a keyboard expand while the level is in flight', () => {
      fixture.componentRef.setInput('nodes', loadingNodes);
      fixture.detectChanges();
      const emitted: TreeExpandedChange[] = [];
      component.nodeExpandedChange.subscribe((event: TreeExpandedChange) => emitted.push(event));
      const element = fixture.nativeElement.querySelector('.iris-tree__element');
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      expect(emitted).toEqual([]);
    });
  });

  describe('empty group', () => {
    const emptyNodes: TreeNode[] = [{ id: '1', label: 'Container', expandable: true, expanded: true, children: [] }];

    it('should render a single disabled row when an open node resolved to no children', () => {
      fixture.componentRef.setInput('nodes', emptyNodes);
      fixture.componentRef.setInput('showEmptyGroup', true);
      fixture.detectChanges();
      const rows = fixture.nativeElement.querySelectorAll('.iris-tree__element');
      expect(rows.length).toBe(2);
      expect(rows[1].textContent.trim()).toBe('Empty');
    });

    it('should not render the empty row when showEmptyGroup is false', () => {
      fixture.componentRef.setInput('nodes', emptyNodes);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.iris-tree__element').length).toBe(1);
    });

    it('should not render the empty row while the level has not been loaded', () => {
      fixture.componentRef.setInput('nodes', [{ id: '1', label: 'Container', expandable: true, expanded: true }]);
      fixture.componentRef.setInput('showEmptyGroup', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.iris-tree__element').length).toBe(1);
    });
  });

  describe('activation versus expansion', () => {
    const nodes: TreeNode[] = [{ id: '1', label: 'Root', children: [{ id: '1-1', label: 'Child' }] }];

    it('should not expand on row click by default', () => {
      fixture.componentRef.setInput('nodes', nodes);
      fixture.detectChanges();
      const emitted: TreeExpandedChange[] = [];
      component.nodeExpandedChange.subscribe((event: TreeExpandedChange) => emitted.push(event));
      fixture.nativeElement.querySelector('.iris-tree__element').click();
      fixture.detectChanges();
      expect(emitted).toEqual([]);
      expect(fixture.nativeElement.querySelectorAll('.iris-tree__element').length).toBe(1);
    });

    it('should emit an expand intent on every row click when expandOnActivate is set and the consumer has not applied it', () => {
      fixture.componentRef.setInput('nodes', nodes);
      fixture.componentRef.setInput('expandOnActivate', true);
      fixture.detectChanges();
      const emitted: TreeExpandedChange[] = [];
      component.nodeExpandedChange.subscribe((event: TreeExpandedChange) => emitted.push(event));
      fixture.nativeElement.querySelector('.iris-tree__element').click();
      fixture.detectChanges();
      expect(emitted).toEqual([{ node: nodes[0], expanded: true }]);
      expect(fixture.nativeElement.querySelectorAll('.iris-tree__element').length).toBe(1);
    });

    it('should not emit a collapse intent on row click once the node is open', () => {
      const open: TreeNode[] = [{ id: '1', label: 'Root', expanded: true, children: [{ id: '1-1', label: 'Child' }] }];
      fixture.componentRef.setInput('nodes', open);
      fixture.componentRef.setInput('expandOnActivate', true);
      fixture.detectChanges();
      const emitted: TreeExpandedChange[] = [];
      component.nodeExpandedChange.subscribe((event: TreeExpandedChange) => emitted.push(event));
      fixture.nativeElement.querySelector('.iris-tree__element').click();
      fixture.detectChanges();
      expect(emitted).toEqual([]);
    });
  });

  describe('consumer owned expansion', () => {
    const nodes: TreeNode[] = [{ id: '1', label: 'Root', children: [{ id: '1-1', label: 'Branch', children: [{ id: '1-1-1', label: 'Leaf' }] }] }];

    it('should render exactly what the nodes declare', () => {
      fixture.componentRef.setInput('nodes', patchTreeNode(patchTreeNode(nodes, '1', { expanded: true }), '1-1', { expanded: true }));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.iris-tree__element').length).toBe(3);
    });

    it('should open when the consumer applies the emitted intent', () => {
      fixture.componentRef.setInput('nodes', nodes);
      fixture.detectChanges();
      component.nodeExpandedChange.subscribe((event: TreeExpandedChange) => {
        fixture.componentRef.setInput('nodes', patchTreeNode(nodes, event.node.id, { expanded: event.expanded }));
      });
      fixture.nativeElement.querySelector('.iris-tree__caret').click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.iris-tree__element').length).toBe(2);
    });

    it('should collapse when the consumer sets expanded back to false', () => {
      fixture.componentRef.setInput('nodes', patchTreeNode(nodes, '1', { expanded: true }));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.iris-tree__element').length).toBe(2);
      fixture.componentRef.setInput('nodes', patchTreeNode(nodes, '1', { expanded: false }));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.iris-tree__element').length).toBe(1);
    });

    it('should keep expansion when a projection rebuilds the nodes with the same flags', () => {
      const open = patchTreeNode(nodes, '1', { expanded: true });
      fixture.componentRef.setInput('nodes', open);
      fixture.detectChanges();
      fixture.componentRef.setInput('nodes', structuredClone(open));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.iris-tree__element').length).toBe(2);
    });
  });

  describe('patchTreeNode', () => {
    const nodes: TreeNode[] = [
      { id: '1', label: 'Root', children: [{ id: '1-1', label: 'Branch', children: [{ id: '1-1-1', label: 'Leaf' }] }] },
      { id: '2', label: 'Sibling' }
    ];

    it('should apply the patch to the matching node at any depth', () => {
      const patched = patchTreeNode(nodes, '1-1-1', { expanded: true, loading: true });
      expect(patched[0].children?.[0].children?.[0]).toEqual({ id: '1-1-1', label: 'Leaf', expanded: true, loading: true });
    });

    it('should not mutate the input', () => {
      patchTreeNode(nodes, '1', { expanded: true });
      expect(nodes[0].expanded).toBeUndefined();
    });

    it('should keep the identity of untouched branches', () => {
      const patched = patchTreeNode(nodes, '1-1', { expanded: true });
      expect(patched[1]).toBe(nodes[1]);
      expect(patched[0]).not.toBe(nodes[0]);
    });

    it('should return an equivalent tree when the id is not found', () => {
      expect(patchTreeNode(nodes, 'missing', { expanded: true })).toEqual(nodes);
    });

    it('should accept frozen nodes', () => {
      const frozen = Object.freeze([Object.freeze({ id: '1', label: 'Root' })]) as readonly TreeNode[];
      expect(patchTreeNode(frozen, '1', { expanded: true })[0].expanded).toBe(true);
    });
  });

  describe('checkable', () => {
    const checkNodes: TreeNode[] = [
      { id: '1', label: 'Root' },
      { id: '2', label: 'Checked', checkState: 'checked' },
      { id: '3', label: 'Mixed', checkState: 'mixed' }
    ];

    beforeEach(() => {
      fixture.componentRef.setInput('nodes', checkNodes);
      fixture.componentRef.setInput('checkable', true);
      fixture.detectChanges();
    });

    it('should render a checkbox slot on every row', () => {
      expect(fixture.nativeElement.querySelectorAll('.iris-tree__checkbox').length).toBe(3);
    });

    it('should render no checkbox when checkable is false', () => {
      fixture.componentRef.setInput('checkable', false);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.iris-tree__checkbox').length).toBe(0);
    });

    it('should keep the checkbox of a checked or mixed row visible', () => {
      const boxes = fixture.nativeElement.querySelectorAll('.iris-tree__checkbox');
      expect(boxes[0].classList).not.toContain('iris-tree__checkbox--visible');
      expect(boxes[1].classList).toContain('iris-tree__checkbox--visible');
      expect(boxes[2].classList).toContain('iris-tree__checkbox--visible');
    });

    it('should emit nodeCheckedChange without activating the row on checkbox click', () => {
      let change: TreeCheckedChange | undefined;
      let activatedId: string | null | undefined;
      component.nodeCheckedChange.subscribe((value: TreeCheckedChange) => (change = value));
      component.activeNodeId.subscribe((id: string | null) => (activatedId = id));
      fixture.nativeElement.querySelectorAll('.iris-tree__checkbox')[0].click();
      expect(change).toEqual({ node: checkNodes[0], checked: true });
      expect(activatedId).toBeUndefined();
    });

    it('should clear a mixed node', () => {
      let change: TreeCheckedChange | undefined;
      component.nodeCheckedChange.subscribe((value: TreeCheckedChange) => (change = value));
      fixture.nativeElement.querySelectorAll('.iris-tree__checkbox')[2].click();
      expect(change).toEqual({ node: checkNodes[2], checked: false });
    });

    it('should toggle the check on Space and activate on Enter', () => {
      let change: TreeCheckedChange | undefined;
      let activatedId: string | null | undefined;
      component.nodeCheckedChange.subscribe((value: TreeCheckedChange) => (change = value));
      component.activeNodeId.subscribe((id: string | null) => (activatedId = id));
      const elements = fixture.nativeElement.querySelectorAll('.iris-tree__element');
      elements[0].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: false }));
      expect(change).toEqual({ node: checkNodes[0], checked: true });
      expect(activatedId).toBeUndefined();
      elements[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: false }));
      expect(activatedId).toBe(checkNodes[0].id);
    });

    it('should expose the checked state to assistive technology', () => {
      expect(fixture.nativeElement.querySelector('[role="tree"]').getAttribute('aria-multiselectable')).toBe('true');
      const items = fixture.nativeElement.querySelectorAll('[role="treeitem"]');
      expect(items[1].getAttribute('aria-checked')).toBe('true');
      expect(items[2].getAttribute('aria-checked')).toBe('mixed');
    });
  });

  describe('icon resolution', () => {
    it('should return Folder for an expandable node whose children have not arrived', () => {
      expect(component.resolveNodeIcon({ id: 'c', label: 'Container', expandable: true })).toBe('Folder');
    });

    it('should return Placeholder for a node explicitly marked as not expandable', () => {
      expect(component.resolveNodeIcon({ id: 'l', label: 'Leaf', expandable: false, children: [{ id: 'x', label: 'x' }] })).toBe('Placeholder');
    });

    it('should use the iconResolver when provided', () => {
      fixture.componentRef.setInput('iconResolver', () => 'Cloud');
      fixture.detectChanges();
      expect(component.resolveNodeIcon({ id: 'c', label: 'Container', expandable: true })).toBe('Cloud');
    });
  });
});
