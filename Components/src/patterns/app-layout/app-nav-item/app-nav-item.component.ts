// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import type { IconName } from '../../../lib/icon/icon.model';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { IrisIconComponent } from '../../../lib/icon/icon.component';

/** Single navigation entry with an optional icon. Renders as a link when `href` is set, otherwise emits `select`. */
@Component({
  selector: 'iris-app-nav-item',
  standalone: true,
  imports: [IrisIconComponent, NgTemplateOutlet],
  templateUrl: './app-nav-item.component.html',
  styleUrl: './app-nav-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IrisAppNavItemComponent {
  label = input.required<string>();
  icon = input<IconName | ''>('');
  active = input(false);
  disabled = input(false);
  href = input('');
  /** Renders the item as a child inside a parent expandable item (adds indent + tree trail). */
  child = input(false);
  // eslint-disable-next-line @angular-eslint/no-output-native -- Public API requires `(select)` for nav item activation.
  select = output<void>();

  /** @internal Set by IrisAppNavExpandableComponent to mark this item as a child. */
  readonly isChild = signal(false);

  /** @internal Called by IrisAppNavExpandableComponent. */
  _setChild(value: boolean): void {
    this.isChild.set(value);
  }

  protected get showAsChild(): boolean {
    return this.child() || this.isChild();
  }

  protected onSelect(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      return;
    }
    this.select.emit();
  }
}
