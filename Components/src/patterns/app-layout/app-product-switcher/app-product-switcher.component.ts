// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { irisLabel } from '@oneidentity/iris-ui/i18n';
import { IrisIconComponent } from '../../../lib/icon/icon.component';
import { IrisMenuDirective } from '../../../lib/menu/menu.directive';
import { MenuActionItem, MenuItem } from '../../../lib/menu/menu.model';
import { AppProduct, IRIS_APP_LAYOUT } from '../app-layout.model';

/**
 * Product branding and switcher at the top of the sidebar. Offers a menu when several products are configured, and collapses
 * to the logo alone while the enclosing layout is collapsed.
 */
@Component({
  selector: 'iris-app-product-switcher',
  standalone: true,
  imports: [NgTemplateOutlet, IrisIconComponent, IrisMenuDirective],
  templateUrl: './app-product-switcher.component.html',
  styleUrl: './app-product-switcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IrisAppProductSwitcherComponent {
  compact = input(false);
  products = input<AppProduct[]>([]);
  activeId = input('');
  logoSrc = input('');
  productChange = output<AppProduct>();
  logoClick = output<void>();

  protected readonly switcherLabel = irisLabel('appProductSwitcher.label');
  protected readonly homeLabel = irisLabel('appProductSwitcher.home');

  private readonly layout = inject(IRIS_APP_LAYOUT, { optional: true });

  /** Compact when explicitly requested or when the enclosing layout is collapsed. */
  protected readonly isCompact = computed(() => this.compact() || (this.layout?.collapsed() ?? false));

  /** Falls back to the generic home label when no product is configured. */
  protected readonly singleLabel = computed(() => this.products()[0]?.name || this.homeLabel());

  protected readonly showSingleName = computed(() => this.products().length === 1 && !this.isCompact());

  protected readonly activeProduct = computed(() => this.products().find((product) => product.id === this.activeId()) ?? this.products()[0]);
  protected readonly menuItems = computed<MenuItem[]>(() =>
    this.products().map((product) => ({
      id: product.id,
      type: 'item',
      label: product.name,
      icon: product.id === this.activeProduct()?.id ? 'Check' : product.icon
    }))
  );

  onMenuItemSelected(item: MenuActionItem): void {
    const product = this.products().find((candidate) => candidate.id === item.id);
    if (product) {
      this.productChange.emit(product);
    }
  }

  protected onLogoClick(): void {
    this.logoClick.emit();
  }
}
