// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisAppNavItemComponent } from './app-nav-item.component';

describe('IrisAppNavItemComponent', () => {
  let component: IrisAppNavItemComponent;
  let fixture: ComponentFixture<IrisAppNavItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisAppNavItemComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(IrisAppNavItemComponent);
    fixture.componentRef.setInput('label', 'Directory management');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the required label', () => {
    fixture.componentRef.setInput('label', 'Insights');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Insights');
  });

  it('should render an icon', () => {
    fixture.componentRef.setInput('icon', 'Sparkle');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('iris-icon')).toBeTruthy();
  });

  it('should apply active state', () => {
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-app-nav-item').classList.contains('iris-app-nav-item--active')).toBe(true);
  });

  it('should apply disabled state', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-app-nav-item').getAttribute('aria-disabled')).toBe('true');
  });

  it('should render an anchor when href is set', () => {
    fixture.componentRef.setInput('href', '/directory');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a')?.getAttribute('href')).toBe('/directory');
  });

  it('should emit select when enabled', () => {
    const spy = vi.fn();
    component.select.subscribe(spy);
    fixture.nativeElement.querySelector('.iris-app-nav-item').click();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('should skip select when disabled', () => {
    const spy = vi.fn();
    component.select.subscribe(spy);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.iris-app-nav-item').click();
    expect(spy).not.toHaveBeenCalled();
  });
});
