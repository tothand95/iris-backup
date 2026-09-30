// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { IconName, IconSize } from './icon.model';

/**
 * The icon set is ~600 kB, so it is pulled in through a single dynamic import: bundlers emit it
 * as one separate chunk instead of inlining it into the consumer's main bundle.
 *
 * This state is module-scoped because it is shared by every `iris-icon` instance — the set is
 * fetched once and all components read the same resolved value.
 */
const iconSet = signal<Readonly<Partial<Record<IconName, string>>> | null>(null);
let iconSetRequested = false;

function loadIconSet(): void {
  if (iconSetRequested) {
    return;
  }
  iconSetRequested = true;
  void import('@oneidentity/iris-ui-icons/icons').then((module) => iconSet.set(module as Readonly<Partial<Record<IconName, string>>>));
}

@Component({
  selector: 'iris-icon',
  standalone: true,
  imports: [],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IrisIconComponent {
  private readonly sanitizer = inject(DomSanitizer);

  constructor() {
    loadIconSet();
  }

  name = input.required<IconName>();
  size = input<IconSize>(24);
  label = input<string>('');
  decorative = input(false);

  readonly effectiveLabel = computed(() => this.label() || this.name());

  readonly svgContent = computed(() => {
    const svg = iconSet()?.[this.name()];
    return svg ? this.sanitizer.bypassSecurityTrustHtml(svg) : null;
  });
}

export type { IconName, IconSize } from './icon.model';
