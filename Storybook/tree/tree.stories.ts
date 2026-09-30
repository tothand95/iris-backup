// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { signal } from '@angular/core';
import { cascadeTreeCheck, IrisTreeComponent, patchTreeNode, TreeCheckedChange, TreeExpandedChange, TreeNode } from '@oneidentity/iris-ui';
import type { Meta, StoryObj } from '@storybook/angular';
import { componentWrapperDecorator } from '@storybook/angular';
import { StoryTreeLazyDemoComponent } from './tree-lazy-demo.component';

const SAMPLE_NODES: TreeNode[] = [
  {
    id: 'ad',
    label: 'Active Directory',
    icon: 'Network',
    expanded: true,
    children: [
      { id: 'ad-oto', label: 'OTO.local' },
      { id: 'ad-builtin', label: 'Builtin', icon: 'Folder' },
      { id: 'ad-dg', label: 'DG-Tests', icon: 'Folder', expandable: true, children: [] },
      { id: 'ad-dc', label: 'Domain Controllers', icon: 'Folder' },
      { id: 'ad-fsp', label: 'Foreign Security Principals', icon: 'Shield' },
      { id: 'ad-keys', label: 'Keys', icon: 'Key' },
      {
        id: 'ad-msa',
        label: 'Managed Service Accounts',
        icon: 'FolderUser',
        expanded: true,
        children: [
          {
            id: 'ad-pd',
            label: 'Program Data',
            icon: 'Folder',
            expanded: true,
            children: [
              {
                id: 'ad-sys',
                label: 'System',
                icon: 'Folder',
                expanded: true,
                children: [
                  {
                    id: 'ad-testou',
                    label: 'Test OU',
                    icon: 'Folder',
                    expanded: false,
                    children: [
                      {
                        id: 'ad-testou2',
                        label: 'Test OU2',
                        icon: 'Folder',
                        children: [{ id: 'ad-test1', label: 'Test1' }]
                      }
                    ]
                  },
                  { id: 'ad-test2', label: 'Test2', icon: 'User' },
                  { id: 'ad-test3', label: 'Test3', icon: 'User' }
                ]
              }
            ]
          }
        ]
      },
      { id: 'ad-mu', label: 'Managed Units', icon: 'Folder' },
      {
        id: 'ad-azure',
        label: 'Azure',
        icon: 'FolderUser',
        children: [
          { id: 'azure-users', label: 'Users', icon: 'Users', expandable: true, children: [] },
          { id: 'azure-groups', label: 'Security Groups', icon: 'UsersThree', expandable: true, children: [] }
        ]
      }
    ]
  },
  {
    id: 'ad-ad-lds',
    label: 'AD LDS',
    icon: 'Database',
    expanded: true,
    children: [
      { id: 'ad-ad-lds-users', label: 'Users', icon: 'Users', expandable: true, children: [] },
      { id: 'ad-ad-lds-groups', label: 'Groups', icon: 'UsersThree', expandable: true, children: [] }
    ]
  }
];

const meta: Meta<IrisTreeComponent> = {
  title: 'Navigation/Tree',
  component: IrisTreeComponent,
  tags: ['preview'],
  argTypes: {
    nodes: {
      description: 'Array of `TreeNode` objects defining the hierarchical structure. Each node may contain nested `children` to form branches.',
      control: 'object',
      table: {
        type: { summary: 'TreeNode[]' },
        defaultValue: { summary: '[]' }
      }
    },
    activeNodeId: {
      description:
        'Id of the active row, highlighted with an active background. A two-way bindable model: the tree writes it on activation and emits `activeNodeIdChange`.',
      control: 'text',
      table: {
        type: { summary: 'string | null' },
        defaultValue: { summary: 'null' }
      }
    },
    showTrailingIcons: {
      description: 'Shows trailing action icons (overflow menu and expand caret) on hovered and active rows.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' }
      }
    },
    nodeExpandedChange: {
      description: 'Emits `{ node, expanded }` when a node is opened or closed. Fires before lazily loaded children are available.',
      table: {
        type: { summary: 'TreeExpandedChange' },
        defaultValue: { summary: '—' },
        category: 'Events'
      }
    },
    nodeCheckedChange: {
      description: 'Emits `{ node, checked }` when a checkbox is clicked or Space is pressed. Requires `checkable`.',
      table: {
        type: { summary: 'TreeCheckedChange' },
        defaultValue: { summary: '—' },
        category: 'Events'
      }
    },
    expandOnActivate: {
      description: 'Activating a node also opens it. Collapsing stays on the caret and Arrow Left.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    showEmptyGroup: {
      description: 'Renders a single disabled row when an open node turns out to have no children, so an empty container does not look like a leaf.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    checkable: {
      description:
        'Renders a checkbox on every row, dimmed at rest and fully opaque on hover, focus or when active. `node.checkState` drives it, so the consumer owns the state.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    iconResolver: {
      description:
        'Replaces the built-in folder/leaf icon resolution. Receives the node plus its resolved `expanded`, `expandable` and `active` state.',
      table: {
        type: { summary: '(node: TreeNode, state: TreeIconState) => IconName' },
        defaultValue: { summary: 'undefined' }
      }
    },
    ariaLabel: {
      description: 'Accessible label for the `role="tree"` landmark. Recommended when multiple trees exist on the page.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' }, category: 'Accessibility' }
    },
    collapseAriaLabel: {
      description: 'Accessible label for caret buttons in the expanded state, announced by screen readers. Localise for non-English UIs.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'Collapse' }, category: 'Accessibility' }
    },
    loadingAriaLabel: {
      description: 'Accessible label for a caret button whose level is being fetched. Localise for non-English UIs.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'Loading' }, category: 'Accessibility' }
    },
    emptyGroupLabel: {
      description: 'Text of the row rendered by `showEmptyGroup`. Localise for non-English UIs.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'Empty' }, category: 'Accessibility' }
    },
    checkAriaLabel: {
      description: 'Accessible label for the checkbox of an unchecked row. Localise for non-English UIs.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'Check' }, category: 'Accessibility' }
    },
    uncheckAriaLabel: {
      description: 'Accessible label for the checkbox of a checked row. Localise for non-English UIs.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'Uncheck' }, category: 'Accessibility' }
    },
    expandAriaLabel: {
      description: 'Accessible label for caret buttons in the collapsed state, announced by screen readers. Localise for non-English UIs.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'Expand' }, category: 'Accessibility' }
    }
  },
  args: {
    expandOnActivate: false,
    showEmptyGroup: false,
    checkable: false,
    ariaLabel: '',
    collapseAriaLabel: '',
    expandAriaLabel: '',
    loadingAriaLabel: '',
    emptyGroupLabel: '',
    checkAriaLabel: '',
    uncheckAriaLabel: ''
  }
};

const narrow = componentWrapperDecorator((story) => `<div style="width:350px;">${story}</div>`);

/**
 * Expansion is consumer state, so a story has to hold the nodes and apply the emitted intent —
 * the same three lines every application writes.
 */
const interactive: Story['render'] = (args) => {
  const nodes = signal<readonly TreeNode[]>(args.nodes ?? []);
  return {
    props: {
      ...args,
      nodes,
      onExpanded: ({ node, expanded }: TreeExpandedChange) => nodes.update((current) => patchTreeNode(current, node.id, { expanded })),
      onChecked: ({ node, checked }: TreeCheckedChange) => nodes.update((current) => cascadeTreeCheck(current, node.id, checked))
    },
    template: `
      <iris-tree
        [nodes]="nodes()"
        [activeNodeId]="activeNodeId"
        [expandOnActivate]="expandOnActivate"
        [showEmptyGroup]="showEmptyGroup"
        [checkable]="checkable"
        [showTrailingIcons]="showTrailingIcons"
        [ariaLabel]="ariaLabel"
        [collapseAriaLabel]="collapseAriaLabel"
        [expandAriaLabel]="expandAriaLabel"
        [loadingAriaLabel]="loadingAriaLabel"
        [emptyGroupLabel]="emptyGroupLabel"
        [checkAriaLabel]="checkAriaLabel"
        [uncheckAriaLabel]="uncheckAriaLabel"
        (nodeExpandedChange)="onExpanded($event)"
        (nodeCheckedChange)="onChecked($event)" />
    `
  };
};

export default meta;
type Story = StoryObj<IrisTreeComponent>;

export const Overview: Story = {
  decorators: [narrow],
  render: interactive,
  args: {
    nodes: SAMPLE_NODES,
    activeNodeId: 'ad-pd',
    showTrailingIcons: true
  }
};

export const ActiveNode: Story = {
  name: 'Active node',
  decorators: [narrow],
  render: interactive,
  args: {
    nodes: SAMPLE_NODES,
    activeNodeId: 'ad-pd',
    showTrailingIcons: true
  }
};

export const WithoutTrailingIcons: Story = {
  name: 'Without trailing icons',
  decorators: [narrow],
  render: interactive,
  args: {
    nodes: SAMPLE_NODES,
    activeNodeId: null,
    showTrailingIcons: false
  }
};

export const Checkable: Story = {
  decorators: [narrow],
  render: interactive,
  args: {
    nodes: SAMPLE_NODES,
    activeNodeId: null,
    checkable: true,
    showTrailingIcons: true
  }
};

export const LazyLoaded: Story = {
  name: 'Lazy loaded',
  parameters: {
    controls: { disable: true },
    actions: { disable: true }
  },
  render: () => ({
    moduleMetadata: { imports: [StoryTreeLazyDemoComponent] },
    template: '<story-tree-lazy-demo />'
  })
};

export const ExpandOnActivate: Story = {
  name: 'Expand on activate',
  decorators: [narrow],
  render: interactive,
  args: {
    nodes: SAMPLE_NODES,
    activeNodeId: null,
    expandOnActivate: true,
    showTrailingIcons: true
  }
};
