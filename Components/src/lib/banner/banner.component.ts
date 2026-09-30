// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, effect, input, output } from '@angular/core';
import { irisLabel, irisLabelFor } from '@oneidentity/iris-ui/i18n';
import { IrisIconComponent } from '../icon/icon.component';
import { BannerType } from './banner.model';

@Component({
  selector: 'iris-banner',
  standalone: true,
  imports: [IrisIconComponent],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IrisBannerComponent {
  type = input<BannerType>('info');
  colored = input(false);
  dismissable = input(true);
  /** Per-instance override. Leave unset to use the application label from `provideIrisUiLocalization()`. */
  dismissAriaLabel = input('');
  title = input('');
  supportingText = input('');
  showActions = input(false);
  /** Visible text of the primary action. Required whenever `showActions` is set. */
  primaryActionLabel = input('');
  /** Visible text of the secondary action. Required whenever `showActions` is set. */
  secondaryActionLabel = input('');
  dismissed = output<void>();
  primaryActionClick = output<void>();
  secondaryActionClick = output<void>();

  visible = true;

  protected readonly dismissLabel = irisLabel('banner.dismiss', this.dismissAriaLabel);
  private readonly infoLabel = irisLabel('banner.info');
  private readonly warningLabel = irisLabel('banner.warning');
  private readonly errorLabel = irisLabel('banner.error');
  private readonly successLabel = irisLabel('banner.success');
  private readonly announcementFormat = irisLabelFor('banner.announcement');

  protected readonly typeLabel = computed(() => {
    const labels: Record<BannerType, string> = {
      info: this.infoLabel(),
      warning: this.warningLabel(),
      error: this.errorLabel(),
      success: this.successLabel()
    };
    return labels[this.type()];
  });

  /**
   * Full screen-reader announcement. Composed by the label so that word order
   * and separator stay translatable, rather than concatenated in the template.
   */
  protected readonly announcement = computed(() => this.announcementFormat()(this.typeLabel(), this.title()));

  /** Mirrors the toast pattern: an action with no label renders nothing rather than an empty button. */
  protected readonly hasPrimaryAction = computed(() => this.primaryActionLabel().trim().length > 0);
  protected readonly hasSecondaryAction = computed(() => this.secondaryActionLabel().trim().length > 0);

  constructor() {
    if (ngDevMode) {
      effect(() => {
        if (this.showActions() && !(this.hasPrimaryAction() || this.hasSecondaryAction())) {
          console.warn(
            'iris-banner: showActions is set but primaryActionLabel and secondaryActionLabel are both empty, ' +
              'so no action renders. These are visible button labels and are not translated by provideIrisUiLocalization().'
          );
        }
      });
    }
  }

  dismiss(): void {
    this.visible = false;
    this.dismissed.emit();
  }
}

export type { BannerAction, BannerType } from './banner.model';
