// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IrisTreeComponent, patchTreeNode, TreeExpandedChange, TreeNode } from '@oneidentity/iris-ui';

interface DirectoryObject {
  id: string;
  label: string;
  container: boolean;
}

/** Stands in for `GET /api/v2/children/{id}`. A container is only known to be one once asked. */
const DIRECTORY: Record<string, DirectoryObject[]> = {
  root: [
    { id: 'users', label: 'Users', container: true },
    { id: 'servers', label: 'Servers', container: true },
    { id: 'administrator', label: 'Administrator', container: false }
  ],
  users: [
    { id: 'u-jdoe', label: 'Jane Doe', container: false },
    { id: 'u-asmith', label: 'Alan Smith', container: false }
  ],
  servers: [{ id: 'dc', label: 'Domain Controllers', container: true }],
  dc: []
};

const REQUEST_DELAY_MS = 900;

@Component({
  selector: 'story-tree-lazy-demo',
  standalone: true,
  imports: [IrisTreeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo">
      <div class="demo-tree">
        <iris-tree
          [nodes]="nodes()"
          [(activeNodeId)]="activeNodeId"
          [showEmptyGroup]="true"
          ariaLabel="Directory"
          (nodeExpandedChange)="onExpandedChange($event)" />
      </div>
      <div class="demo-log">
        <p class="demo-log-title">Requests</p>
        @for (entry of log(); track $index) {
          <p class="demo-log-entry">{{ entry }}</p>
        } @empty {
          <p class="demo-log-empty">Expand a container to fetch its level.</p>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .demo {
        display: flex;
        gap: var(--oi-spacing-xl);
        align-items: flex-start;
        font-family: var(--oi-font-family-default);
      }

      .demo-tree {
        width: 280px;
        flex: none;
      }

      .demo-log {
        flex: 1;
        min-width: 220px;
        padding: var(--oi-spacing-m);
        border: var(--oi-border-width-default) solid var(--oi-border-color-muted);
        border-radius: var(--oi-border-radius-default);
        background-color: var(--oi-background-color-secondary);
      }

      .demo-log-title {
        margin: 0 0 var(--oi-spacing-s);
        font-size: var(--oi-font-size-xs);
        font-weight: var(--oi-font-weight-600);
        color: var(--oi-content-color-secondary);
      }

      .demo-log-entry {
        margin: 0;
        font-family: var(--oi-font-family-code);
        font-size: var(--oi-font-size-xs);
        line-height: var(--oi-line-height-s);
        color: var(--oi-content-color-primary);
      }

      .demo-log-empty {
        margin: 0;
        font-size: var(--oi-font-size-xs);
        color: var(--oi-content-color-tertiary);
      }
    `
  ]
})
export class StoryTreeLazyDemoComponent {
  protected readonly activeNodeId = signal<string | null>(null);
  protected readonly log = signal<string[]>([]);
  protected readonly nodes = signal<readonly TreeNode[]>([{ id: 'root', label: 'OTO.local', icon: 'Network', expandable: true }]);

  protected onExpandedChange({ node, expanded }: TreeExpandedChange): void {
    // Expansion is consumer state now: apply the intent, then fetch if the level is still missing.
    this.nodes.update((nodes) => patchTreeNode(nodes, node.id, { expanded }));
    // `children` is the only load marker needed: undefined = never fetched, [] = fetched and empty.
    if (!expanded || node.children !== undefined || node.loading) {
      return;
    }
    const id = node.id;
    this.log.update((entries) => [...entries, `GET /children/${id}`]);
    this.nodes.update((nodes) => patchTreeNode(nodes, id, { loading: true }));
    setTimeout(() => {
      const children = (DIRECTORY[id] ?? []).map(toTreeNode);
      this.nodes.update((nodes) => patchTreeNode(nodes, id, { loading: false, children }));
      this.log.update((entries) => [...entries, `← ${children.length} object(s)`]);
    }, REQUEST_DELAY_MS);
  }
}

function toTreeNode(object: DirectoryObject): TreeNode {
  return {
    id: object.id,
    label: object.label,
    expandable: object.container,
    icon: object.container ? undefined : 'User'
  };
}
