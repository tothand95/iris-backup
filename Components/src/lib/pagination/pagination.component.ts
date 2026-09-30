// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, input, output } from '@angular/core';
import { irisLabel, irisLabelFor } from '@oneidentity/iris-ui/i18n';
import { IrisIconComponent } from '../icon/icon.component';
import { PaginationChangeEvent, PaginationChangeReason, PaginationType } from './pagination.model';

@Component({
  selector: 'iris-pagination',
  standalone: true,
  imports: [CommonModule, IrisIconComponent],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IrisPaginationComponent {
  type = input<PaginationType>('default');
  /** Per-instance override. Leave unset to use the application label from `provideIrisUiLocalization()`. */
  ariaLabel = input('');
  protected readonly navLabel = irisLabel('pagination.label', this.ariaLabel);
  protected readonly previousLabel = irisLabel('pagination.previous');
  protected readonly nextLabel = irisLabel('pagination.next');
  protected readonly previousPageLabel = irisLabel('pagination.previousPage');
  protected readonly nextPageLabel = irisLabel('pagination.nextPage');
  protected readonly positionFormat = irisLabelFor('pagination.position');

  /** Number of pages in the collection. Ignored when `hasNext`/`hasPrevious` are set. */
  totalPages = input(1);
  currentPage = input(1);
  maxVisiblePages = input(5);

  /**
   * Whether another page exists, for cursor/keyset sources that cannot count.
   *
   * Requires `type="simplified"` — a page the consumer cannot address cannot
   * be rendered as a numbered button.
   * The `totalPages` is ignored and reported as `undefined` on `pageChange`.
   */
  hasNext = input<boolean | undefined>(undefined);
  /** Counterpart of `hasNext`. Defaults to "not on the first page" when left unset. */
  hasPrevious = input<boolean | undefined>(undefined);
  /** Disables every control and marks the `nav` busy while the consumer fetches a page. */
  loading = input(false);
  /** Renders the localized position indicator between the buttons of `type="simplified"`. */
  showPosition = input(false);

  pageChange = output<PaginationChangeEvent>();

  /** True once the consumer declares page existence itself, i.e. there is no meaningful total. */
  protected readonly isCursorSource = computed(() => this.hasNext() !== undefined || this.hasPrevious() !== undefined);
  /** The total to report and display, or `undefined` when the collection cannot be counted. */
  protected readonly knownTotal = computed(() => (this.isCursorSource() ? undefined : this.totalPages()));
  protected readonly positionText = computed(() => this.positionFormat()(this.currentPage(), this.knownTotal()));

  visiblePages = computed<(number | 'separator')[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxVisible = this.maxVisiblePages();

    if (total <= maxVisible + 2) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    const pages: (number | 'separator')[] = [];
    const halfVisible = Math.floor(maxVisible / 2);

    let startPage = Math.max(2, current - halfVisible);
    let endPage = Math.min(total - 1, current + halfVisible);

    if (current <= halfVisible + 1) {
      endPage = Math.min(maxVisible, total - 1);
    }

    if (current >= total - halfVisible) {
      startPage = Math.max(2, total - maxVisible + 1);
    }

    pages.push(1);

    if (startPage > 2) {
      pages.push('separator');
    }

    for (let page = startPage; page <= endPage; page++) {
      pages.push(page);
    }

    if (endPage < total - 1) {
      pages.push('separator');
    }

    pages.push(total);

    return pages;
  });

  hasPreviousPage = computed(() => this.hasPrevious() ?? this.currentPage() > 1);
  // Once hasNext/hasPrevious are bound, an unset flag means "the api did not hand
  // back a cursor", never "consult totalPages" — falling back to the count there
  // would reintroduce the fabricated total this component exists to avoid.
  hasNextPage = computed(() => this.hasNext() ?? (this.isCursorSource() ? false : this.currentPage() < this.totalPages()));

  constructor() {
    if (ngDevMode) {
      effect(() => {
        if (this.isCursorSource() && this.type() === 'default') {
          console.warn(
            'iris-pagination: hasNext/hasPrevious describe a cursor source, which cannot address a page by number, ' +
              'but type="default" renders numbered page buttons. Use type="simplified".'
          );
        }
        if (this.isCursorSource() && this.totalPages() !== 1) {
          console.warn('iris-pagination: totalPages is ignored while hasNext or hasPrevious is set.');
        }
        if (this.isCursorSource() && this.hasNext() === undefined) {
          console.warn('iris-pagination: hasPrevious is set without hasNext, so Next is permanently disabled.');
        }
        if (!this.isCursorSource() && this.totalPages() === 1 && this.type() === 'simplified') {
          console.warn(
            'iris-pagination: Next is permanently disabled because totalPages is 1. ' +
              'Bind totalPages, or bind hasNext for a cursor source that cannot count.'
          );
        }
      });
    }
  }

  /**
   * Jumps to an addressable page.
   *
   * Inert for a cursor source: the consumer has no way to reach an arbitrary
   * page, so emitting one would hand it a destination it cannot honour.
   */
  goToPage(page: number): void {
    if (this.loading() || this.isCursorSource()) {
      return;
    }
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.emit(page, 'jump');
    }
  }

  goToPreviousPage(): void {
    if (!this.loading() && this.hasPreviousPage()) {
      this.emit(this.currentPage() - 1, 'previous');
    }
  }

  goToNextPage(): void {
    if (!this.loading() && this.hasNextPage()) {
      this.emit(this.currentPage() + 1, 'next');
    }
  }

  // Stepping is guarded by hasNextPage/hasPreviousPage alone, never by totalPages,
  // so a cursor source can advance without inventing a total it does not have.
  private emit(page: number, reason: PaginationChangeReason): void {
    this.pageChange.emit({ page, previousPage: this.currentPage(), totalPages: this.knownTotal(), reason });
  }
}

export type { PaginationChangeEvent, PaginationChangeReason, PaginationType } from './pagination.model';
