// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.

import { Signal, signal } from '@angular/core';

/**
 * Builds a constant label signal for the built-in English defaults.
 *
 * Labels are modelled as signals rather than strings so that a consumer can
 * back them with a runtime i18n library and have every label already on screen
 * update when the active language changes.
 */
function constant<T>(value: T): Signal<T> {
  return signal(value).asReadonly();
}

/**
 * Every localisable label in the library, keyed by `<component>.<label>`.
 *
 * Simple labels are `Signal<string>`. Labels that compose several values are
 * `Signal<(…) => string>` rather than concatenated in the template, because
 * word order and separators are language-specific.
 */
export interface IrisLabelMap {
  'appGlobalHeader.toggleSidebar': Signal<string>;

  'appGlobalSidebar.label': Signal<string>;

  'appLayout.resizeSidebar': Signal<string>;

  'appProductSwitcher.label': Signal<string>;
  'appProductSwitcher.home': Signal<string>;

  'banner.dismiss': Signal<string>;
  'banner.info': Signal<string>;
  'banner.warning': Signal<string>;
  'banner.error': Signal<string>;
  'banner.success': Signal<string>;
  /** Screen-reader announcement, e.g. `(typeLabel, title) => 'Error: Disk full'`. */
  'banner.announcement': Signal<(typeLabel: string, title: string) => string>;

  'breadcrumb.label': Signal<string>;
  'breadcrumb.showMore': Signal<string>;

  'buttonSplit.moreOptions': Signal<string>;

  'codeBlock.copy': Signal<string>;

  'modal.close': Signal<string>;

  'pagination.label': Signal<string>;
  'pagination.previous': Signal<string>;
  'pagination.next': Signal<string>;
  'pagination.previousPage': Signal<string>;
  'pagination.nextPage': Signal<string>;
  'pagination.position': Signal<(current: number, total: number | undefined) => string>;

  'sidesheet.close': Signal<string>;
  'sidesheet.maximize': Signal<string>;
  'sidesheet.restore': Signal<string>;

  'slider.minimumValue': Signal<string>;
  'slider.maximumValue': Signal<string>;

  'spinner.loading': Signal<string>;

  'stepper.progress': Signal<string>;

  'tag.remove': Signal<string>;

  'toast.dismiss': Signal<string>;
  'toast.info': Signal<string>;
  'toast.warning': Signal<string>;
  'toast.error': Signal<string>;
  'toast.success': Signal<string>;
  /** Screen-reader announcement, e.g. `(typeLabel, title) => 'Error: Upload failed'`. */
  'toast.announcement': Signal<(typeLabel: string, title: string) => string>;

  'tree.expand': Signal<string>;
  'tree.collapse': Signal<string>;
  'tree.loading': Signal<string>;
  'tree.empty': Signal<string>;
  'tree.check': Signal<string>;
  'tree.uncheck': Signal<string>;
}

/**
 * Key of a localisable label.
 *
 * Use it to make a translation map exhaustive, so that a label added by a
 * future Iris version becomes a compile error rather than an untranslated
 * string discovered in production:
 *
 * ```ts
 * const LABEL_PATHS = { … } satisfies Record<IrisLabelKey, string>;
 * ```
 */
export type IrisLabelKey = keyof IrisLabelMap;

/** Built-in English labels, used for any key the application does not provide. */
export const DEFAULT_IRIS_LABELS: IrisLabelMap = {
  'appGlobalHeader.toggleSidebar': constant('Toggle sidebar'),
  'appGlobalSidebar.label': constant('Primary'),
  'appLayout.resizeSidebar': constant('Resize sidebar'),
  'appProductSwitcher.label': constant('Product switcher'),
  'appProductSwitcher.home': constant('Home'),
  'banner.dismiss': constant('Dismiss'),
  'banner.info': constant('Info'),
  'banner.warning': constant('Warning'),
  'banner.error': constant('Error'),
  'banner.success': constant('Success'),
  'banner.announcement': constant((typeLabel: string, title: string) => `${typeLabel}: ${title}`),

  'breadcrumb.label': constant('Breadcrumb'),
  'breadcrumb.showMore': constant('Show more breadcrumb items'),

  'buttonSplit.moreOptions': constant('More options'),

  'codeBlock.copy': constant('Copy code'),

  'modal.close': constant('Close'),

  'pagination.label': constant('Pagination'),
  'pagination.previous': constant('Previous'),
  'pagination.next': constant('Next'),
  'pagination.previousPage': constant('Previous page'),
  'pagination.nextPage': constant('Next page'),
  'pagination.position': constant((current: number, total: number | undefined) =>
    total === undefined ? `Page ${current}` : `Page ${current} of ${total}`
  ),

  'sidesheet.close': constant('Close'),
  'sidesheet.maximize': constant('Maximize'),
  'sidesheet.restore': constant('Restore'),

  'slider.minimumValue': constant('Minimum value'),
  'slider.maximumValue': constant('Maximum value'),

  'spinner.loading': constant('Loading'),

  'stepper.progress': constant('Progress'),

  'tag.remove': constant('Remove'),

  'toast.dismiss': constant('Dismiss'),
  'toast.info': constant('Info'),
  'toast.warning': constant('Warning'),
  'toast.error': constant('Error'),
  'toast.success': constant('Success'),
  'toast.announcement': constant((typeLabel: string, title: string) => `${typeLabel}: ${title}`),

  'tree.expand': constant('Expand'),
  'tree.collapse': constant('Collapse'),
  'tree.loading': constant('Loading'),
  'tree.empty': constant('Empty'),
  'tree.check': constant('Check'),
  'tree.uncheck': constant('Uncheck')
};
