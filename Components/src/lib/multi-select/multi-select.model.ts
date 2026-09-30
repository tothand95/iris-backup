// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import type { IconName } from '../icon/icon.model';

/** Preferred opening position of the multi-select panel relative to its trigger element. */
export type MultiSelectPosition = 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start';

/** Represents a single option in the multi-select. */
export interface MultiSelectOption {
  /** Unique identifier for the option. */
  value: string;
  /** Display label for the option. */
  label: string;
  /** Optional secondary text or description shown on the meta line (multiline layout). */
  description?: string;
  /** Optional leading icon name rendered before the label. */
  icon?: IconName;
  /** Whether the option is disabled. */
  disabled?: boolean;
}
