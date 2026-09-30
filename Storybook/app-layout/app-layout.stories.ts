// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { TitleCasePipe } from '@angular/common';
import {
  AppNavGroup,
  AppProduct,
  IrisAppAiCtaComponent,
  IrisAppGlobalHeaderComponent,
  IrisAppLayoutComponent,
  IrisAppNavExpandableComponent,
  IrisAppNavGroupComponent,
  IrisAppNavItemComponent,
  IrisAppGlobalSidebarComponent,
  IrisAppProductSwitcherComponent,
  IrisBreadcrumbComponent,
  IrisKeyboardKeyComponent
} from '@oneidentity/iris-ui';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';

const demoProducts: AppProduct[] = [
  { id: 'directory', name: 'Directory' },
  { id: 'insights', name: 'Insights' },
  { id: 'approval', name: 'Approval' }
];

const imports = [
  IrisAppLayoutComponent,
  IrisAppGlobalHeaderComponent,
  IrisAppGlobalSidebarComponent,
  IrisAppNavExpandableComponent,
  IrisAppNavGroupComponent,
  IrisAppNavItemComponent,
  IrisAppProductSwitcherComponent,
  IrisAppAiCtaComponent,
  IrisBreadcrumbComponent,
  IrisKeyboardKeyComponent,
  TitleCasePipe
];

const renderLayout = (args: {
  collapsed: boolean;
  keyboardShortcut: boolean;
  products: AppProduct[];
  logoOnly: boolean;
  activeProductId: string;
  frameHeight: number;
}) => ({
  props: { ...args, activeNavId: 'services' },
  template: `
    <div [style.height.px]="frameHeight">
    <iris-app-layout [collapsed]="collapsed" (collapsedChange)="collapsed = $event" [keyboardShortcut]="keyboardShortcut" [resizable]="resizable" [sidebarWidth]="sidebarWidth" (sidebarWidthChange)="sidebarWidth = $event">
      <iris-app-product-switcher
        [products]="logoOnly ? [] : products"
        [activeId]="activeProductId"
      />
      <iris-app-global-header>
        <iris-breadcrumb appGlobalHeaderContent
          [items]="[{label: 'Home', href: '/'}, {label: activeNavId | titlecase}]"
          [maxVisibleItems]="3"
        />
      </iris-app-global-header>
      <iris-app-global-sidebar>
        <iris-app-nav-group>
          <iris-app-nav-item label="Services" icon="StackPlus" [active]="activeNavId === 'services'" (select)="activeNavId = 'services'" />
          <iris-app-nav-expandable label="Access" icon="Key" [expanded]="true">
            <iris-app-nav-item label="Users" [active]="activeNavId === 'users'" (select)="activeNavId = 'users'" />
            <iris-app-nav-item label="Groups" [active]="activeNavId === 'groups'" (select)="activeNavId = 'groups'" />
            <iris-app-nav-item label="Roles" [active]="activeNavId === 'roles'" (select)="activeNavId = 'roles'" />
          </iris-app-nav-expandable>
          <iris-app-nav-expandable label="Configuration" icon="Sliders" [expanded]="true">
            <iris-app-nav-item label="Directories" [active]="activeNavId === 'directories'" (select)="activeNavId = 'directories'" />
            <iris-app-nav-item label="Menu point with long long long name" [active]="activeNavId === 'too long'" (select)="activeNavId = 'too long'" />
            <iris-app-nav-item label="Integration" [disabled]="true" />
          </iris-app-nav-expandable>
        </iris-app-nav-group>
        <iris-app-nav-group label="Other">
          <iris-app-nav-item label="Settings" icon="GearFine" [active]="activeNavId === 'settings'" (select)="activeNavId = 'settings'" />
          <iris-app-nav-item label="Help with" icon="Question" [active]="activeNavId === 'help'" (select)="activeNavId = 'help'" />
        </iris-app-nav-group>
      </iris-app-global-sidebar>
      <section style="display:flex;flex-direction:column;gap:12px;">
        <h2 style="margin:0;">{{ activeNavId | titlecase }}</h2>
        <p style="margin:0;">Click nav items on the left — the active state moves with you.</p>
      </section>
    </iris-app-layout>
    </div>
  `
});

interface StoryArgs {
  collapsed: boolean;
  keyboardShortcut: boolean;
  resizable: boolean;
  sidebarWidth: number;
  products: AppProduct[];
  logoOnly: boolean;
  activeProductId: string;
  frameHeight: number;
}

const meta: Meta<IrisAppLayoutComponent & StoryArgs> = {
  title: 'Patterns/App layout',
  component: IrisAppLayoutComponent,
  tags: ['preview'],
  decorators: [moduleMetadata({ imports })],
  argTypes: {
    collapsed: {
      description: 'Controls whether the sidebar is hidden.',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } }
    },
    keyboardShortcut: {
      description: 'Enables Ctrl/Cmd+B as the global sidebar toggle.',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } }
    },
    resizable: {
      description: 'Enables the drag handle on the sidebar/content column edge.',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } }
    },
    sidebarWidth: {
      description: 'Width of the sidebar rail in pixels. Two-way bindable, clamped to 210–340px.',
      control: { type: 'number', min: 210, max: 340, step: 4 },
      table: { type: { summary: 'number' }, defaultValue: { summary: '256' } }
    },
    frameHeight: {
      description: 'Story-only: pixel height of the demo frame wrapping the layout.',
      control: { type: 'number', min: 320, max: 1200, step: 20 },
      table: { category: 'Storybook only' }
    }
  }
};

export default meta;
type Story = StoryObj<IrisAppLayoutComponent & StoryArgs>;

const baseArgs: StoryArgs = {
  collapsed: false,
  keyboardShortcut: true,
  resizable: true,
  sidebarWidth: 256,
  products: demoProducts,
  logoOnly: false,
  activeProductId: 'directory',
  frameHeight: 640
};

export const Expanded: Story = {
  args: baseArgs,
  render: renderLayout
};

export const Collapsed: Story = {
  args: { ...baseArgs, collapsed: true },
  render: renderLayout
};

export const LogoOnly: Story = {
  args: { ...baseArgs, logoOnly: true },
  render: renderLayout
};

export const WithProductSwitcher: Story = {
  args: { ...baseArgs, activeProductId: 'insights' },
  render: renderLayout
};

const demoNavGroups: AppNavGroup[] = [
  {
    entries: [
      { id: 'services', label: 'Services', icon: 'StackPlus' },
      {
        id: 'access',
        label: 'Access',
        icon: 'Key',
        expanded: true,
        children: [
          { id: 'users', label: 'Users' },
          { id: 'groups', label: 'Groups' },
          { id: 'roles', label: 'Roles' }
        ]
      },
      {
        id: 'configuration',
        label: 'Configuration',
        icon: 'Sliders',
        expanded: true,
        children: [
          { id: 'directories', label: 'Directories' },
          { id: 'integration', label: 'Integration', disabled: true }
        ]
      }
    ]
  },
  {
    label: 'Other',
    entries: [
      { id: 'settings', label: 'Settings', icon: 'GearFine' },
      { id: 'help', label: 'Help with', icon: 'Question' }
    ]
  }
];

export const DataDriven: Story = {
  args: { ...baseArgs },
  render: (args: StoryArgs & { activeProductId: string; frameHeight: number }) => ({
    props: { ...args, activeNavId: 'services', navGroups: demoNavGroups },
    template: `
      <div [style.height.px]="frameHeight" style="border:1px solid var(--oi-border-color-muted);overflow:hidden;">
      <iris-app-layout [collapsed]="collapsed" (collapsedChange)="collapsed = $event" [keyboardShortcut]="keyboardShortcut" [resizable]="resizable" [sidebarWidth]="sidebarWidth" (sidebarWidthChange)="sidebarWidth = $event">
        <iris-app-product-switcher
          [products]="products"
          [activeId]="activeProductId"
        />
        <iris-app-global-header>
          <iris-breadcrumb appGlobalHeaderContent
            [items]="[{label: 'Home', href: '/'}, {label: activeNavId | titlecase}]"
            [maxVisibleItems]="3"
          />
        </iris-app-global-header>
        <iris-app-global-sidebar
          [groups]="navGroups"
          [activeId]="activeNavId"
          (itemSelected)="activeNavId = $event"
        />
        <section style="display:flex;flex-direction:column;gap:12px;">
          <h2 style="margin:0;">{{ activeNavId | titlecase }}</h2>
          <p style="margin:0;">Data-driven sidebar — nav structure defined as a plain array.</p>
        </section>
      </iris-app-layout>
      </div>
    `
  })
};

const mixedNavGroups: AppNavGroup[] = [
  {
    label: 'Data-driven',
    entries: [
      { id: 'services', label: 'Services', icon: 'StackPlus' },
      {
        id: 'access',
        label: 'Access',
        icon: 'Key',
        expanded: true,
        children: [
          { id: 'users', label: 'Users' },
          { id: 'groups', label: 'Groups' }
        ]
      }
    ]
  }
];

export const Mixed: Story = {
  args: { ...baseArgs },
  render: (args: StoryArgs & { activeProductId: string; frameHeight: number }) => ({
    props: { ...args, activeNavId: 'services', mixedNavGroups },
    template: `
      <div [style.height.px]="frameHeight" style="border:1px solid var(--oi-border-color-muted);overflow:hidden;">
      <iris-app-layout [collapsed]="collapsed" (collapsedChange)="collapsed = $event" [keyboardShortcut]="keyboardShortcut" [resizable]="resizable" [sidebarWidth]="sidebarWidth" (sidebarWidthChange)="sidebarWidth = $event">
        <iris-app-product-switcher
          [products]="products"
          [activeId]="activeProductId"
        />
        <iris-app-global-header>
          <iris-breadcrumb appGlobalHeaderContent
            [items]="[{label: 'Home', href: '/'}, {label: activeNavId | titlecase}]"
            [maxVisibleItems]="3"
          />
        </iris-app-global-header>
        <iris-app-global-sidebar
          [groups]="mixedNavGroups"
          [activeId]="activeNavId"
          (itemSelected)="activeNavId = $event"
        >
          <!-- Template-driven group rendered after data-driven groups -->
          <iris-app-nav-group label="Template-driven">
            <iris-app-nav-item label="Settings" icon="GearFine"
              [active]="activeNavId === 'settings'" (select)="activeNavId = 'settings'" />
            <iris-app-nav-item label="Help with" icon="Question"
              [active]="activeNavId === 'help'" (select)="activeNavId = 'help'" />
          </iris-app-nav-group>
        </iris-app-global-sidebar>
        <section style="display:flex;flex-direction:column;gap:12px;">
          <h2 style="margin:0;">{{ activeNavId | titlecase }}</h2>
          <p style="margin:0;">Data-driven groups appear first, template-driven group appended after.</p>
        </section>
      </iris-app-layout>
      </div>
    `
  })
};

export const WithSidebarFooter: Story = {
  args: { ...baseArgs },
  render: (args: StoryArgs & { activeProductId: string; frameHeight: number }) => ({
    props: {
      ...args,
      activeNavId: 'services',
      navGroups: demoNavGroups,
      modifierKey: navigator.userAgent.includes('Mac') ? '⌘' : 'Ctrl'
    },
    template: `
      <div [style.height.px]="frameHeight" style="border:1px solid var(--oi-border-color-muted);overflow:hidden;">
      <iris-app-layout [collapsed]="collapsed" (collapsedChange)="collapsed = $event" [keyboardShortcut]="keyboardShortcut" [resizable]="resizable" [sidebarWidth]="sidebarWidth" (sidebarWidthChange)="sidebarWidth = $event">
        <iris-app-product-switcher
          [products]="products"
          [activeId]="activeProductId"
        />
        <iris-app-global-header>
          <iris-breadcrumb appGlobalHeaderContent
            [items]="[{label: 'Home', href: '/'}, {label: activeNavId | titlecase}]"
            [maxVisibleItems]="3"
          />
        </iris-app-global-header>
        <iris-app-global-sidebar
          [groups]="navGroups"
          [activeId]="activeNavId"
          (itemSelected)="activeNavId = $event"
        >
          <!-- Footer content is opt-in; the sidebar renders nothing here by default -->
          <span appGlobalSidebarFooter style="display:inline-flex;align-items:center;gap:4px;">
            <iris-keyboard-key [key]="[modifierKey, 'B']" />
            <span>to toggle the sidebar</span>
          </span>
        </iris-app-global-sidebar>
        <section style="display:flex;flex-direction:column;gap:12px;">
          <h2 style="margin:0;">{{ activeNavId | titlecase }}</h2>
          <p style="margin:0;">Sidebar footer content projected through <code>[appGlobalSidebarFooter]</code>.</p>
        </section>
      </iris-app-layout>
      </div>
    `
  })
};
