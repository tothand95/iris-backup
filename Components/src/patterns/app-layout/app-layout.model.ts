// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import type { IconName } from '../../lib/icon/icon.model';
import { InjectionToken } from '@angular/core';

export interface AppProduct {
  id: string;
  name: string;
  icon?: IconName;
}

/** A leaf navigation item. */
export interface AppNavItem {
  id: string;
  label: string;
  icon?: IconName;
  href?: string;
  disabled?: boolean;
}

/** An expandable navigation group containing only leaf items. */
export interface AppNavExpandableItem {
  id: string;
  label: string;
  icon?: IconName;
  expanded?: boolean;
  children: AppNavItem[];
}

/** A named group of navigation entries. */
export interface AppNavGroup {
  label?: string;
  collapsible?: boolean;
  entries: (AppNavItem | AppNavExpandableItem)[];
}

/** Type guard to distinguish expandable entries. */
export function isNavExpandable(entry: AppNavItem | AppNavExpandableItem): entry is AppNavExpandableItem {
  return Array.isArray((entry as AppNavExpandableItem).children);
}

export interface AppLayoutContext {
  collapsed: () => boolean;
  toggleCollapsed: () => void;
  keyboardShortcut: () => boolean;
}

export const IRIS_APP_LAYOUT = new InjectionToken<AppLayoutContext>('IRIS_APP_LAYOUT');
