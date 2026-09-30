// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
/* eslint-disable no-restricted-imports */
import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

addons.setConfig({
  navSize: 256,
  bottomPanelHeight: 300,
  rightPanelWidth: 300,
  panelPosition: 'bottom',
  enableShortcuts: true,
  showToolbar: true,
  initialActive: 'sidebar',
  toolbar: {
    title: { hidden: false },
    zoom: { hidden: false },
    eject: { hidden: false },
    copy: { hidden: false },
    fullscreen: { hidden: false }
  },
  theme: create({
    base: 'dark',
    fontBase: 'Inter, system-ui, sans-serif',
    fontCode: '"IBM Plex Mono", monospace',
    brandTitle: 'Iris UI',
    brandUrl: '/',
    brandImage: '/logo-iris-ui.svg',
    brandTarget: '_self'
  })
});

addons.register('iris-ui/auto-expand', () => {
  const channel = addons.getChannel();
  channel.once('setIndex', () => {
    channel.emit('storiesExpandAll');
  });
});
