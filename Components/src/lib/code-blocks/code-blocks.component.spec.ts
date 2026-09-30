// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisCodeBlocksComponent } from './code-blocks.component';

describe('IrisCodeBlocksComponent', () => {
  let component: IrisCodeBlocksComponent;
  let fixture: ComponentFixture<IrisCodeBlocksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisCodeBlocksComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(IrisCodeBlocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render inline code', () => {
    fixture.componentRef.setInput('type', 'inline');
    fixture.componentRef.setInput('code', 'npm install');
    fixture.detectChanges();
    const codeElement = fixture.nativeElement.querySelector('.iris-code-blocks--inline');
    expect(codeElement).toBeTruthy();
    expect(codeElement.textContent).toBe('npm install');
  });

  it('should apply alt variant for inline type', () => {
    fixture.componentRef.setInput('type', 'inline');
    fixture.componentRef.setInput('variant', 'alt');
    fixture.detectChanges();
    const codeElement = fixture.nativeElement.querySelector('.iris-code-blocks--alt');
    expect(codeElement).toBeTruthy();
  });

  it('should render single-line code with copy button', () => {
    fixture.componentRef.setInput('type', 'single-line');
    fixture.componentRef.setInput('code', 'git clone repo.git');
    fixture.detectChanges();
    const block = fixture.nativeElement.querySelector('.iris-code-blocks--single-line');
    expect(block).toBeTruthy();
    const button = fixture.nativeElement.querySelector('.iris-code-blocks__copy-button');
    expect(button).toBeTruthy();
  });

  it('should render multi-line code with line numbers by default', () => {
    fixture.componentRef.setInput('type', 'multi-line');
    fixture.componentRef.setInput('code', 'line 1\nline 2\nline 3');
    fixture.detectChanges();
    const lineNumbers = fixture.nativeElement.querySelector('.iris-code-blocks__line-numbers');
    expect(lineNumbers).toBeTruthy();
    expect(lineNumbers.textContent).toBe('1\n2\n3');
  });

  it('should hide line numbers when showLineNumbers is false', () => {
    fixture.componentRef.setInput('type', 'multi-line');
    fixture.componentRef.setInput('code', 'line 1\nline 2');
    fixture.componentRef.setInput('showLineNumbers', false);
    fixture.detectChanges();
    const lineNumbers = fixture.nativeElement.querySelector('.iris-code-blocks__line-numbers');
    expect(lineNumbers).toBeNull();
  });

  it('should copy code and emit copied event when copy button is clicked', async () => {
    fixture.componentRef.setInput('type', 'single-line');
    fixture.componentRef.setInput('code', 'test code');
    fixture.detectChanges();

    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    const emitSpy = vi.spyOn(component.copied, 'emit');

    await component.copyToClipboard();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test code');
    expect(emitSpy).toHaveBeenCalledWith('test code');
  });

  it('should not emit copied event when the clipboard write fails', async () => {
    fixture.componentRef.setInput('type', 'single-line');
    fixture.componentRef.setInput('code', 'test code');
    fixture.detectChanges();

    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) }
    });
    const emitSpy = vi.spyOn(component.copied, 'emit');

    await expect(component.copyToClipboard()).rejects.toThrow('denied');
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should apply the full-width host class when fullWidth is set on a block mode', () => {
    fixture.componentRef.setInput('type', 'multi-line');
    fixture.componentRef.setInput('fullWidth', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).toContain('iris-code-blocks-host--full-width');
  });

  it('should not apply the full-width host class for inline type', () => {
    fixture.componentRef.setInput('type', 'inline');
    fixture.componentRef.setInput('fullWidth', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).not.toContain('iris-code-blocks-host--full-width');
  });
});
