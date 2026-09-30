// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import type { IconName } from '../icon/icon.model';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  Signal,
  computed,
  forwardRef,
  inject,
  input,
  linkedSignal,
  output,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, ControlValueAccessor, NgControl, Validators } from '@angular/forms';
import { merge } from 'rxjs';
import { IrisFormControl, IRIS_FORM_FIELD, IrisFormFieldState } from '../form-field/form-field.token';
import { IrisIconComponent } from '../icon/icon.component';
import { TextInputSize } from './text-input.model';

@Component({
  selector: 'iris-text-input',
  standalone: true,
  imports: [IrisIconComponent],
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: IrisFormControl, useExisting: forwardRef(() => IrisTextInputComponent) }]
})
export class IrisTextInputComponent implements ControlValueAccessor, OnInit, IrisFormControl {
  readonly placeholder = input('');
  readonly value = input('');
  readonly size = input<TextInputSize>('default');
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly leadingIcon = input<IconName | ''>('');
  readonly trailingIcon = input<IconName | ''>('');
  readonly valueChange = output<string>();

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly destroyRef = inject(DestroyRef);
  protected readonly formField = inject<IrisFormFieldState>(IRIS_FORM_FIELD, { optional: true });

  private readonly controlInvalid = signal(false);
  private readonly controlTouched = signal(false);
  private readonly controlDisabled = signal(false);
  private readonly controlMaxLength = signal<number | null>(null);

  protected readonly valueState = linkedSignal(() => this.value());

  readonly isInvalid: Signal<boolean> = computed(() => this.controlInvalid());
  readonly isTouched: Signal<boolean> = computed(() => this.controlTouched());
  readonly isRequired: Signal<boolean> = computed(() => this.ngControl?.control?.hasValidator(Validators.required) ?? false);
  readonly countValue = computed(() => this.valueState().length);
  readonly countMax = computed(() => this.controlMaxLength() ?? 0);

  protected readonly effectiveHasError = computed(() => this.ngControl !== null && this.controlInvalid() && this.controlTouched());
  protected readonly effectiveDisabled = computed(() => this.disabled() || this.controlDisabled());

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    const control = this.ngControl?.control;
    if (!control) {
      return;
    }

    this.controlInvalid.set(control.invalid);
    this.controlTouched.set(control.touched);
    this.controlDisabled.set(control.disabled);
    this.controlMaxLength.set(this.extractMaxLength(control));

    merge(control.statusChanges, control.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.controlInvalid.set(control.invalid);
        this.controlTouched.set(control.touched);
        this.controlDisabled.set(control.disabled);
      });
  }

  writeValue(value: string): void {
    this.valueState.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.controlDisabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const newValue = (event.target as HTMLInputElement).value;
    this.valueState.set(newValue);
    this.onChange(newValue);
    this.valueChange.emit(newValue);
  }

  onBlur(): void {
    this.onTouched();
    this.controlTouched.set(true);
  }

  private extractMaxLength(control: AbstractControl): number | null {
    if (!control.validator) {
      return null;
    }
    try {
      const errors = control.validator({ value: 'x'.repeat(65535) } as AbstractControl);
      return (errors?.['maxlength']?.requiredLength as number) ?? null;
    } catch {
      return null;
    }
  }
}

export type { TextInputSize, TextInputState } from './text-input.model';
