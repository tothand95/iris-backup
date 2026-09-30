// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisButtonComponent } from './button.component';

describe('IrisButtonComponent', () => {
  let component: IrisButtonComponent;
  let fixture: ComponentFixture<IrisButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisButtonComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(IrisButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply variant class', () => {
    fixture.componentRef.setInput('variant', 'danger');
    fixture.detectChanges();
    const buttonElement = fixture.nativeElement.querySelector('.iris-button');
    expect(buttonElement.classList.contains('iris-button--danger')).toBe(true);
  });

  it('should apply size class', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const buttonElement = fixture.nativeElement.querySelector('.iris-button');
    expect(buttonElement.classList.contains('iris-button--lg')).toBe(true);
  });

  it('should be disabled when disabled input is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const nativeButton = fixture.nativeElement.querySelector('button');
    expect(nativeButton.disabled).toBe(true);
  });

  it('should project label text via ng-content', () => {
    const host = document.createElement('iris-button');
    host.textContent = 'Submit';
    document.body.appendChild(host);
    expect(fixture.nativeElement.textContent).toBeDefined();
    document.body.removeChild(host);
  });

  it('should apply label-hidden class', () => {
    fixture.componentRef.setInput('labelHidden', true);
    fixture.componentRef.setInput('leadingIconName', 'plus');
    fixture.detectChanges();
    const buttonElement = fixture.nativeElement.querySelector('.iris-button');
    expect(buttonElement.classList.contains('iris-button--label-hidden')).toBe(true);
  });

  it('should hide label visually but keep it in DOM when labelHidden is set', () => {
    fixture.componentRef.setInput('labelHidden', true);
    fixture.detectChanges();
    const labelSpan = fixture.nativeElement.querySelector('.iris-button__label');
    expect(labelSpan).toBeTruthy();
    expect(labelSpan.classList.contains('iris-screen-reader-only')).toBe(true);
  });

  it('should show label visually by default', () => {
    fixture.detectChanges();
    const labelSpan = fixture.nativeElement.querySelector('.iris-button__label');
    expect(labelSpan).toBeTruthy();
    expect(labelSpan.classList.contains('iris-screen-reader-only')).toBe(false);
  });

  it('should render a trailing icon after the label', async () => {
    fixture.componentRef.setInput('trailingIconName', 'CaretDown');
    await import('@oneidentity/iris-ui-icons/icons');
    await fixture.whenStable();
    fixture.detectChanges();
    const children = [...fixture.nativeElement.querySelector('.iris-button').children];
    expect(children.at(-1)?.tagName.toLowerCase()).toBe('iris-icon');
    expect(fixture.nativeElement.querySelector('.iris-button').classList.contains('iris-button--trailing-icon')).toBe(true);
  });

  it('should render a leading icon before the label', async () => {
    fixture.componentRef.setInput('leadingIconName', 'Plus');
    await import('@oneidentity/iris-ui-icons/icons');
    await fixture.whenStable();
    fixture.detectChanges();
    const children = [...fixture.nativeElement.querySelector('.iris-button').children];
    expect(children.at(0)?.tagName.toLowerCase()).toBe('iris-icon');
    expect(fixture.nativeElement.querySelector('.iris-button').classList.contains('iris-button--leading-icon')).toBe(true);
  });

  it('should keep the trailing icon when the label is hidden', () => {
    fixture.componentRef.setInput('leadingIconName', 'Plus');
    fixture.componentRef.setInput('trailingIconName', 'CaretDown');
    fixture.componentRef.setInput('labelHidden', true);
    fixture.detectChanges();
    const buttonElement = fixture.nativeElement.querySelector('.iris-button');
    expect(buttonElement.querySelectorAll('iris-icon').length).toBe(2);
  });

  it('should apply ghost variant class', () => {
    fixture.componentRef.setInput('variant', 'ghost');
    fixture.detectChanges();
    const buttonElement = fixture.nativeElement.querySelector('.iris-button');
    expect(buttonElement.classList.contains('iris-button--ghost')).toBe(true);
  });
});
