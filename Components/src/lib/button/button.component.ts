// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { IrisIconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon.model';
import { ButtonSize, ButtonStyle } from './button.model';

@Component({
  selector: 'iris-button',
  standalone: true,
  imports: [IrisIconComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IrisButtonComponent {
  variant = input<ButtonStyle>('primary');
  size = model<ButtonSize>('default');
  disabled = input(false);

  /** Icon rendered before the label. */
  leadingIconName = input<IconName | ''>('');

  /** Icon rendered after the label. */
  trailingIconName = input<IconName | ''>('');

  /**
   * Hides the projected label visually while keeping it in the DOM as the button's accessible
   * name. A meaningful label must still be projected — it is what screen readers announce.
   */
  labelHidden = input(false);

  type = input<'button' | 'submit' | 'reset'>('button');

  protected readonly iconDisplaySize = computed(() => (this.size() === 'sm' ? 16 : 20));
}

export type { ButtonSize, ButtonState, ButtonStyle } from './button.model';
