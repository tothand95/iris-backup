// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IrisIconComponent } from '../icon/icon.component';
import { irisLabel } from '@oneidentity/iris-ui/i18n';
import { CodeBlockType, CodeInlineVariant } from './code-blocks.model';

@Component({
  selector: 'iris-code-blocks',
  standalone: true,
  imports: [CommonModule, IrisIconComponent],
  templateUrl: './code-blocks.component.html',
  styleUrl: './code-blocks.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.iris-code-blocks-host--full-width]': 'isFullWidth()'
  }
})
export class IrisCodeBlocksComponent {
  protected readonly copyLabel = irisLabel('codeBlock.copy');

  /** Display mode: inline snippet, single-line block, or multi-line block. */
  type = input<CodeBlockType>('multi-line');

  /** Visual variant for inline type only. */
  variant = input<CodeInlineVariant>('default');

  /** The code content to display. */
  code = input('');

  /** Whether to show line numbers (multi-line only). */
  showLineNumbers = input(true);

  /** Stretch block modes to fill the container width instead of fitting content. */
  fullWidth = input(false);

  /** Emits when the user clicks the copy button. */
  copied = output<string>();

  /** Whether the full-width layout applies (block modes only). */
  readonly isFullWidth = computed(() => this.fullWidth() && this.type() !== 'inline');

  /** Computed array of code lines for multi-line rendering. */
  readonly codeLines = computed(() => this.code().split('\n'));

  /** Newline-joined line numbers (1..N) for the multi-line gutter. */
  readonly lineNumbers = computed(() =>
    this.codeLines()
      .map((_, index) => index + 1)
      .join('\n')
  );

  async copyToClipboard(): Promise<void> {
    await navigator.clipboard.writeText(this.code());
    this.copied.emit(this.code());
  }
}

export type { CodeBlockType, CodeInlineVariant } from './code-blocks.model';
