// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { FormControl, Validators } from '@angular/forms';
import { IrisStepComponent, IrisStepperComponent } from '@oneidentity/iris-ui';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<IrisStepperComponent> = {
  title: 'Navigation/Stepper',
  component: IrisStepperComponent,
  tags: ['preview'],
  decorators: [
    moduleMetadata({
      imports: [IrisStepperComponent, IrisStepComponent]
    })
  ],
  argTypes: {
    orientation: {
      description: 'Layout direction of the stepper.',
      control: 'select',
      options: ['horizontal', 'vertical'],
      table: {
        type: { summary: "'horizontal' | 'vertical'" },
        defaultValue: { summary: 'horizontal' }
      }
    },
    selectedIndex: {
      description: 'Index of the currently selected step (two-way bindable).',
      control: 'number',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0' }
      }
    },
    linear: {
      description:
        'When true, forward navigation is restricted to previously visited steps and the step just after the furthest one reached; backwards navigation is unrestricted and unreachable steps are disabled.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    }
  }
};

export default meta;
type Story = StoryObj<IrisStepperComponent>;

export const Overview: Story = {
  args: { orientation: 'horizontal', selectedIndex: 0 },
  render: (args) => ({
    props: args,
    template: `
      <iris-stepper [orientation]="orientation" [selectedIndex]="selectedIndex" [linear]="linear">
        <iris-step label="Account setup">Create your organization account.</iris-step>
        <iris-step label="Personal info">Tell us about yourself.</iris-step>
        <iris-step label="Review">Check everything looks right.</iris-step>
        <iris-step label="Confirmation">Confirm and submit.</iris-step>
        <iris-step label="Done">All set.</iris-step>
      </iris-stepper>
    `
  })
};

export const Horizontal: Story = {
  args: { orientation: 'horizontal', selectedIndex: 0 },
  render: Overview.render
};

export const Vertical: Story = {
  args: { orientation: 'vertical', selectedIndex: 0 },
  render: Overview.render
};

export const Linear: Story = {
  args: { orientation: 'horizontal', selectedIndex: 0, linear: true },
  render: (args) => ({
    props: {
      ...args,
      // Manual completion gate: the first step blocks forward progress until toggled,
      // demonstrating linear gating without a reactive form control.
      firstDone: false
    },
    template: `
      <iris-stepper [orientation]="orientation" [selectedIndex]="selectedIndex" [linear]="linear">
        <iris-step label="Account setup" [completed]="firstDone">
          <label style="display:inline-flex;gap:.5rem;align-items:center;">
            <input type="checkbox" [checked]="firstDone" (change)="firstDone = $any($event.target).checked" />
            Mark this step complete to advance
          </label>
        </iris-step>
        <iris-step label="Personal info">Tell us about yourself.</iris-step>
        <iris-step label="Review">Check everything looks right.</iris-step>
        <iris-step label="Confirmation">Confirm and submit.</iris-step>
        <iris-step label="Done">All set.</iris-step>
      </iris-stepper>
    `
  })
};

export const WithValidation: Story = {
  name: 'With validation',
  args: { orientation: 'horizontal', selectedIndex: 0 },
  render: (args) => ({
    props: {
      ...args,
      // Invalid required control -> "error" once visited, "error-current" while current.
      accountControl: new FormControl('', Validators.required),
      // Valid control -> "completed" once visited.
      profileControl: new FormControl('Ada Lovelace')
    },
    template: `
      <iris-stepper [orientation]="orientation" [selectedIndex]="selectedIndex" [linear]="linear">
        <iris-step label="Account setup" [irisStepControl]="accountControl">
          Provide account details (required — leave empty to see the error state).
        </iris-step>
        <iris-step label="Personal info" [irisStepControl]="profileControl">
          Personal information (valid — completes once visited).
        </iris-step>
        <iris-step label="Review">Review without a control uses the default state.</iris-step>
        <iris-step label="Confirmation">Not yet reached — stays in the waiting state.</iris-step>
      </iris-stepper>
    `
  })
};
