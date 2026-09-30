// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IrisAppGlobalHeaderComponent } from './app-global-header.component';
import { IrisIconComponent } from '../../../lib/icon/icon.component';
import { IRIS_APP_LAYOUT } from '../app-layout.model';

const iconName = (fixture: ComponentFixture<IrisAppGlobalHeaderComponent>): string =>
  (fixture.debugElement.query(By.directive(IrisIconComponent)).componentInstance as IrisIconComponent).name();

describe('IrisAppGlobalHeaderComponent', () => {
  let component: IrisAppGlobalHeaderComponent;
  let fixture: ComponentFixture<IrisAppGlobalHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisAppGlobalHeaderComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(IrisAppGlobalHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply sidebar toggle aria label', () => {
    fixture.componentRef.setInput('sidebarToggleAriaLabel', 'Open navigation');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-app-global-header__sidebar-toggle').getAttribute('aria-label')).toBe('Open navigation');
  });

  it('should emit sidebarToggle when no layout is injected', () => {
    const spy = vi.fn();
    component.sidebarToggle.subscribe(spy);
    fixture.nativeElement.querySelector('.iris-app-global-header__sidebar-toggle').click();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('should show the expanded sidebar icon by default', () => {
    expect(iconName(fixture)).toBe('SidebarExpanded');
  });

  it('should show the collapsed sidebar icon when the layout is collapsed', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [IrisAppGlobalHeaderComponent],
      providers: [
        {
          provide: IRIS_APP_LAYOUT,
          useValue: { collapsed: () => true, toggleCollapsed: () => undefined, keyboardShortcut: () => true }
        }
      ]
    }).compileComponents();
    const collapsedFixture = TestBed.createComponent(IrisAppGlobalHeaderComponent);
    collapsedFixture.detectChanges();
    expect(iconName(collapsedFixture)).toBe('SidebarCollapsed');
  });
});
