// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IrisIconComponent } from '../icon/icon.component';
import { IrisCheckboxComponent } from '../checkbox/checkbox.component';
import { IrisButtonComponent } from '../button/button.component';
import { IrisTextInputComponent } from '../text-input/text-input.component';
import { MultiSelectOption } from './multi-select.model';

@Component({
  selector: 'iris-multi-select',
  standalone: true,
  imports: [CommonModule, IrisIconComponent, IrisCheckboxComponent, IrisButtonComponent, IrisTextInputComponent],
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IrisMultiSelectComponent {
  /** Available options to select from. */
  options = input<MultiSelectOption[]>([]);

  /** Currently selected values (driven by parent). */
  selectedValues = input<string[]>([]);

  /** Emits updated selection when a value is toggled. */
  selectedValuesChange = output<string[]>();

  /** Placeholder text for the search input. */
  searchPlaceholder = input('Search...');

  /** Whether the search input is shown at the top of the panel. */
  showSearch = input(true);

  /** Whether the footer actions (Clear / Select all) are shown. */
  showFooter = input(true);

  /** Whether the dropdown panel is open. */
  open = input(false);

  /** Emits when the panel open state changes. */
  openChange = output<boolean>();

  /** Internal state for selected values. */
  readonly selectedState = linkedSignal(() => this.selectedValues());

  /** Internal search query state. */
  readonly searchQuery = signal('');

  /** Filtered options based on search query. */
  readonly filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      return this.options();
    }
    return this.options().filter(
      (option) => option.label.toLowerCase().includes(query) || (option.description && option.description.toLowerCase().includes(query))
    );
  });

  /** Computed summary text for the trigger. */
  readonly summaryText = computed(() => {
    const selected = this.selectedState();
    const allOptions = this.options();
    if (selected.length === 0) {
      return 'Select items';
    }
    if (selected.length === 1) {
      const match = allOptions.find((option) => option.value === selected[0]);
      return match ? match.label : '1 selected';
    }
    return `${selected.length} selected`;
  });

  toggleOption(value: string): void {
    const current = this.selectedState();
    const updated = current.includes(value) ? current.filter((selectedValue) => selectedValue !== value) : [...current, value];
    this.selectedState.set(updated);
    this.selectedValuesChange.emit(updated);
  }

  isSelected(value: string): boolean {
    return this.selectedState().includes(value);
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
  }

  clearAll(): void {
    this.selectedState.set([]);
    this.selectedValuesChange.emit([]);
  }

  selectAll(): void {
    const selectable = this.options()
      .filter((option) => !option.disabled)
      .map((option) => option.value);
    this.selectedState.set(selectable);
    this.selectedValuesChange.emit(selectable);
  }
}

export type { MultiSelectOption } from './multi-select.model';
