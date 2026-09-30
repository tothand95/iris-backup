// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisAppLayoutComponent } from './app-layout.component';

describe('IrisAppLayoutComponent', () => {
  let component: IrisAppLayoutComponent;
  let fixture: ComponentFixture<IrisAppLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisAppLayoutComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(IrisAppLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply collapsed state', () => {
    fixture.componentRef.setInput('collapsed', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-app-layout').classList.contains('iris-app-layout--collapsed')).toBe(true);
  });

  it('should ignore keyboard shortcut when disabled', () => {
    fixture.componentRef.setInput('keyboardShortcut', false);
    component.onDocumentKeydown(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true }));
    expect(component.collapsed()).toBe(false);
  });

  it('should toggle collapsed on Ctrl+B', () => {
    component.onDocumentKeydown(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true }));
    expect(component.collapsed()).toBe(true);
  });

  it('should ignore Ctrl+B from inputs', () => {
    const input = document.createElement('input');
    const event = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true });
    Object.defineProperty(event, 'target', { value: input });
    component.onDocumentKeydown(event);
    expect(component.collapsed()).toBe(false);
  });

  it('should expose the sidebar width as a custom property', () => {
    fixture.componentRef.setInput('sidebarWidth', 300);
    fixture.detectChanges();
    expect(fixture.nativeElement.style.getPropertyValue('--iris-app-layout-sidebar-expanded-width')).toBe('300px');
  });

  it('should clamp the sidebar width to the allowed range', () => {
    fixture.componentRef.setInput('sidebarWidth', 900);
    fixture.detectChanges();
    expect(fixture.nativeElement.style.getPropertyValue('--iris-app-layout-sidebar-expanded-width')).toBe('340px');
    fixture.componentRef.setInput('sidebarWidth', 40);
    fixture.detectChanges();
    expect(fixture.nativeElement.style.getPropertyValue('--iris-app-layout-sidebar-expanded-width')).toBe('210px');
  });

  it('should resize with the keyboard', () => {
    const resizer: HTMLElement = fixture.nativeElement.querySelector('.iris-app-layout__resizer');
    resizer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(component.sidebarWidth()).toBe(272);
    resizer.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    expect(component.sidebarWidth()).toBe(210);
  });

  it('should collapse instead of resizing when dragged near the layout edge', () => {
    const resizer: HTMLElement = fixture.nativeElement.querySelector('.iris-app-layout__resizer');
    const pointer = (type: string, clientX: number) =>
      resizer.dispatchEvent(Object.assign(new MouseEvent(type, { bubbles: true, clientX, button: 0 }), { pointerId: 1 }));
    resizer.setPointerCapture = () => undefined;
    resizer.hasPointerCapture = () => false;
    // jsdom reports a zero-sized host, so clientX is measured straight from the layout's left edge.

    pointer('pointerdown', 300);
    pointer('pointermove', 260);
    fixture.detectChanges();
    expect(component.sidebarWidth()).toBe(216);

    pointer('pointermove', 80);
    fixture.detectChanges();
    expect(component.collapsed()).toBe(true);
    expect(component.sidebarWidth()).toBe(256);
  });

  it('should not render the resizer when collapsed or not resizable', () => {
    fixture.componentRef.setInput('collapsed', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-app-layout__resizer')).toBeNull();
    fixture.componentRef.setInput('collapsed', false);
    fixture.componentRef.setInput('resizable', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-app-layout__resizer')).toBeNull();
  });
});
