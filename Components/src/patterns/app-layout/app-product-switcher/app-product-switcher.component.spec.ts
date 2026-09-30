// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisAppProductSwitcherComponent } from './app-product-switcher.component';

describe('IrisAppProductSwitcherComponent', () => {
  let component: IrisAppProductSwitcherComponent;
  let fixture: ComponentFixture<IrisAppProductSwitcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisAppProductSwitcherComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(IrisAppProductSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render active product name', () => {
    fixture.componentRef.setInput('products', [
      { id: 'one', name: 'One' },
      { id: 'two', name: 'Two' }
    ]);
    fixture.componentRef.setInput('activeId', 'two');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Two');
  });

  it('should render logo image', () => {
    fixture.componentRef.setInput('logoSrc', 'logo.svg');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')?.getAttribute('src')).toBe('logo.svg');
  });

  it('should render logo-only as a button', () => {
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
    expect(fixture.nativeElement.querySelector('button.iris-app-product-switcher--logo-only')).toBeTruthy();
  });

  it('should emit logoClick in logo-only mode', () => {
    const spy = vi.fn();
    component.logoClick.subscribe(spy);
    fixture.nativeElement.querySelector('.iris-app-product-switcher').click();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('should render name without a menu when only one product is given', () => {
    fixture.componentRef.setInput('products', [{ id: 'one', name: 'One' }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('One');
    expect(fixture.nativeElement.querySelector('iris-icon')).toBeNull();
    expect(fixture.nativeElement.querySelector('[irisMenu]')).toBeNull();
  });

  it('should emit logoClick for a single product', () => {
    const spy = vi.fn();
    component.logoClick.subscribe(spy);
    fixture.componentRef.setInput('products', [{ id: 'one', name: 'One' }]);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.iris-app-product-switcher').click();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('should emit productChange on menu selection', () => {
    const spy = vi.fn();
    component.productChange.subscribe(spy);
    fixture.componentRef.setInput('products', [{ id: 'directory', name: 'Directory' }]);
    fixture.detectChanges();
    component.onMenuItemSelected({ id: 'directory', type: 'item', label: 'Directory' });
    expect(spy).toHaveBeenCalledWith({ id: 'directory', name: 'Directory' });
  });
});
