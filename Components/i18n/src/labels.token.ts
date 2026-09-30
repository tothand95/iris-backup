// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.

import { computed, inject, InjectionToken, Signal } from '@angular/core';
import { DEFAULT_IRIS_LABELS, IrisLabelKey, IrisLabelMap } from './labels.model';

/**
 * Resolved label map for the application.
 *
 * Defaults to the built-in English labels, so components work without any
 * configuration. Override it with `provideIrisUiLocalization()`.
 */
export const IRIS_LABELS = new InjectionToken<IrisLabelMap>('IrisLabels', {
  providedIn: 'root',
  factory: () => DEFAULT_IRIS_LABELS
});

/** Keys whose label is a plain string signal, i.e. everything except the composed messages. */
export type IrisStringLabelKey = {
  [K in IrisLabelKey]: IrisLabelMap[K] extends Signal<string> ? K : never;
}[IrisLabelKey];

/**
 * Reads a label, letting a per-call input win when it is set.
 *
 * The label is returned as a signal and read inside the component's own
 * template, so a language change updates components that are already on
 * screen — including overlays.
 *
 * Must be called from an injection context.
 */
export function irisLabel(key: IrisStringLabelKey, override?: Signal<string | undefined>): Signal<string> {
  const configured = inject(IRIS_LABELS)[key];
  const builtIn = DEFAULT_IRIS_LABELS[key];
  // The built-in label also covers the gap while an i18n library is still
  // loading its translation file, so an element never has a blank name.
  return computed(() => override?.() || configured() || builtIn());
}

/**
 * Reads a composed label, such as a screen-reader announcement built from
 * several values.
 *
 * Must be called from an injection context.
 */
export function irisLabelFor<K extends IrisLabelKey>(key: K): IrisLabelMap[K] {
  return inject(IRIS_LABELS)[key];
}
