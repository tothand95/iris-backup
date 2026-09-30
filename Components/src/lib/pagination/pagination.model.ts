// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
/** Visual variant of the pagination control. `'simplified'` hides individual page buttons and shows only prev/next. */
export type PaginationType = 'default' | 'simplified';

/**
 * Which control the user activated.
 *
 * A cursor paged consumer switches on this and ignores `page`, because it
 * cannot address a page by number — it only knows how to step forward or back.
 */
export type PaginationChangeReason = 'next' | 'previous' | 'jump';

/** Event payload emitted by the pagination component on every page change. */
export interface PaginationChangeEvent {
  /** The newly selected page number (1-based). */
  page: number;
  /** The page number active before the change (1-based). */
  previousPage: number;
  /** Value of the `totalPages` input, or `undefined` for a cursor source that cannot count. */
  totalPages: number | undefined;
  /** The control that produced this event. */
  reason: PaginationChangeReason;
}
