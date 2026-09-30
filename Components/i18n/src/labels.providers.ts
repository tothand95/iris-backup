// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.

import { EnvironmentProviders, isSignal, makeEnvironmentProviders, signal, Signal } from '@angular/core';
import { DEFAULT_IRIS_LABELS, IrisLabelKey, IrisLabelMap } from './labels.model';
import { IRIS_LABELS } from './labels.token';

/**
 * Accepted form of a single label: either the plain value, or a signal of it.
 *
 * Plain values suit a single-language application; signals let the label track
 * the active language of an i18n library.
 */
type IrisLabelInput<T> = T extends Signal<infer V> ? V | Signal<V> : never;

/** Labels as supplied by the application, before they are normalised to signals. */
export type IrisLabelConfig = {
  [K in IrisLabelKey]?: IrisLabelInput<IrisLabelMap[K]>;
};

/** Application-wide Iris UI configuration. */
export interface IrisUiLocalizationConfig {
  /**
   * Accessibility labels.
   *
   * Supply a plain string for a fixed translation, or a signal to have the
   * label follow the active language at runtime.
   *
   * Partial: any key left out keeps its built-in English default, so adding a
   * label to Iris never breaks an existing application. To be told at compile
   * time when a new label appears, type your own map with `IrisLabelKey`.
   */
  labels?: IrisLabelConfig;
}

/**
 * Configures Iris UI for the application.
 *
 * Pass a config object, or a factory when the labels need to be resolved from
 * other services — the factory runs inside an injection context, so it can
 * `inject()` a translation service:
 *
 * ```ts
 * provideIrisUiLocalization({ labels: { 'toast.dismiss': 'Schließen' } });
 *
 * provideIrisUiLocalization(() => {
 *   const t = inject(TranslocoService);
 *   return { labels: { 'toast.dismiss': toSignal(t.selectTranslate('iris.toast.dismiss'), { initialValue: '' }) } };
 * });
 * ```
 */
export function provideIrisUiLocalization(config: IrisUiLocalizationConfig | (() => IrisUiLocalizationConfig) = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: IRIS_LABELS,
      useFactory: () => resolveLabels(typeof config === 'function' ? config() : config)
    }
  ]);
}

function resolveLabels(config: IrisUiLocalizationConfig): IrisLabelMap {
  const overrides = Object.entries(config.labels ?? {})
    // An explicit `undefined` must not shadow the English default.
    .filter(([, label]) => label !== undefined)
    // `isSignal` rather than `typeof === 'function'`: the composed labels are
    // themselves functions, so a plain one must still be wrapped in a signal.
    .map(([key, label]) => [key, isSignal(label) ? label : signal(label).asReadonly()]);

  return { ...DEFAULT_IRIS_LABELS, ...Object.fromEntries(overrides) } as IrisLabelMap;
}
