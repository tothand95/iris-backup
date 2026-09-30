// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IrisIconComponent } from '../../../lib/icon/icon.component';

/** Call-to-action that launches the application's AI assistant. Sits in the global header. */
@Component({
  selector: 'iris-app-ai-cta',
  standalone: true,
  imports: [IrisIconComponent],
  templateUrl: './app-ai-cta.component.html',
  styleUrl: './app-ai-cta.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IrisAppAiCtaComponent {
  label = input('Ask AI');
  disabled = input(false);
  activate = output<void>();

  protected onActivate(): void {
    if (!this.disabled()) {
      this.activate.emit();
    }
  }
}
