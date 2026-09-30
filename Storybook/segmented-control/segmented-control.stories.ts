// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import type { SegmentedControlItem } from '@oneidentity/iris-ui';
import {
  IrisButtonComponent,
  IrisFormFieldComponent,
  IrisLabelComponent,
  IrisSegmentedControlComponent,
  IrisSubtextComponent
} from '@oneidentity/iris-ui';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<IrisSegmentedControlComponent> = {
  title: 'Inputs/Segmented control',
  component: IrisSegmentedControlComponent,
  tags: ['preview'],
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule, IrisFormFieldComponent, IrisLabelComponent, IrisSubtextComponent, IrisButtonComponent]
    })
  ],
  argTypes: {
    items: {
      description: "Array of `SegmentedControlItem` objects defining each segment's label, value, and optional icon.",
      control: 'object',
      table: { type: { summary: 'SegmentedControlItem[]' }, defaultValue: { summary: '[]' } }
    },
    type: {
      description:
        'Controls which content each segment renders. `icon-only` shows just the icon (with a tooltip) when an icon is present; `icon-text` shows both icon and label; `text-only` always shows the label regardless of icon.',
      control: 'select',
      options: ['icon-only', 'icon-text', 'text-only'],
      table: { type: { summary: "'text-only' | 'icon-text' | 'icon-only'" }, defaultValue: { summary: "'icon-only'" } }
    },
    activeValue: {
      description: 'The `value` of the currently selected segment.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' } }
    },
    disabled: {
      description: 'Disables all segments when true. Also controlled by a bound `FormControl` when using reactive forms.',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } }
    },
    activeValueChange: {
      description: 'Emits the new active value on every selection. Use `(activeValueChange)` to sync state in the parent.',
      table: { type: { summary: 'string' }, defaultValue: { summary: '—' }, category: 'Events' }
    },
    activeValueState: { table: { disable: true } }
  }
};

export default meta;
type Story = StoryObj<IrisSegmentedControlComponent>;

const ICON_ITEMS: SegmentedControlItem[] = [
  { label: 'Buildings', value: 'buildings', iconName: 'BuildingOffice' },
  { label: 'Network', value: 'network', iconName: 'ShareNetwork' },
  { label: 'Favourites', value: 'favourites', iconName: 'Heart' }
];

const TEXT_ITEMS = [
  { label: 'Overview', value: 'overview' },
  { label: 'Details', value: 'details' },
  { label: 'Settings', value: 'settings' }
];

export const Overview: Story = {
  argTypes: {
    activeValueChange: { table: { disable: true } }
  },
  args: {
    items: ICON_ITEMS,
    type: 'icon-only',
    activeValue: 'buildings'
  }
};

export const IconText: Story = {
  argTypes: {
    activeValueChange: { table: { disable: true } }
  },
  args: {
    items: ICON_ITEMS,
    type: 'icon-text',
    activeValue: 'buildings'
  }
};

export const TextOnly: Story = {
  argTypes: {
    activeValueChange: { table: { disable: true } }
  },
  args: {
    items: TEXT_ITEMS,
    type: 'text-only',
    activeValue: 'overview'
  }
};

export const WithReactiveForms: Story = {
  render: () => ({
    props: {
      control: new FormControl('', Validators.required),
      items: ICON_ITEMS
    },
    template: `
      <form style="display: flex; flex-direction: column; gap: 1rem; max-width: 400px">
        <iris-form-field>
          <iris-label>View mode</iris-label>
          <iris-segmented-control [formControl]="control" [items]="items" type="icon-text"></iris-segmented-control>
          @if (control.invalid && control.touched) {
            <iris-subtext type="error">Please select a view mode.</iris-subtext>
          }
        </iris-form-field>
        <p style="font-size: var(--oi-font-size-s); color: var(--oi-color-neutral-600)">
          Value: <strong>{{ control.value || '—' }}</strong> &nbsp;|&nbsp;
          Status: <strong>{{ control.status }}</strong> &nbsp;|&nbsp;
          Touched: <strong>{{ control.touched }}</strong>
        </p>
        <div style="display: flex; gap: 0.5rem">
          <iris-button variant="secondary" (click)="control.reset()">Reset</iris-button>
          <iris-button variant="secondary" (click)="control.disable()">Disable</iris-button>
          <iris-button variant="secondary" (click)="control.enable()">Enable</iris-button>
        </div>
      </form>
    `
  })
};
