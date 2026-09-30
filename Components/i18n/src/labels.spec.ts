// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.

import { inject, InjectionToken, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { provideIrisUiLocalization } from './labels.providers';
import { IRIS_LABELS, irisLabel, irisLabelFor } from './labels.token';

/** Stands in for a translation service in the factory test. */
const TRANSLATIONS = new InjectionToken<Record<string, string>>('TestTranslations');

describe('Iris labels', () => {
  it('falls back to the built-in English label when unconfigured', () => {
    TestBed.configureTestingModule({});
    const label = TestBed.runInInjectionContext(() => irisLabel('toast.dismiss'));
    expect(label()).toBe('Dismiss');
  });

  it('accepts a plain string override', () => {
    TestBed.configureTestingModule({
      providers: [provideIrisUiLocalization({ labels: { 'toast.dismiss': 'Schliessen' } })]
    });
    const label = TestBed.runInInjectionContext(() => irisLabel('toast.dismiss'));
    expect(label()).toBe('Schliessen');
  });

  it('keeps defaults for keys the application does not configure', () => {
    TestBed.configureTestingModule({
      providers: [provideIrisUiLocalization({ labels: { 'toast.dismiss': 'Schliessen' } })]
    });
    const label = TestBed.runInInjectionContext(() => irisLabel('modal.close'));
    expect(label()).toBe('Close');
  });

  it('tracks a signal override so a language switch re-renders', () => {
    const dismiss = signal('Dismiss');
    TestBed.configureTestingModule({
      providers: [provideIrisUiLocalization({ labels: { 'toast.dismiss': dismiss } })]
    });
    const label = TestBed.runInInjectionContext(() => irisLabel('toast.dismiss'));

    expect(label()).toBe('Dismiss');
    dismiss.set('Elutasit');
    expect(label()).toBe('Elutasit');
  });

  it('wraps a plain composed label instead of mistaking it for a signal', () => {
    TestBed.configureTestingModule({
      providers: [
        provideIrisUiLocalization({
          labels: { 'toast.announcement': (type: string, title: string) => `${type} - ${title}` }
        })
      ]
    });
    const announcement = TestBed.runInInjectionContext(() => irisLabelFor('toast.announcement'));
    expect(announcement()('Info', 'Saved')).toBe('Info - Saved');
  });

  it('ignores an explicit undefined rather than shadowing the default', () => {
    TestBed.configureTestingModule({
      providers: [provideIrisUiLocalization({ labels: { 'toast.dismiss': undefined } })]
    });
    const label = TestBed.runInInjectionContext(() => irisLabel('toast.dismiss'));
    expect(label()).toBe('Dismiss');
  });

  it('lets a per-instance override win over the application label', () => {
    TestBed.configureTestingModule({
      providers: [provideIrisUiLocalization({ labels: { 'toast.dismiss': 'Schliessen' } })]
    });
    const perInstance = signal<string | undefined>('Just this one');
    const label = TestBed.runInInjectionContext(() => irisLabel('toast.dismiss', perInstance));

    expect(label()).toBe('Just this one');
    perInstance.set('');
    expect(label()).toBe('Schliessen');
  });

  it('uses the built-in label while an async translation is still empty', () => {
    const dismiss = signal('');
    TestBed.configureTestingModule({
      providers: [provideIrisUiLocalization({ labels: { 'toast.dismiss': dismiss } })]
    });
    const label = TestBed.runInInjectionContext(() => irisLabel('toast.dismiss'));

    expect(label()).toBe('Dismiss');
    dismiss.set('Elutasit');
    expect(label()).toBe('Elutasit');
  });

  it('exposes the resolved map through IRIS_LABELS', () => {
    TestBed.configureTestingModule({
      providers: [provideIrisUiLocalization({ labels: { 'spinner.loading': 'Betoltes' } })]
    });
    const labels = TestBed.inject(IRIS_LABELS);
    expect(labels['spinner.loading']()).toBe('Betoltes');
  });

  it('runs a config factory inside an injection context', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TRANSLATIONS, useValue: { 'iris.toast.dismiss': 'Elutasit' } },
        provideIrisUiLocalization(() => {
          const translations = inject(TRANSLATIONS);
          return { labels: { 'toast.dismiss': translations['iris.toast.dismiss'] } };
        })
      ]
    });
    const label = TestBed.runInInjectionContext(() => irisLabel('toast.dismiss'));
    expect(label()).toBe('Elutasit');
  });
});
