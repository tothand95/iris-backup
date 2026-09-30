// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { irisLabel } from '@oneidentity/iris-ui/i18n';
import { AppNavGroup, IRIS_APP_LAYOUT, isNavExpandable } from '../app-layout.model';
import { IrisAppNavExpandableComponent } from '../app-nav-expandable/app-nav-expandable.component';
import { IrisAppNavGroupComponent } from '../app-nav-group/app-nav-group.component';
import { IrisAppNavItemComponent } from '../app-nav-item/app-nav-item.component';

/**
 * Primary navigation rail of the application shell. Renders the data-driven `groups` ahead of any projected navigation, and
 * hides itself while the enclosing layout is collapsed.
 */
@Component({
  selector: 'iris-app-global-sidebar',
  standalone: true,
  imports: [IrisAppNavGroupComponent, IrisAppNavExpandableComponent, IrisAppNavItemComponent],
  templateUrl: './app-global-sidebar.component.html',
  styleUrl: './app-global-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[hidden]': 'isCollapsed()'
  }
})
export class IrisAppGlobalSidebarComponent {
  /** Per-instance override. Leave unset to use the application label from `provideIrisUiLocalization()`. */
  ariaLabel = input('');
  protected readonly navLabel = irisLabel('appGlobalSidebar.label', this.ariaLabel);
  /** Data-driven navigation groups. Rendered before any projected content. */
  groups = input<AppNavGroup[]>([]);
  /** Active nav item id — used to highlight the matching data-driven item. */
  activeId = input('');
  /** Emitted when a data-driven nav item is selected. */
  itemSelected = output<string>();

  protected readonly layout = inject(IRIS_APP_LAYOUT, { optional: true });
  protected readonly isCollapsed = computed(() => this.layout?.collapsed() ?? false);
  protected readonly isNavExpandable = isNavExpandable;
}
