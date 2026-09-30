// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DOCUMENT, Directive, ElementRef, Injector, OnDestroy, inject, input, output } from '@angular/core';
import { Subscription } from 'rxjs';
import { IrisMultiSelectComponent } from './multi-select.component';
import { MultiSelectOption, MultiSelectPosition } from './multi-select.model';

let multiSelectIdCounter = 0;

/** Opens a searchable multi-select panel anchored to the host element. */
@Directive({
  selector: '[irisMultiSelect]',
  standalone: true,
  host: {
    '(click)': 'toggle()',
    '[attr.aria-haspopup]': '"listbox"',
    '[attr.aria-expanded]': 'isOpen'
  }
})
export class IrisMultiSelectDirective implements OnDestroy {
  /** Options rendered in the floating panel. */
  readonly irisMultiSelect = input.required<MultiSelectOption[]>();
  /** Preferred panel position relative to the trigger. */
  readonly irisMultiSelectPosition = input<MultiSelectPosition>('bottom-start');
  /** Currently selected values used to seed the panel when it opens. */
  readonly irisMultiSelectSelected = input<string[]>([]);
  /** Whether the search input is shown in the panel. */
  readonly irisMultiSelectSearch = input(true);
  /** Whether the footer actions are shown in the panel. */
  readonly irisMultiSelectFooter = input(true);
  /** Placeholder text for the panel search input. */
  readonly irisMultiSelectSearchPlaceholder = input('Search...');

  /** Emits the updated selection whenever an option is toggled. */
  readonly irisMultiSelectSelectedChange = output<string[]>();

  protected isOpen = false;

  private readonly overlay = inject(Overlay);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);

  private overlayRef: OverlayRef | null = null;
  private selectionUnsubscribe: (() => void) | null = null;
  private backdropClickSubscription: Subscription | null = null;
  private currentSelection: string[] = [];
  private readonly panelId = `iris-multi-select-${++multiSelectIdCounter}`;

  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    if (this.overlayRef) {
      return;
    }

    this.currentSelection = [...this.irisMultiSelectSelected()];

    this.overlayRef = this.overlay.create({
      positionStrategy: this.buildPositionStrategy(),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });

    const portal = new ComponentPortal(IrisMultiSelectComponent, null, this.injector);
    const componentRef = this.overlayRef.attach(portal);

    componentRef.setInput('options', this.irisMultiSelect());
    componentRef.setInput('selectedValues', this.currentSelection);
    componentRef.setInput('showSearch', this.irisMultiSelectSearch());
    componentRef.setInput('showFooter', this.irisMultiSelectFooter());
    componentRef.setInput('searchPlaceholder', this.irisMultiSelectSearchPlaceholder());
    componentRef.location.nativeElement.setAttribute('id', this.panelId);
    this.elementRef.nativeElement.setAttribute('aria-controls', this.panelId);

    const subscription = componentRef.instance.selectedValuesChange.subscribe((values: string[]) => {
      this.currentSelection = values;
      this.irisMultiSelectSelectedChange.emit(values);
    });
    this.selectionUnsubscribe = () => subscription.unsubscribe();

    this.backdropClickSubscription = this.overlayRef.backdropClick().subscribe(() => this.close());

    this.document.addEventListener('keydown', this.onDocumentKeyDown);
    this.isOpen = true;

    if (this.irisMultiSelectSearch()) {
      componentRef.changeDetectorRef.detectChanges();
      const searchInput = this.overlayRef.overlayElement.querySelector<HTMLElement>('.iris-text-input__input');
      searchInput?.focus();
    }
  }

  close(): void {
    if (!this.overlayRef) {
      return;
    }

    this.selectionUnsubscribe?.();
    this.selectionUnsubscribe = null;

    this.backdropClickSubscription?.unsubscribe();
    this.backdropClickSubscription = null;

    this.document.removeEventListener('keydown', this.onDocumentKeyDown);

    this.overlayRef.dispose();
    this.overlayRef = null;

    this.elementRef.nativeElement.removeAttribute('aria-controls');
    this.elementRef.nativeElement.focus();
    this.isOpen = false;
  }

  ngOnDestroy(): void {
    this.close();
  }

  private readonly onDocumentKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.close();
      return;
    }

    const items = this.focusableItems();
    if (items.length === 0) {
      return;
    }

    const activeInPanel = Boolean(this.document.activeElement?.closest('[role="listbox"]'));

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const index = activeInPanel ? this.activeItemIndex(items) + 1 : 0;
      items[Math.min(index, items.length - 1)].focus();
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const index = activeInPanel ? this.activeItemIndex(items) - 1 : items.length - 1;
      items[Math.max(index, 0)].focus();
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      items[0].focus();
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      items[items.length - 1].focus();
    }
  };

  private focusableItems(): HTMLElement[] {
    if (!this.overlayRef) {
      return [];
    }
    return Array.from(this.overlayRef.overlayElement.querySelectorAll<HTMLElement>('.iris-multi-select__item:not([disabled])'));
  }

  private activeItemIndex(items: HTMLElement[]): number {
    return items.indexOf(this.document.activeElement as HTMLElement);
  }

  private buildPositionStrategy() {
    const gap = 4;
    return this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions(this.buildPositionFallbacks(this.irisMultiSelectPosition(), gap))
      .withPush(false);
  }

  private buildPositionFallbacks(preferred: MultiSelectPosition, gap: number): ConnectedPosition[] {
    const allPositions: Record<MultiSelectPosition, ConnectedPosition> = {
      'bottom-end': { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: gap },
      'bottom-start': { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: gap },
      'top-end': { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -gap },
      'top-start': { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -gap }
    };

    const [side, align] = preferred.split('-') as ['bottom' | 'top', 'start' | 'end'];
    const flipSide = side === 'bottom' ? 'top' : 'bottom';
    const flipAlign = align === 'start' ? 'end' : 'start';
    // Prefer flipping the vertical side (bottom/top) before changing alignment (start/end).
    const ordered: MultiSelectPosition[] = [`${side}-${align}`, `${flipSide}-${align}`, `${side}-${flipAlign}`, `${flipSide}-${flipAlign}`];
    return ordered.map((position) => allPositions[position]);
  }
}
