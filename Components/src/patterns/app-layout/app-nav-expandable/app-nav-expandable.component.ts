// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import type { IconName } from '../../../lib/icon/icon.model';
import { ChangeDetectionStrategy, Component, contentChildren, effect, input, model } from '@angular/core';
import { IrisIconComponent } from '../../../lib/icon/icon.component';
import { IrisAppNavItemComponent } from '../app-nav-item/app-nav-item.component';

/** Navigation entry that expands to reveal nested `iris-app-nav-item` children, indenting each projected item. */
@Component({
  selector: 'iris-app-nav-expandable',
  standalone: true,
  imports: [IrisIconComponent],
  templateUrl: './app-nav-expandable.component.html',
  styleUrl: './app-nav-expandable.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IrisAppNavExpandableComponent {
  label = input.required<string>();
  icon = input<IconName | ''>('');
  expanded = model(false);

  private readonly childItems = contentChildren(IrisAppNavItemComponent);

  constructor() {
    effect(() => {
      this.childItems().forEach((item) => item._setChild(true));
    });
  }

  protected toggle(): void {
    this.expanded.set(!this.expanded());
  }
}
