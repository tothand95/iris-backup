// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisCodeBlocksComponent } from '@oneidentity/iris-ui';
import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta<IrisCodeBlocksComponent> = {
  title: 'Display/Code blocks',
  component: IrisCodeBlocksComponent,
  tags: ['preview'],
  argTypes: {
    type: {
      description: 'Display mode of the code block.',
      control: 'select',
      options: ['inline', 'single-line', 'multi-line'],
      table: {
        type: { summary: "'inline' | 'single-line' | 'multi-line'" },
        defaultValue: { summary: 'multi-line' }
      }
    },
    variant: {
      description: 'Visual variant for inline code snippets.',
      control: 'select',
      options: ['default', 'alt'],
      table: {
        type: { summary: "'default' | 'alt'" },
        defaultValue: { summary: 'default' }
      }
    },
    code: {
      description: 'The code content to display.',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' }
      }
    },
    showLineNumbers: {
      description: 'Whether to show line numbers (multi-line only).',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' }
      }
    },
    fullWidth: {
      description: 'Stretch block modes to fill the container width instead of fitting content.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    copied: {
      description: 'Emits the code string when the copy button is clicked.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '—' },
        category: 'Events'
      }
    }
  }
};

export default meta;
type Story = StoryObj<IrisCodeBlocksComponent>;

export const Overview: Story = {
  args: { showLineNumbers: true, fullWidth: true },
  argTypes: {
    showLineNumbers: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    type: { table: { disable: true } },
    variant: { table: { disable: true } },
    code: { table: { disable: true } },
    copied: { table: { disable: true } }
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;padding:1rem;">
        <div>
          <h4 style="margin:0 0 8px">Inline</h4>
          <p>Run <iris-code-blocks type="inline" code="pnpm install"></iris-code-blocks> to install dependencies.</p>
          <p>Use <iris-code-blocks type="inline" variant="alt" code="npx nx build"></iris-code-blocks> for building.</p>
        </div>
        <div>
          <h4 style="margin:0 0 8px">Single line</h4>
          <iris-code-blocks type="single-line" [fullWidth]="fullWidth" code="git clone https://github.com/oi-eng/poc-iris-react.git"></iris-code-blocks>
        </div>
        <div>
          <h4 style="margin:0 0 8px">Multi-line</h4>
          <iris-code-blocks
            type="multi-line"
            [showLineNumbers]="showLineNumbers"
            [fullWidth]="fullWidth"
            code="import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})"
          ></iris-code-blocks>
        </div>
      </div>
    `
  })
};

export const Inline: Story = {
  args: { type: 'inline', code: 'pnpm install', variant: 'default' }
};

export const InlineAlt: Story = {
  args: { type: 'inline', code: 'npx nx build', variant: 'alt' }
};

export const SingleLine: Story = {
  args: { type: 'single-line', code: 'git clone https://github.com/oi-eng/poc-iris-react.git' }
};

export const MultiLine: Story = {
  args: {
    type: 'multi-line',
    showLineNumbers: true,
    code: `import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n})`
  }
};

export const MultiLineWithoutLineNumbers: Story = {
  args: {
    type: 'multi-line',
    showLineNumbers: false,
    code: `const greeting = 'Hello, world!';\nconsole.log(greeting);`
  }
};

export const FullWidth: Story = {
  args: {
    type: 'multi-line',
    showLineNumbers: true,
    fullWidth: true,
    code: `import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n})`
  }
};

export const ManyLines: Story = {
  args: {
    type: 'multi-line',
    showLineNumbers: true,
    fullWidth: true,
    code: [
      `import { Component, signal, computed } from '@angular/core';`,
      `import { CommonModule } from '@angular/common';`,
      ``,
      `@Component({`,
      `  selector: 'app-counter',`,
      `  standalone: true,`,
      `  imports: [CommonModule],`,
      `  template: \`<button (click)="increment()">{{ label() }}</button>\`,`,
      `})`,
      `export class CounterComponent {`,
      `  private readonly count = signal(0);`,
      ``,
      `  readonly label = computed(() => \`Count: \${this.count()}\`);`,
      ``,
      `  increment(): void {`,
      `    this.count.update((value) => value + 1);`,
      `  }`,
      ``,
      `  decrement(): void {`,
      `    this.count.update((value) => value - 1);`,
      `  }`,
      ``,
      `  reset(): void {`,
      `    this.count.set(0);`,
      `  }`,
      `}`,
      ``,
      `function createRange(size: number): number[] {`,
      `  return Array.from({ length: size }, (_, index) => index);`,
      `}`,
      ``,
      `const ids = createRange(5).map((n) => \`item-\${n}\`);`,
      `console.log(ids);`,
      ``,
      `export { createRange };`
    ].join('\n')
  }
};
