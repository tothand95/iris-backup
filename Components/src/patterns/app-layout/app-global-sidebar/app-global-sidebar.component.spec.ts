// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisAppGlobalSidebarComponent } from './app-global-sidebar.component';

describe('IrisAppGlobalSidebarComponent', () => {
  let component: IrisAppGlobalSidebarComponent;
  let fixture: ComponentFixture<IrisAppGlobalSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisAppGlobalSidebarComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(IrisAppGlobalSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply aria label', () => {
    fixture.componentRef.setInput('ariaLabel', 'Workspace navigation');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('nav').getAttribute('aria-label')).toBe('Workspace navigation');
  });
});
