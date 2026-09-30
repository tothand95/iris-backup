// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisButtonComponent, IrisMultiSelectComponent, IrisMultiSelectDirective, MultiSelectOption } from '@oneidentity/iris-ui';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const sampleOptions: MultiSelectOption[] = [
  { value: 'react', label: 'React', description: 'A JavaScript library for building user interfaces' },
  { value: 'angular', label: 'Angular', description: 'A platform for building web applications' },
  { value: 'vue', label: 'Vue', description: 'The progressive JavaScript framework' },
  { value: 'svelte', label: 'Svelte', description: 'Cybernetically enhanced web apps' },
  { value: 'solid', label: 'SolidJS', description: 'Simple and performant reactivity' },
  { value: 'ember', label: 'Ember', description: 'A framework for ambitious web developers' }
];

const iconOptions: MultiSelectOption[] = [
  { value: 'repo', label: 'Repository', description: 'Source code and history', icon: 'GitBranch' },
  { value: 'pipeline', label: 'Pipeline', description: 'Build and release automation', icon: 'Terminal' },
  { value: 'database', label: 'Database', description: 'Persistent data store', icon: 'Database' },
  { value: 'code', label: 'Code review', description: 'Pull requests and diffs', icon: 'Code' },
  { value: 'bug', label: 'Issues', description: 'Bugs and feature requests', icon: 'Bug' }
];

const manyOptions: MultiSelectOption[] = Array.from({ length: 30 }, (_, i) => ({
  value: `dir-${i + 1}`,
  label: `Directory ${i + 1}`,
  description: `Managed directory node #${i + 1}`
}));

const meta: Meta<IrisMultiSelectComponent> = {
  title: 'Inputs/Multi select',
  component: IrisMultiSelectComponent,
  tags: ['preview'],
  argTypes: {
    options: {
      description: 'Array of selectable options.',
      table: {
        type: { summary: 'MultiSelectOption[]' },
        defaultValue: { summary: '[]' }
      }
    },
    selectedValues: {
      description: 'Currently selected option values.',
      table: {
        type: { summary: 'string[]' },
        defaultValue: { summary: '[]' }
      }
    },
    searchPlaceholder: {
      description: 'Placeholder text for the search input.',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Search...' }
      }
    },
    open: {
      description: 'Whether the dropdown panel is open.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    showSearch: {
      description: 'Whether the search input is shown at the top of the panel.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' }
      }
    },
    showFooter: {
      description: 'Whether the footer actions (Clear / Select all) are shown.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' }
      }
    },
    selectedValuesChange: {
      description: 'Emits updated selection array when values are toggled.',
      table: {
        type: { summary: 'string[]' },
        defaultValue: { summary: '—' },
        category: 'Events'
      }
    },
    openChange: {
      description: 'Emits when the panel open state changes.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: '—' },
        category: 'Events'
      }
    }
  }
};

export default meta;
type Story = StoryObj<IrisMultiSelectComponent>;

export const Overview: Story = {
  args: {
    options: sampleOptions,
    selectedValues: ['react', 'angular'],
    searchPlaceholder: 'Search frameworks...'
  },
  argTypes: {
    selectedValuesChange: { table: { disable: true } },
    openChange: { table: { disable: true } },
    open: { table: { disable: true } }
  }
};

export const WithDescriptions: Story = {
  args: {
    options: sampleOptions,
    selectedValues: []
  }
};

export const LabelsOnly: Story = {
  args: {
    options: sampleOptions.map(({ value, label }) => ({ value, label })),
    selectedValues: ['vue']
  }
};

export const WithPreselected: Story = {
  args: {
    options: sampleOptions,
    selectedValues: ['react', 'vue', 'svelte']
  }
};

export const WithIcons: Story = {
  args: {
    options: iconOptions,
    selectedValues: ['repo', 'code'],
    searchPlaceholder: 'Search resources...'
  }
};

export const ListOnly: Story = {
  args: {
    options: sampleOptions,
    selectedValues: ['react'],
    showSearch: false,
    showFooter: false
  }
};

export const Trigger: StoryObj = {
  parameters: { controls: { disable: true } },
  decorators: [moduleMetadata({ imports: [IrisMultiSelectDirective, IrisButtonComponent] })],
  render: () => ({
    props: { options: sampleOptions, selected: ['react', 'vue'] },
    template: `
      <iris-button
        [irisMultiSelect]="options"
        [irisMultiSelectSelected]="selected"
        irisMultiSelectSearchPlaceholder="Search frameworks..."
        (irisMultiSelectSelectedChange)="selected = $event"
      >
        Select frameworks ({{ selected.length }})
      </iris-button>
    `
  })
};

export const Positions: StoryObj = {
  parameters: { controls: { disable: true } },
  decorators: [moduleMetadata({ imports: [IrisMultiSelectDirective, IrisButtonComponent] })],
  render: () => ({
    props: { options: sampleOptions },
    template: `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:3rem;width:fit-content;margin:auto;">
        <div style="display:flex;justify-content:center;">
          <iris-button [irisMultiSelect]="options" irisMultiSelectPosition="top-start">Top start</iris-button>
        </div>
        <div style="display:flex;justify-content:center;">
          <iris-button [irisMultiSelect]="options" irisMultiSelectPosition="top-end">Top end</iris-button>
        </div>
        <div style="display:flex;justify-content:center;">
          <iris-button [irisMultiSelect]="options" irisMultiSelectPosition="bottom-start">Bottom start</iris-button>
        </div>
        <div style="display:flex;justify-content:center;">
          <iris-button [irisMultiSelect]="options" irisMultiSelectPosition="bottom-end">Bottom end</iris-button>
        </div>
      </div>
    `
  })
};

export const LongList: Story = {
  args: {
    options: manyOptions,
    selectedValues: ['dir-2', 'dir-5'],
    searchPlaceholder: 'Search directories...'
  }
};
