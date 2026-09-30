// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IrisMultiSelectDirective } from './multi-select.directive';
import { MultiSelectOption, MultiSelectPosition } from './multi-select.model';

@Component({
  template: `<button
    [irisMultiSelect]="options"
    [irisMultiSelectPosition]="position"
    [irisMultiSelectSelected]="selected"
    (irisMultiSelectSelectedChange)="onChange($event)">
    Open multi-select
  </button>`,
  imports: [IrisMultiSelectDirective]
})
class TestHostComponent {
  options: MultiSelectOption[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry', disabled: true }
  ];
  position: MultiSelectPosition = 'bottom-start';
  selected: string[] = ['apple'];
  lastChange: string[] | undefined;

  onChange(values: string[]): void {
    this.lastChange = values;
  }
}

describe('IrisMultiSelectDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let triggerElement: HTMLElement;
  let overlayContainerElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();

    triggerElement = fixture.nativeElement.querySelector('button');
  });

  it('should create', () => {
    expect(hostComponent).toBeTruthy();
  });

  it('should set aria-haspopup="listbox" on trigger', () => {
    expect(triggerElement.getAttribute('aria-haspopup')).toBe('listbox');
  });

  it('should set aria-expanded to false when closed', () => {
    expect(triggerElement.getAttribute('aria-expanded')).toBe('false');
  });

  it('should open panel on click', () => {
    triggerElement.click();
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.iris-multi-select')).toBeTruthy();
  });

  it('should set aria-expanded to true and aria-controls when open', () => {
    triggerElement.click();
    fixture.detectChanges();
    expect(triggerElement.getAttribute('aria-expanded')).toBe('true');
    expect(triggerElement.getAttribute('aria-controls')).toMatch(/^iris-multi-select-\d+$/);
  });

  it('should close panel on second click (toggle)', () => {
    triggerElement.click();
    fixture.detectChanges();
    triggerElement.click();
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.iris-multi-select')).toBeNull();
    expect(triggerElement.getAttribute('aria-controls')).toBeNull();
  });

  it('should seed the panel with the current selection', () => {
    triggerElement.click();
    fixture.detectChanges();
    const items = overlayContainerElement.querySelectorAll('.iris-multi-select__item');
    expect(items[0].getAttribute('aria-selected')).toBe('true');
  });

  it('should emit selection changes without closing the panel', () => {
    triggerElement.click();
    fixture.detectChanges();
    const items = overlayContainerElement.querySelectorAll<HTMLElement>('.iris-multi-select__item');
    items[1].click();
    fixture.detectChanges();
    expect(hostComponent.lastChange).toEqual(['apple', 'banana']);
    expect(overlayContainerElement.querySelector('.iris-multi-select')).toBeTruthy();
  });

  it('should close panel on Escape key', () => {
    triggerElement.click();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('.iris-multi-select')).toBeNull();
  });

  it('should focus the first item on ArrowDown', () => {
    triggerElement.click();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    const firstItem = overlayContainerElement.querySelector<HTMLElement>('.iris-multi-select__item');
    expect(document.activeElement).toBe(firstItem);
  });

  it('should focus the search input when the panel opens', () => {
    triggerElement.click();
    fixture.detectChanges();
    const searchInput = overlayContainerElement.querySelector<HTMLElement>('.iris-text-input__input');
    expect(searchInput).toBeTruthy();
    expect(document.activeElement).toBe(searchInput);
  });

  it('should not open a second overlay when open() is called while already open', () => {
    triggerElement.click();
    fixture.detectChanges();
    const directive = fixture.debugElement.query(By.directive(IrisMultiSelectDirective)).injector.get(IrisMultiSelectDirective);
    directive.open();
    fixture.detectChanges();
    expect(overlayContainerElement.querySelectorAll('.iris-multi-select').length).toBe(1);
  });
});
