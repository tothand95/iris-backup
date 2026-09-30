// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { IrisAvatarComponent } from '../../../lib/avatar/avatar.component';
import { IrisButtonComponent } from '../../../lib/button/button.component';
import { IrisIconComponent } from '../../../lib/icon/icon.component';
import { irisLabel } from '@oneidentity/iris-ui/i18n';
import { IRIS_APP_LAYOUT } from '../app-layout.model';
import { IrisAppAiCtaComponent } from '../app-ai-cta/app-ai-cta.component';

/**
 * Top bar of the application shell, holding the sidebar toggle and projected header content. Inside `iris-app-layout` the
 * toggle drives the layout directly; used on its own it emits `sidebarToggle` instead.
 */
@Component({
  selector: 'iris-app-global-header',
  standalone: true,
  imports: [IrisAvatarComponent, IrisButtonComponent, IrisIconComponent, IrisAppAiCtaComponent],
  templateUrl: './app-global-header.component.html',
  styleUrl: './app-global-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IrisAppGlobalHeaderComponent {
  /** Per-instance override. Leave unset to use the application label from `provideIrisUiLocalization()`. */
  sidebarToggleAriaLabel = input('');
  protected readonly sidebarToggleLabel = irisLabel('appGlobalHeader.toggleSidebar', this.sidebarToggleAriaLabel);
  sidebarToggle = output<void>();

  protected readonly layout = inject(IRIS_APP_LAYOUT, { optional: true });
  protected readonly sidebarExpanded = computed(() => (this.layout ? !this.layout.collapsed() : true));

  protected toggleSidebar(): void {
    if (this.layout) {
      this.layout.toggleCollapsed();
      return;
    }
    this.sidebarToggle.emit();
  }
}
