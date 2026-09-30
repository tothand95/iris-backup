// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IrisIconComponent } from '../icon/icon.component';
import { irisLabel, irisLabelFor } from '@oneidentity/iris-ui/i18n';
import { ToastType } from './toast.model';

@Component({
  selector: 'iris-toast',
  standalone: true,
  imports: [IrisIconComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IrisToastComponent {
  type = input<ToastType>('info');
  title = input('');
  supportingText = input('');
  primaryActionLabel = input('');
  secondaryActionLabel = input('');
  dismissible = input(true);
  /** Per-instance override. Leave unset to use the application label from `provideIrisUiLocalization()`. */
  dismissAriaLabel = input('');
  /** Per-instance override. Leave unset to use the application label from `provideIrisUiLocalization()`. */
  infoAriaLabel = input('');
  /** Per-instance override. Leave unset to use the application label from `provideIrisUiLocalization()`. */
  warningAriaLabel = input('');
  /** Per-instance override. Leave unset to use the application label from `provideIrisUiLocalization()`. */
  errorAriaLabel = input('');
  /** Per-instance override. Leave unset to use the application label from `provideIrisUiLocalization()`. */
  successAriaLabel = input('');
  dismissed = output<void>();
  primaryAction = output<void>();
  secondaryAction = output<void>();

  protected readonly dismissLabel = irisLabel('toast.dismiss', this.dismissAriaLabel);
  private readonly infoLabel = irisLabel('toast.info', this.infoAriaLabel);
  private readonly warningLabel = irisLabel('toast.warning', this.warningAriaLabel);
  private readonly errorLabel = irisLabel('toast.error', this.errorAriaLabel);
  private readonly successLabel = irisLabel('toast.success', this.successAriaLabel);
  private readonly announcementFormat = irisLabelFor('toast.announcement');

  protected readonly liveRole = computed(() => (this.type() === 'error' || this.type() === 'warning' ? 'alert' : 'status'));

  protected readonly typeLabel = computed(() => {
    const map: Record<ToastType, string> = {
      info: this.infoLabel(),
      warning: this.warningLabel(),
      error: this.errorLabel(),
      success: this.successLabel()
    };
    return map[this.type()];
  });

  /**
   * Full screen-reader announcement. Composed by the label so that word order
   * and separator stay translatable, rather than concatenated in the template.
   */
  protected readonly announcement = computed(() => this.announcementFormat()(this.typeLabel(), this.title()));

  protected readonly hasPrimaryAction = computed(() => this.primaryActionLabel().trim().length > 0);

  protected readonly hasSecondaryAction = computed(() => this.secondaryActionLabel().trim().length > 0);

  dismiss(): void {
    this.dismissed.emit();
  }
}

export type { ToastType } from './toast.model';
