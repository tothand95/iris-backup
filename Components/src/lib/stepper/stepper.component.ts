// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, contentChildren, effect, input, model, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { AbstractControl } from '@angular/forms';
import { irisLabel } from '@oneidentity/iris-ui/i18n';
import { IrisStepComponent } from './step.component';
import { StepState, StepperOrientation } from './stepper.model';

/** View model pairing a projected step with its resolved index and state. */
interface StepView {
  step: IrisStepComponent;
  index: number;
  state: StepState;
  disabled: boolean;
}

@Component({
  selector: 'iris-stepper',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IrisStepperComponent {
  protected readonly progressLabel = irisLabel('stepper.progress');

  /** Layout orientation of the stepper. */
  readonly orientation = input<StepperOrientation>('horizontal');

  /** Index of the currently selected step (two-way bindable). */
  readonly selectedIndex = model(0);

  /**
   * When true, the stepper is linear: users may only move forward one step at a time
   * (to `selectedIndex + 1`). Moving backwards to any earlier step is always allowed.
   * Steps that cannot be reached are disabled and non-focusable.
   */
  readonly linear = input(false);

  /** Steps projected as `iris-step` content children. */
  readonly steps = contentChildren(IrisStepComponent);

  /** Bumped whenever an attached control's validity status changes, to re-resolve states. */
  private readonly controlTick = signal(0);

  /** Indices that have been selected at least once. Drives visited-vs-waiting styling and linear access. */
  private readonly visitedIndices = signal<ReadonlySet<number>>(new Set());

  constructor() {
    effect((onCleanup) => {
      const subscriptions = this.steps()
        .map((step) => step.irisStepControl())
        .filter((control): control is AbstractControl => control != null)
        .map((control) => control.statusChanges.subscribe(() => this.controlTick.update((tick) => tick + 1)));
      onCleanup(() => subscriptions.forEach((subscription) => subscription.unsubscribe()));
    });

    effect(() => {
      const index = this.selectedIndex();
      this.visitedIndices.update((visited) => {
        if (visited.has(index)) {
          return visited;
        }
        const next = new Set(visited);
        next.add(index);
        return next;
      });
    });
  }

  /** Resolved view models for every projected step. */
  readonly stepViews = computed<StepView[]>(() => {
    this.controlTick();
    const selected = this.selectedIndex();
    const linear = this.linear();
    const visited = this.visitedIndices();
    return this.steps().map((step, index) => ({
      step,
      index,
      state: this.resolveState(step, index, selected, visited),
      disabled: linear && !this.canAccess(index, selected, visited)
    }));
  });

  /** The currently selected step, or null when there are no steps. */
  readonly selectedStep = computed<IrisStepComponent | null>(() => this.steps()[this.selectedIndex()] ?? null);

  select(index: number): void {
    if (this.linear() && !this.canAccess(index, this.selectedIndex(), this.visitedIndices())) {
      return;
    }
    this.selectedIndex.set(index);
  }

  isActive(state: StepState): boolean {
    return state === 'current' || state === 'error-current';
  }

  /**
   * In linear mode a step is reachable when it is the current step or earlier (backwards is
   * never restricted), any step that has already been visited, or the single step immediately
   * after the furthest step reached so far — and only when that furthest step is complete
   * (see `IrisStepComponent.isComplete`), so a step can block forward progress.
   */
  private canAccess(index: number, selected: number, visited: ReadonlySet<number>): boolean {
    if (index <= selected || visited.has(index)) {
      return true;
    }
    const frontier = Math.max(visited.size ? Math.max(...visited) : selected, selected);
    if (index !== frontier + 1) {
      return false;
    }
    return this.steps()[frontier]?.isComplete() ?? true;
  }

  private isVisited(index: number, visited: ReadonlySet<number>): boolean {
    return visited.has(index);
  }

  private resolveState(step: IrisStepComponent, index: number, selected: number, visited: ReadonlySet<number>): StepState {
    const control = step.irisStepControl();
    if (index === selected) {
      return control?.invalid ? 'error-current' : 'current';
    }
    if (this.isVisited(index, visited)) {
      if (!control) {
        return 'default';
      }
      return control.invalid ? 'error' : 'completed';
    }
    return 'waiting';
  }
}

export type { StepperOrientation, StepState } from './stepper.model';
