// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, effect, forwardRef, inject, input, model, signal } from '@angular/core';
import { irisLabel } from '@oneidentity/iris-ui/i18n';
import { IRIS_APP_LAYOUT } from '../app-layout.model';

/** Sidebar width step applied by the keyboard resize shortcuts. */
const RESIZE_KEYBOARD_STEP = 16;

/** Dragging the handle closer than this to the layout's left edge collapses the sidebar instead. */
const COLLAPSE_SNAP_THRESHOLD = 150;

/** Fixed bounds of the sidebar rail. */
const MIN_SIDEBAR_WIDTH = 210;
const MAX_SIDEBAR_WIDTH = 340;

@Component({
  selector: 'iris-app-layout',
  standalone: true,
  imports: [],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: IRIS_APP_LAYOUT, useExisting: forwardRef(() => IrisAppLayoutComponent) }],
  host: {
    '[class.iris-app-layout-host--collapsed]': 'collapsed()',
    '[class.iris-app-layout-host--resizing]': 'resizing()'
  }
})
export class IrisAppLayoutComponent {
  collapsed = model(false);
  keyboardShortcut = input(true);
  resizable = input(true);
  sidebarWidth = model(256);

  protected readonly minSidebarWidth = MIN_SIDEBAR_WIDTH;
  protected readonly maxSidebarWidth = MAX_SIDEBAR_WIDTH;

  protected readonly resizeLabel = irisLabel('appLayout.resizeSidebar');
  protected readonly resizing = signal(false);

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private dragStartX: number | null = null;
  private dragStartWidth = 0;
  private dragLayoutLeft = 0;

  constructor() {
    // The rail width feeds both the grid column and the product slot, so publish it as a custom property.
    effect(() => {
      const width = this.clampWidth(this.sidebarWidth());
      this.elementRef.nativeElement.style.setProperty('--iris-app-layout-sidebar-expanded-width', `${width}px`);
    });
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.repeat || !this.keyboardShortcut() || event.key.toLowerCase() !== 'b' || (!event.ctrlKey && !event.metaKey)) {
      return;
    }
    if (this.isTextEntryElement(event.target)) {
      return;
    }
    event.preventDefault();
    this.toggleCollapsed();
  }

  toggleCollapsed(): void {
    this.collapsed.set(!this.collapsed());
  }

  protected onResizeStart(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    this.dragStartX = event.clientX;
    this.dragStartWidth = this.clampWidth(this.sidebarWidth());
    this.dragLayoutLeft = this.elementRef.nativeElement.getBoundingClientRect().left;
    this.resizing.set(true);
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  protected onResizeMove(event: PointerEvent): void {
    if (this.dragStartX === null) {
      return;
    }
    if (event.clientX - this.dragLayoutLeft < COLLAPSE_SNAP_THRESHOLD) {
      // Dragging into the layout's left edge collapses instead of resizing; keep the width for the next expand.
      this.sidebarWidth.set(this.dragStartWidth);
      this.onResizeEnd(event);
      this.collapsed.set(true);
      return;
    }
    this.sidebarWidth.set(this.clampWidth(this.dragStartWidth + (event.clientX - this.dragStartX)));
  }

  protected onResizeEnd(event: PointerEvent): void {
    if (this.dragStartX === null) {
      return;
    }
    this.dragStartX = null;
    this.resizing.set(false);
    const target = event.target as HTMLElement;
    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
  }

  protected onResizeKeydown(event: KeyboardEvent): void {
    const width = this.clampWidth(this.sidebarWidth());
    switch (event.key) {
      case 'ArrowLeft':
        this.sidebarWidth.set(this.clampWidth(width - RESIZE_KEYBOARD_STEP));
        break;
      case 'ArrowRight':
        this.sidebarWidth.set(this.clampWidth(width + RESIZE_KEYBOARD_STEP));
        break;
      case 'Home':
        this.sidebarWidth.set(MIN_SIDEBAR_WIDTH);
        break;
      case 'End':
        this.sidebarWidth.set(MAX_SIDEBAR_WIDTH);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  protected clampWidth(width: number): number {
    return Math.min(Math.max(width, MIN_SIDEBAR_WIDTH), MAX_SIDEBAR_WIDTH);
  }

  private isTextEntryElement(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }
    if (target.isContentEditable || target.tagName.toLowerCase() === 'textarea') {
      return true;
    }
    if (target instanceof HTMLInputElement) {
      return ['text', 'search', 'email', 'url', 'tel', 'password', 'number'].includes(target.type);
    }
    return false;
  }
}
