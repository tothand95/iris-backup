// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IrisPaginationComponent, PaginationChangeEvent } from '@oneidentity/iris-ui';

interface DirectoryObject {
  name: string;
  type: string;
}

/** Stand-in for a keyset api: hands back an opaque cursor and never a total. */
const PAGE_COUNT = 4;
const PAGE_SIZE = 4;

const COLLECTION: DirectoryObject[] = [
  { name: 'Aaron Beck', type: 'User' },
  { name: 'Accounting', type: 'Group' },
  { name: 'Ada Whitfield', type: 'User' },
  { name: 'Admin Workstations', type: 'Computer' },
  { name: 'Ana Ruiz', type: 'User' },
  { name: 'Application Servers', type: 'Computer' },
  { name: 'Ben Okafor', type: 'User' },
  { name: 'Contractors', type: 'Group' },
  { name: 'Dana Leclerc', type: 'User' },
  { name: 'Engineering', type: 'Group' },
  { name: 'Eva Lindqvist', type: 'User' },
  { name: 'Facilities', type: 'Group' },
  { name: 'Finance Reports', type: 'Group' },
  { name: 'Grace Mbeki', type: 'User' },
  { name: 'Helpdesk', type: 'Group' },
  { name: 'Ivan Petrov', type: 'User' }
];

@Component({
  selector: 'story-pagination-cursor-demo',
  standalone: true,
  imports: [IrisPaginationComponent],
  template: `
    <div class="pagination-cursor-demo">
      <ul class="pagination-cursor-demo__rows" [class.pagination-cursor-demo__rows--loading]="loading()">
        @for (row of rows(); track row.name) {
          <li class="pagination-cursor-demo__row">
            <span class="pagination-cursor-demo__name">{{ row.name }}</span>
            <span class="pagination-cursor-demo__type">{{ row.type }}</span>
          </li>
        }
      </ul>

      <iris-pagination
        type="simplified"
        [currentPage]="page()"
        [hasNext]="hasNext()"
        [loading]="loading()"
        [showPosition]="true"
        (pageChange)="onPageChange($event)" />
    </div>
  `,
  styles: [
    `
      .pagination-cursor-demo {
        display: flex;
        flex-direction: column;
        gap: var(--oi-spacing-m);
        max-width: 320px;
      }

      .pagination-cursor-demo__rows {
        display: flex;
        flex-direction: column;
        margin: 0;
        padding: 0;
        list-style: none;
        transition: opacity var(--oi-motion-duration-short);
      }

      .pagination-cursor-demo__rows--loading {
        opacity: 0.4;
      }

      .pagination-cursor-demo__row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--oi-spacing-m);
        height: var(--oi-size-s);
        padding: 0 var(--oi-spacing-s);
        border-bottom: var(--oi-border-width-default) solid var(--oi-border-color-muted);
        font-family: var(--oi-font-family-default);
        font-size: var(--oi-font-size-s);
        color: var(--oi-content-color-primary);
      }

      .pagination-cursor-demo__type {
        font-size: var(--oi-font-size-xs);
        color: var(--oi-content-color-secondary);
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IrisPaginationCursorDemoComponent {
  protected readonly page = signal(1);
  protected readonly loading = signal(false);
  protected readonly rows = signal(this.pageRows(1));

  /** The api only ever says whether a cursor came back — never how many pages remain. */
  protected readonly hasNext = signal(true);

  /**
   * A cursor consumer acts on `reason` and ignores `page`, because it cannot
   * address a page by number — it can only step the cursor forward or back.
   */
  protected onPageChange(event: PaginationChangeEvent): void {
    const nextPage = event.reason === 'next' ? this.page() + 1 : this.page() - 1;
    this.loading.set(true);

    setTimeout(() => {
      this.page.set(nextPage);
      this.rows.set(this.pageRows(nextPage));
      this.hasNext.set(nextPage < PAGE_COUNT);
      this.loading.set(false);
    }, 600);
  }

  private pageRows(page: number): DirectoryObject[] {
    return COLLECTION.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }
}
