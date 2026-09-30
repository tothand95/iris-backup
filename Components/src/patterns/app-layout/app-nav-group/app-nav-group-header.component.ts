// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { IrisIconComponent } from '../../../lib/icon/icon.component';

/** Header row of a navigation group. Toggles the group when `collapsible` is set. */
@Component({
  selector: 'iris-app-nav-group-header',
  standalone: true,
  imports: [IrisIconComponent],
  templateUrl: './app-nav-group-header.component.html',
  styleUrl: './app-nav-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IrisAppNavGroupHeaderComponent {
  label = input.required<string>();
  collapsible = input(false);
  expanded = model(true);

  protected toggleExpanded(): void {
    if (this.collapsible()) {
      this.expanded.set(!this.expanded());
    }
  }
}
