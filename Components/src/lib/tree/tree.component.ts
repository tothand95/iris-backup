// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, input, model, output } from '@angular/core';
import { irisLabel } from '@oneidentity/iris-ui/i18n';
import { IrisIconComponent } from '../icon/icon.component';
import { IrisCheckboxComponent } from '../checkbox/checkbox.component';
import type { IconName } from '../icon/icon.model';
import { IrisSpinnerComponent } from '../spinner/spinner.component';
import { TreeCheckedChange, TreeExpandedChange, TreeIconResolver, TreeNode } from './tree.model';

@Component({
  selector: 'iris-tree',
  standalone: true,
  imports: [NgTemplateOutlet, IrisIconComponent, IrisSpinnerComponent, IrisCheckboxComponent],
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IrisTreeComponent {
  private readonly elementRef = inject(ElementRef);

  nodes = input<readonly TreeNode[]>([]);
  /** Id of the active row. Two-way bindable — the tree sets it on activation and emits `activeNodeIdChange`. */
  activeNodeId = model<string | null>(null);
  /** When `true`, activating a node also opens it. Collapsing stays on the toggle and ArrowLeft. */
  expandOnActivate = input(false);
  /** Renders a single disabled row when an open node turns out to have no children. */
  showEmptyGroup = input(false);
  /** Renders a checkbox on every row, dimmed at rest and kept fully visible while ticked. */
  checkable = input(false);
  /** Replaces the built-in folder/leaf icon resolution. */
  iconResolver = input<TreeIconResolver | undefined>(undefined);
  showTrailingIcons = input(true);
  ariaLabel = input('');
  /** Per-instance override. Leave unset to use the application label from `provideIrisUiLocalization()`. */
  collapseAriaLabel = input('');
  /** Per-instance override. Leave unset to use the application label from `provideIrisUiLocalization()`. */
  expandAriaLabel = input('');
  /** Per-instance override. Leave unset to use the application label from `provideIrisUiLocalization()`. */
  loadingAriaLabel = input('');
  /** Per-instance override. Leave unset to use the application label from `provideIrisUiLocalization()`. */
  emptyGroupLabel = input('');
  /** Per-instance override. Leave unset to use the application label from `provideIrisUiLocalization()`. */
  checkAriaLabel = input('');
  /** Per-instance override. Leave unset to use the application label from `provideIrisUiLocalization()`. */
  uncheckAriaLabel = input('');

  nodeExpandedChange = output<TreeExpandedChange>();
  nodeCheckedChange = output<TreeCheckedChange>();

  protected readonly collapseLabel = irisLabel('tree.collapse', this.collapseAriaLabel);
  protected readonly expandLabel = irisLabel('tree.expand', this.expandAriaLabel);
  protected readonly loadingLabel = irisLabel('tree.loading', this.loadingAriaLabel);
  protected readonly emptyLabel = irisLabel('tree.empty', this.emptyGroupLabel);
  protected readonly checkLabel = irisLabel('tree.check', this.checkAriaLabel);
  protected readonly uncheckLabel = irisLabel('tree.uncheck', this.uncheckAriaLabel);

  /** Whether the node renders an expand toggle, even when its children have not arrived yet. */
  isExpandable(node: TreeNode): boolean {
    return node.expandable ?? (node.children?.length ?? 0) > 0;
  }

  isExpanded(node: TreeNode): boolean {
    return node.expanded ?? false;
  }

  isChecked(node: TreeNode): boolean {
    return node.checkState === 'checked';
  }

  isIndeterminate(node: TreeNode): boolean {
    return node.checkState === 'mixed';
  }

  onCheckClick(event: Event, node: TreeNode): void {
    event.stopPropagation();
    this.emitChecked(node);
  }

  onNodeClick(node: TreeNode): void {
    this.activate(node);
    if (this.expandOnActivate() && this.canToggle(node) && !this.isExpanded(node)) {
      this.setExpanded(node, true);
    }
  }

  onToggle(event: Event, node: TreeNode): void {
    event.stopPropagation();
    if (!this.canToggle(node)) {
      return;
    }
    this.setExpanded(node, !this.isExpanded(node));
  }

  onNodeKeydown(event: KeyboardEvent, node: TreeNode): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.activate(node);
    }
    if (event.key === ' ') {
      event.preventDefault();
      if (this.checkable()) {
        this.emitChecked(node);
      } else {
        this.activate(node);
      }
    }
    if (event.key === 'ArrowRight' && this.canToggle(node) && !this.isExpanded(node)) {
      event.preventDefault();
      this.setExpanded(node, true);
    }
    if (event.key === 'ArrowLeft' && this.canToggle(node) && this.isExpanded(node)) {
      event.preventDefault();
      this.setExpanded(node, false);
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.moveFocus(event.target as HTMLElement, event.key === 'ArrowDown' ? 1 : -1);
    }
  }

  indentGuides(level: number, ancestorIndentGuideArray: boolean[], isLast: boolean): { isLast: boolean }[] {
    return Array.from({ length: level }, (_, k) => ({
      isLast: k === level - 1 ? isLast : (ancestorIndentGuideArray[k] ?? false)
    }));
  }

  buildNestedIndentGuides(ancestorIndentGuideArray: boolean[], isLast: boolean, level: number): boolean[] {
    if (level === 0) {
      return [];
    }
    return [...ancestorIndentGuideArray, isLast];
  }

  resolveNodeIcon(node: TreeNode): IconName {
    const expanded = this.isExpanded(node);
    const expandable = this.isExpandable(node);
    const resolver = this.iconResolver();
    if (resolver) {
      return resolver(node, { expanded, expandable, active: node.id === this.activeNodeId() });
    }
    if (!node.icon) {
      if (expandable) {
        return expanded ? 'FolderOpen' : 'Folder';
      }
      return 'Placeholder';
    }
    if (node.icon === 'Folder' && expanded) {
      return 'FolderOpen';
    }
    return node.icon;
  }

  /** `true` when an open node resolved to a loaded but empty level. */
  protected isEmptyGroup(node: TreeNode): boolean {
    return this.showEmptyGroup() && !node.loading && node.children !== undefined && node.children.length === 0;
  }

  private canToggle(node: TreeNode): boolean {
    return this.isExpandable(node) && !node.loading;
  }

  private activate(node: TreeNode): void {
    this.activeNodeId.set(node.id);
  }

  private setExpanded(node: TreeNode, expanded: boolean): void {
    this.nodeExpandedChange.emit({ node, expanded });
  }

  /** Mixed resolves to cleared, matching `iris-checkbox`. */
  private emitChecked(node: TreeNode): void {
    this.nodeCheckedChange.emit({ node, checked: this.isIndeterminate(node) ? false : !this.isChecked(node) });
  }

  private moveFocus(current: HTMLElement, direction: 1 | -1): void {
    const rows = Array.from(this.elementRef.nativeElement.querySelectorAll('.iris-tree__element')) as HTMLElement[];
    const index = rows.indexOf(current);
    rows[index + direction]?.focus();
  }
}

export type { TreeCheckedChange, TreeExpandedChange, TreeIconResolver, TreeIconState, TreeNode, TreeNodeState } from './tree.model';
