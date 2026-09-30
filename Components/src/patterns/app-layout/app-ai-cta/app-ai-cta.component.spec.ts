// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisAppAiCtaComponent } from './app-ai-cta.component';

describe('IrisAppAiCtaComponent', () => {
  let component: IrisAppAiCtaComponent;
  let fixture: ComponentFixture<IrisAppAiCtaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisAppAiCtaComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(IrisAppAiCtaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply label', () => {
    fixture.componentRef.setInput('label', 'Ask Iris');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Ask Iris');
  });

  it('should apply disabled state', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
  });

  it('should emit activate when clicked', () => {
    const spy = vi.fn();
    component.activate.subscribe(spy);
    fixture.nativeElement.querySelector('button').click();
    expect(spy).toHaveBeenCalledOnce();
  });
});
