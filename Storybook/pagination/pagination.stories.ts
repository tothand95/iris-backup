// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisPaginationComponent } from '@oneidentity/iris-ui';
import type { Meta, StoryObj } from '@storybook/angular';
import { IrisPaginationCursorDemoComponent } from './pagination-cursor-demo.component';

const meta: Meta<IrisPaginationComponent> = {
  title: 'Navigation/Pagination',
  component: IrisPaginationComponent,
  tags: ['preview'],
  argTypes: {
    type: {
      description: 'Display mode — numbered pages or simplified Previous/Next labels.',
      control: 'select',
      options: ['default', 'simplified'],
      table: {
        type: { summary: "'default' | 'simplified'" },
        defaultValue: { summary: 'default' }
      }
    },
    totalPages: {
      description: 'Total number of pages available.',
      control: 'number',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '1' }
      }
    },
    currentPage: {
      description: 'The currently active page (1-based).',
      control: 'number',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '1' }
      }
    },
    maxVisiblePages: {
      description: 'Maximum number of page buttons visible between the first and last page in default mode.',
      control: 'number',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '5' }
      }
    },
    hasNext: {
      description:
        'Whether another page exists, for cursor/keyset sources that cannot count. Setting it ignores `totalPages` and requires `type="simplified"`.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean | undefined' },
        defaultValue: { summary: 'undefined' },
        category: 'Cursor source'
      }
    },
    hasPrevious: {
      description: 'Counterpart of `hasNext`. Defaults to "not on the first page" when left unset.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean | undefined' },
        defaultValue: { summary: 'undefined' },
        category: 'Cursor source'
      }
    },
    loading: {
      description: 'Disables every control and marks the `<nav>` busy while the consumer fetches a page.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    showPosition: {
      description: 'Renders the localized position indicator between the buttons of `type="simplified"`.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    pageChange: {
      description: 'Emits when the user navigates to a different page. Carries a `reason` of `next`, `previous` or `jump`.',
      table: {
        type: { summary: 'PaginationChangeEvent' },
        defaultValue: { summary: '—' },
        category: 'Events'
      }
    },
    ariaLabel: {
      description: 'Accessible label for the `<nav>` landmark, announced by screen readers. Localise for non-English UIs.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'Pagination' }, category: 'Accessibility' }
    }
  }
};

export default meta;
type Story = StoryObj<IrisPaginationComponent>;

export const Overview: Story = {
  args: { type: 'default', totalPages: 154, currentPage: 2 },
  argTypes: {
    type: { control: 'select', options: ['default', 'simplified'] },
    totalPages: { control: 'number' },
    currentPage: { control: 'number' },
    maxVisiblePages: { table: { disable: true } },
    pageChange: { table: { disable: true } }
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;">
        <iris-pagination [type]="type" [totalPages]="totalPages" [currentPage]="currentPage"></iris-pagination>
      </div>
    `
  })
};

export const Default: Story = {
  args: { type: 'default', totalPages: 154, currentPage: 2 }
};

export const Simplified: Story = {
  args: { type: 'simplified', totalPages: 20, currentPage: 5 }
};

export const FirstPage: Story = {
  name: 'First page',
  args: { type: 'default', totalPages: 154, currentPage: 1 }
};

export const MiddlePage: Story = {
  name: 'Middle page',
  args: { type: 'default', totalPages: 154, currentPage: 95 }
};

export const LastPage: Story = {
  name: 'Last page',
  args: { type: 'default', totalPages: 154, currentPage: 154 }
};

export const FewPages: Story = {
  name: 'Few pages',
  args: { type: 'default', totalPages: 3, currentPage: 2 }
};

export const CursorPaged: Story = {
  name: 'Cursor paged',
  parameters: {
    docs: {
      description: {
        story:
          'A keyset/cursor api pages forward only and cannot count, so bind `hasNext` instead of `totalPages` and act on `event.reason`. ' +
          'Each step is a round trip, so `loading` disables the buttons and marks the nav busy.'
      }
    }
  },
  render: () => ({
    moduleMetadata: { imports: [IrisPaginationCursorDemoComponent] },
    template: `<story-pagination-cursor-demo />`
  })
};

export const Loading: Story = {
  args: { type: 'simplified', totalPages: 20, currentPage: 5, showPosition: true, loading: true }
};

export const WithPosition: Story = {
  name: 'With position',
  args: { type: 'simplified', totalPages: 20, currentPage: 5, showPosition: true }
};
