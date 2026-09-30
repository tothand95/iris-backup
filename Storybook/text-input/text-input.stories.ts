// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { IrisFormFieldComponent, IrisLabelComponent, IrisSubtextComponent, IrisTextInputComponent } from '@oneidentity/iris-ui';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<IrisTextInputComponent> = {
  title: 'Inputs/Text input',
  component: IrisTextInputComponent,
  tags: ['preview'],
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule, IrisFormFieldComponent, IrisLabelComponent, IrisSubtextComponent]
    })
  ],
  argTypes: {
    placeholder: {
      description: 'Placeholder text shown when the input is empty.',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' }
      }
    },
    value: {
      description: 'Current value of the input field.',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' }
      }
    },
    size: {
      description: 'Controls the height of the input field.',
      control: 'select',
      options: ['default', 'lg'],
      table: {
        type: { summary: "'default' | 'lg'" },
        defaultValue: { summary: 'default' }
      }
    },
    disabled: {
      description: 'Prevents interaction when true.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    readonly: {
      description: 'Makes the input read-only; the value can be copied but not edited.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    leadingIcon: {
      description: 'Icon name displayed at the start of the input field.',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' }
      }
    },
    trailingIcon: {
      description: 'Icon name displayed at the end of the input field.',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' }
      }
    },
    valueChange: {
      table: { disable: true }
    }
  }
};

export default meta;
type Story = StoryObj<IrisTextInputComponent>;

export const Overview: Story = {
  args: {
    size: 'default',
    disabled: false,
    readonly: false,
    leadingIcon: 'Dog',
    trailingIcon: 'Eyes',
    placeholder: 'Placeholder'
  },
  argTypes: {
    size: { control: 'select', options: ['default', 'lg'] },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    value: { table: { disable: true } }
  },
  render: (args) => ({
    props: args,
    template: `
      <iris-form-field>
        <iris-label>Full name of your pet</iris-label>
        <iris-text-input [placeholder]="placeholder" [size]="size" [disabled]="disabled" [readonly]="readonly" [leadingIcon]="leadingIcon" [trailingIcon]="trailingIcon"></iris-text-input>
        <iris-subtext type="hint">Used for display on your profile.</iris-subtext>
      </iris-form-field>
    `
  })
};

export const WithoutFormField: Story = {
  render: () => ({
    template: `<iris-text-input placeholder="Search..." leadingIcon="MagnifyingGlass"></iris-text-input>`
  })
};

export const Default: Story = {
  render: () => ({
    template: `
      <iris-form-field>
        <iris-label>Full name</iris-label>
        <iris-text-input placeholder="Enter your name"></iris-text-input>
      </iris-form-field>
    `
  })
};

export const Large: Story = {
  render: () => ({
    template: `
      <iris-form-field>
        <iris-label>Full name</iris-label>
        <iris-text-input placeholder="Enter your name" size="lg"></iris-text-input>
      </iris-form-field>
    `
  })
};

export const Disabled: Story = {
  render: () => ({
    template: `
      <iris-form-field>
        <iris-label>Full name</iris-label>
        <iris-text-input placeholder="Enter your name" [disabled]="true"></iris-text-input>
      </iris-form-field>
    `
  })
};

export const Readonly: Story = {
  render: () => ({
    template: `
      <iris-form-field>
        <iris-label>Account ID</iris-label>
        <iris-text-input value="ACC-12345" [readonly]="true"></iris-text-input>
      </iris-form-field>
    `
  })
};

export const WithHint: Story = {
  render: () => ({
    template: `
      <iris-form-field>
        <iris-label>Identifier</iris-label>
        <iris-text-input placeholder="Enter identifier"></iris-text-input>
        <iris-subtext type="hint">Must be at least 8 characters.</iris-subtext>
      </iris-form-field>
    `
  })
};

export const WithValidationError: Story = {
  render: () => ({
    props: {
      control: (() => {
        const formControl = new FormControl('', [Validators.required, Validators.email]);
        formControl.markAsTouched();
        return formControl;
      })()
    },
    template: `
      <iris-form-field>
        <iris-label>Email</iris-label>
        <iris-text-input [formControl]="control" placeholder="you@example.com"></iris-text-input>
        <iris-subtext type="hint">Enter your work email address.</iris-subtext>
        @if (control.hasError('required')) {
          <iris-subtext type="error">Email is required.</iris-subtext>
        }
        @if (control.hasError('email')) {
          <iris-subtext type="error">Enter a valid email address.</iris-subtext>
        }
      </iris-form-field>
    `
  })
};

export const WithIcons: Story = {
  render: () => ({
    template: `
      <iris-form-field>
        <iris-label>Search</iris-label>
        <iris-text-input placeholder="Search..." leadingIcon="MagnifyingGlass" trailingIcon="ArrowCircleRight"></iris-text-input>
      </iris-form-field>
    `
  })
};

export const WithCharacterCount: Story = {
  render: () => ({
    props: (() => {
      const control = new FormControl('', [Validators.maxLength(50)]);
      return { control };
    })(),
    template: `
      <iris-form-field>
        <iris-label>Bio</iris-label>
        <iris-text-input [formControl]="control" placeholder="Tell us about yourself"></iris-text-input>
        <iris-subtext type="hint">Keep it short and sweet.</iris-subtext>
        @if (control.hasError('maxlength')) {
          <iris-subtext type="error">Given text is too long.</iris-subtext>
        }
      </iris-form-field>
    `
  })
};
