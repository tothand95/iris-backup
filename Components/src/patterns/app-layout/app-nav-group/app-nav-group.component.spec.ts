// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisAppNavGroupComponent } from './app-nav-group.component';

describe('IrisAppNavGroupComponent', () => {
  let component: IrisAppNavGroupComponent;
  let fixture: ComponentFixture<IrisAppNavGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisAppNavGroupComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(IrisAppNavGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a label header', () => {
    fixture.componentRef.setInput('label', 'Other');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('iris-app-nav-group-header')).toBeTruthy();
  });

  it('should apply collapsible input', () => {
    fixture.componentRef.setInput('label', 'Other');
    fixture.componentRef.setInput('collapsible', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-app-nav-group-header').getAttribute('aria-expanded')).toBe('true');
  });

  it('should hide items when expanded is false', () => {
    fixture.componentRef.setInput('expanded', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-app-nav-group__items')).toBeNull();
  });
});
