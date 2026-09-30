// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { IrisStepperComponent } from './stepper.component';
import { IrisStepComponent } from './step.component';
import { StepperOrientation } from './stepper.model';

@Component({
  standalone: true,
  imports: [IrisStepperComponent, IrisStepComponent],
  template: `
    <iris-stepper [orientation]="orientation()" [linear]="linear()" [(selectedIndex)]="selectedIndex">
      <iris-step label="One" [irisStepControl]="c1">Content one</iris-step>
      <iris-step label="Two" [irisStepControl]="c2">Content two</iris-step>
      <iris-step label="Three">Content three</iris-step>
    </iris-stepper>
  `
})
class HostComponent {
  readonly orientation = signal<StepperOrientation>('horizontal');
  readonly linear = signal(false);
  readonly selectedIndex = signal(0);
  readonly c1 = new FormControl('', Validators.required);
  readonly c2 = new FormControl('valid');
}

@Component({
  standalone: true,
  imports: [IrisStepperComponent, IrisStepComponent],
  template: `
    <iris-stepper [linear]="true" [(selectedIndex)]="selectedIndex">
      <iris-step label="One" [completed]="firstCompleted()">Content one</iris-step>
      <iris-step label="Two">Content two</iris-step>
      <iris-step label="Three">Content three</iris-step>
    </iris-stepper>
  `
})
class ManualHostComponent {
  readonly selectedIndex = signal(0);
  readonly firstCompleted = signal<boolean | null>(false);
}

describe('IrisStepperComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const steps = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('.iris-stepper__step'));
  const buttons = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('.iris-stepper__button'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(host).toBeTruthy();
  });

  it('should render a header for each projected step', () => {
    expect(steps().length).toBe(3);
    expect(buttons()[0].textContent).toContain('One');
    expect(buttons()[2].textContent).toContain('Three');
  });

  it('should apply horizontal class by default', () => {
    expect(fixture.nativeElement.querySelector('.iris-stepper--horizontal')).toBeTruthy();
  });

  it('should apply vertical class when orientation is vertical', () => {
    host.orientation.set('vertical');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-stepper--vertical')).toBeTruthy();
  });

  it('should render the selected step content only', () => {
    const content = fixture.nativeElement.querySelector('.iris-stepper__content');
    expect(content.textContent).toContain('Content one');
    expect(content.textContent).not.toContain('Content two');
  });

  it('should select a step when its header is clicked', () => {
    buttons()[2].click();
    fixture.detectChanges();
    expect(host.selectedIndex()).toBe(2);
    expect(buttons()[2].getAttribute('aria-current')).toBe('step');
  });

  it('should mark the current step with an invalid control as error-current and future steps as waiting', () => {
    expect(steps()[0].classList).toContain('iris-stepper__step--error');
    expect(steps()[0].classList).toContain('iris-stepper__step--current');
    expect(steps()[1].classList).toContain('iris-stepper__step--waiting');
    expect(steps()[2].classList).toContain('iris-stepper__step--waiting');
  });

  it('should resolve visited steps from control validity', () => {
    // Walk through steps 1 and 2 so they are actually visited.
    buttons()[1].click();
    fixture.detectChanges();
    buttons()[2].click();
    fixture.detectChanges();
    expect(steps()[0].classList).toContain('iris-stepper__step--error');
    expect(steps()[1].classList).toContain('iris-stepper__step--completed');
    expect(steps()[2].classList).toContain('iris-stepper__step--current');
  });

  it('should keep an earlier step that was never visited in the waiting state', () => {
    // Jump straight to step 2 without visiting step 1.
    host.selectedIndex.set(2);
    fixture.detectChanges();
    expect(steps()[1].classList).toContain('iris-stepper__step--waiting');
    expect(steps()[1].classList).not.toContain('iris-stepper__step--completed');
  });

  it('should react to control validity changes', () => {
    host.selectedIndex.set(1);
    fixture.detectChanges();
    expect(steps()[0].classList).toContain('iris-stepper__step--error');
    host.c1.setValue('filled');
    fixture.detectChanges();
    expect(steps()[0].classList).toContain('iris-stepper__step--completed');
    expect(steps()[0].classList).not.toContain('iris-stepper__step--error');
  });

  it('should render vertical connectors between steps in vertical mode', () => {
    host.orientation.set('vertical');
    fixture.detectChanges();
    const connectors = fixture.nativeElement.querySelectorAll('.iris-stepper__connector');
    expect(connectors.length).toBe(2);
  });

  it('should not render inter-step connectors in horizontal mode', () => {
    const connectors = fixture.nativeElement.querySelectorAll('.iris-stepper__connector');
    expect(connectors.length).toBe(0);
  });

  describe('visited memory (non-linear)', () => {
    it('should style a previously visited future step as default instead of waiting', () => {
      // Visit step 2, then return to step 0. Steps 1 and 2 are now visited.
      buttons()[2].click();
      fixture.detectChanges();
      buttons()[0].click();
      fixture.detectChanges();

      // Step 2 has no control -> visited => default (not waiting).
      expect(steps()[2].classList).toContain('iris-stepper__step--default');
      expect(steps()[2].classList).not.toContain('iris-stepper__step--waiting');
    });

    it('should keep never-visited future steps in the waiting state', () => {
      // From the initial step 0, step 2 has never been visited.
      expect(steps()[2].classList).toContain('iris-stepper__step--waiting');
    });
  });

  describe('linear mode', () => {
    beforeEach(() => {
      // Make both control-driven steps complete so these tests exercise position gating,
      // not completion gating (covered separately below).
      host.c1.setValue('filled');
      host.linear.set(true);
      fixture.detectChanges();
    });

    it('should disable steps more than one ahead of the selected step', () => {
      const stepButtons = buttons() as HTMLButtonElement[];
      // selectedIndex 0: next (index 1) is reachable, index 2 is not.
      expect(stepButtons[0].disabled).toBe(false);
      expect(stepButtons[1].disabled).toBe(false);
      expect(stepButtons[2].disabled).toBe(true);
    });

    it('should not advance more than one step forward on click', () => {
      buttons()[2].click();
      fixture.detectChanges();
      expect(host.selectedIndex()).toBe(0);
    });

    it('should allow moving forward one step at a time', () => {
      buttons()[1].click();
      fixture.detectChanges();
      expect(host.selectedIndex()).toBe(1);
    });

    it('should allow jumping backwards to any earlier step', () => {
      host.selectedIndex.set(2);
      fixture.detectChanges();
      buttons()[0].click();
      fixture.detectChanges();
      expect(host.selectedIndex()).toBe(0);
    });

    it('should not disable any step when linear is false', () => {
      host.linear.set(false);
      fixture.detectChanges();
      const stepButtons = buttons() as HTMLButtonElement[];
      expect(stepButtons.some((button) => button.disabled)).toBe(false);
    });

    it('should keep previously visited steps accessible even when more than one ahead', () => {
      // Walk forward one step at a time to step 2, then return to step 0.
      buttons()[1].click();
      fixture.detectChanges();
      buttons()[2].click();
      fixture.detectChanges();
      buttons()[0].click();
      fixture.detectChanges();

      // Step 2 was visited, so it remains enabled and directly selectable from step 0.
      const stepButtons = buttons() as HTMLButtonElement[];
      expect(stepButtons[2].disabled).toBe(false);
      stepButtons[2].click();
      fixture.detectChanges();
      expect(host.selectedIndex()).toBe(2);
    });

    it('should open the step after the furthest visited step, not just after the current one', () => {
      // Visit up to step 1 (furthest visited = 1), then go back to step 0.
      buttons()[1].click();
      fixture.detectChanges();
      buttons()[0].click();
      fixture.detectChanges();

      // Frontier is furthestVisited + 1 = 2, so step 2 is reachable even though it is
      // two steps ahead of the current step 0.
      const stepButtons = buttons() as HTMLButtonElement[];
      expect(stepButtons[2].disabled).toBe(false);
      stepButtons[2].click();
      fixture.detectChanges();
      expect(host.selectedIndex()).toBe(2);
    });

    it('should block advancing past a step whose control is invalid', () => {
      // c1 is required; empty -> step 0 is incomplete, so the next step stays locked.
      host.c1.setValue('');
      fixture.detectChanges();
      const stepButtons = buttons() as HTMLButtonElement[];
      expect(stepButtons[1].disabled).toBe(true);
      buttons()[1].click();
      fixture.detectChanges();
      expect(host.selectedIndex()).toBe(0);

      // Once the control becomes valid the next step unlocks.
      host.c1.setValue('filled');
      fixture.detectChanges();
      expect((buttons()[1] as HTMLButtonElement).disabled).toBe(false);
    });
  });

  describe('linear completion gating without a control', () => {
    let manualFixture: ComponentFixture<ManualHostComponent>;
    let manualHost: ManualHostComponent;
    const manualButtons = (): HTMLButtonElement[] => Array.from(manualFixture.nativeElement.querySelectorAll('.iris-stepper__button'));

    beforeEach(() => {
      manualFixture = TestBed.createComponent(ManualHostComponent);
      manualHost = manualFixture.componentInstance;
      manualFixture.detectChanges();
    });

    it('should block the next step until the current step is marked completed', () => {
      // Step 0 has no control; completed defaults to false here -> next step locked.
      expect(manualButtons()[1].disabled).toBe(true);
      manualButtons()[1].click();
      manualFixture.detectChanges();
      expect(manualHost.selectedIndex()).toBe(0);

      // Consumer marks the step complete -> next step unlocks.
      manualHost.firstCompleted.set(true);
      manualFixture.detectChanges();
      expect(manualButtons()[1].disabled).toBe(false);
      manualButtons()[1].click();
      manualFixture.detectChanges();
      expect(manualHost.selectedIndex()).toBe(1);
    });
  });
});
