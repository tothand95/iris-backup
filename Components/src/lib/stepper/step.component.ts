// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, TemplateRef, input, viewChild } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/**
 * A single step within an `iris-stepper`. Declared as content and template-driven:
 * its `label` renders in the header and its projected content renders when the step
 * is selected. An optional `irisStepControl` (a reactive form control or group) lets
 * the parent stepper derive the step's status from the control's validity.
 */
@Component({
  selector: 'iris-step',
  standalone: true,
  template: '<ng-template><ng-content></ng-content></ng-template>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IrisStepComponent {
  /** Header label for the step. */
  readonly label = input('');

  /** Optional reactive form `AbstractControl` (e.g. a `FormGroup` or `FormControl`) whose validity drives the step status. */
  readonly irisStepControl = input<AbstractControl | null>(null);

  /**
   * Whether the step is complete, used by a `linear` stepper to decide if the user may
   * advance past it. When left unset (`null`) completion is derived: from the attached
   * `irisStepControl`'s validity if one is present, otherwise `true`. Setting an explicit
   * boolean overrides both — letting the consumer gate progress even without a control.
   */
  readonly completed = input<boolean | null>(null);

  /** Projected step content, rendered when the step is selected. */
  readonly content = viewChild.required<TemplateRef<unknown>>(TemplateRef);

  /**
   * Resolved completion: explicit `completed` wins, else the control's validity, else `true`.
   * A method (not a computed) because it reads the control's non-reactive `valid` flag; the
   * parent stepper re-evaluates it whenever control status changes.
   */
  isComplete(): boolean {
    const explicit = this.completed();
    if (explicit !== null) {
      return explicit;
    }
    const control = this.irisStepControl();
    return control ? control.valid : true;
  }
}
