// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisMultiSelectComponent } from './multi-select.component';
import { MultiSelectOption } from './multi-select.model';

describe('IrisMultiSelectComponent', () => {
  let component: IrisMultiSelectComponent;
  let fixture: ComponentFixture<IrisMultiSelectComponent>;

  const testOptions: MultiSelectOption[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry', description: 'A red fruit' },
    { value: 'disabled', label: 'Disabled', disabled: true }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisMultiSelectComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(IrisMultiSelectComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', testOptions);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all options', () => {
    const items = fixture.nativeElement.querySelectorAll('.iris-multi-select__item');
    expect(items.length).toBe(4);
  });

  it('should toggle selection on click', () => {
    const emitSpy = vi.spyOn(component.selectedValuesChange, 'emit');
    component.toggleOption('apple');
    expect(emitSpy).toHaveBeenCalledWith(['apple']);
  });

  it('should deselect when toggling already selected value', () => {
    fixture.componentRef.setInput('selectedValues', ['apple', 'banana']);
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.selectedValuesChange, 'emit');
    component.toggleOption('apple');
    expect(emitSpy).toHaveBeenCalledWith(['banana']);
  });

  it('should filter options by search query', () => {
    component.searchQuery.set('ban');
    expect(component.filteredOptions().length).toBe(1);
    expect(component.filteredOptions()[0].label).toBe('Banana');
  });

  it('should clear all selections', () => {
    fixture.componentRef.setInput('selectedValues', ['apple', 'banana']);
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.selectedValuesChange, 'emit');
    component.clearAll();
    expect(emitSpy).toHaveBeenCalledWith([]);
  });

  it('should display summary text for selected count', () => {
    fixture.componentRef.setInput('selectedValues', ['apple', 'banana']);
    fixture.detectChanges();
    expect(component.summaryText()).toBe('2 selected');
  });

  it('should display single label when one item selected', () => {
    fixture.componentRef.setInput('selectedValues', ['apple']);
    fixture.detectChanges();
    expect(component.summaryText()).toBe('Apple');
  });
});
