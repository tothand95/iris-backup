// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { IrisAppNavGroupHeaderComponent } from './app-nav-group-header.component';

/** Labelled section of sidebar navigation, optionally collapsible. */
@Component({
  selector: 'iris-app-nav-group',
  standalone: true,
  imports: [IrisAppNavGroupHeaderComponent],
  templateUrl: './app-nav-group.component.html',
  styleUrl: './app-nav-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IrisAppNavGroupComponent {
  label = input('');
  collapsible = input(false);
  expanded = model(true);
}
