// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisPaginationComponent } from './pagination.component';
import type { PaginationChangeEvent } from './pagination.model';

describe('IrisPaginationComponent', () => {
  let component: IrisPaginationComponent;
  let fixture: ComponentFixture<IrisPaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisPaginationComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(IrisPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render default type with page numbers', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();
    const pageButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--page');
    expect(pageButtons.length).toBe(5);
  });

  it('should mark the current page as active', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 3);
    fixture.detectChanges();
    const activeButton = fixture.nativeElement.querySelector('.iris-pagination__item--active');
    expect(activeButton).toBeTruthy();
    expect(activeButton.textContent.trim()).toBe('3');
  });

  it('should set aria-current on the active page', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 2);
    fixture.detectChanges();
    const activeButton = fixture.nativeElement.querySelector('[aria-current="page"]');
    expect(activeButton).toBeTruthy();
    expect(activeButton.textContent.trim()).toBe('2');
  });

  it('should disable previous button on first page', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();
    const navButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--nav');
    expect(navButtons[0].disabled).toBe(true);
  });

  it('should disable next button on last page', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 5);
    fixture.detectChanges();
    const navButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--nav');
    expect(navButtons[1].disabled).toBe(true);
  });

  it('should emit pageChange when clicking a page', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();

    const emitted: PaginationChangeEvent[] = [];
    component.pageChange.subscribe((event: PaginationChangeEvent) => emitted.push(event));

    const pageButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--page');
    pageButtons[2].click();
    expect(emitted.length).toBe(1);
    expect(emitted[0]).toEqual({ page: 3, previousPage: 1, totalPages: 5, reason: 'jump' });
  });

  it('should emit pageChange when clicking previous', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 3);
    fixture.detectChanges();

    const emitted: PaginationChangeEvent[] = [];
    component.pageChange.subscribe((event: PaginationChangeEvent) => emitted.push(event));

    const navButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--nav');
    navButtons[0].click();
    expect(emitted.length).toBe(1);
    expect(emitted[0]).toEqual({ page: 2, previousPage: 3, totalPages: 5, reason: 'previous' });
  });

  it('should emit pageChange when clicking next', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 3);
    fixture.detectChanges();

    const emitted: PaginationChangeEvent[] = [];
    component.pageChange.subscribe((event: PaginationChangeEvent) => emitted.push(event));

    const navButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--nav');
    navButtons[1].click();
    expect(emitted.length).toBe(1);
    expect(emitted[0]).toEqual({ page: 4, previousPage: 3, totalPages: 5, reason: 'next' });
  });

  it('should show separators for many pages', () => {
    fixture.componentRef.setInput('totalPages', 154);
    fixture.componentRef.setInput('currentPage', 2);
    fixture.detectChanges();
    const separators = fixture.nativeElement.querySelectorAll('.iris-pagination__item--separator');
    expect(separators.length).toBeGreaterThan(0);
  });

  it('should render simplified type with Previous and Next labels', () => {
    fixture.componentRef.setInput('type', 'simplified');
    fixture.componentRef.setInput('totalPages', 10);
    fixture.componentRef.setInput('currentPage', 5);
    fixture.detectChanges();
    const labelButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--label');
    expect(labelButtons.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Previous');
    expect(fixture.nativeElement.textContent).toContain('Next');
  });

  it('should disable Previous in simplified mode on first page', () => {
    fixture.componentRef.setInput('type', 'simplified');
    fixture.componentRef.setInput('totalPages', 10);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();
    const labelButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--label');
    expect(labelButtons[0].disabled).toBe(true);
  });

  it('should disable Next in simplified mode on last page', () => {
    fixture.componentRef.setInput('type', 'simplified');
    fixture.componentRef.setInput('totalPages', 10);
    fixture.componentRef.setInput('currentPage', 10);
    fixture.detectChanges();
    const labelButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--label');
    expect(labelButtons[1].disabled).toBe(true);
  });

  it('should not emit pageChange when clicking the current page', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 3);
    fixture.detectChanges();

    const emitted: PaginationChangeEvent[] = [];
    component.pageChange.subscribe((event: PaginationChangeEvent) => emitted.push(event));

    const activeButton = fixture.nativeElement.querySelector('.iris-pagination__item--active');
    activeButton.click();
    expect(emitted).toEqual([]);
  });

  it('should not update currentPage internally after navigation (controlled component)', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();

    const navButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--nav');
    navButtons[1].click();
    fixture.detectChanges();

    expect(component.currentPage()).toBe(1);
  });

  it('should update maxVisiblePages', () => {
    fixture.componentRef.setInput('totalPages', 20);
    fixture.componentRef.setInput('currentPage', 10);
    fixture.componentRef.setInput('maxVisiblePages', 3);
    fixture.detectChanges();
    const pageButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--page');
    expect(pageButtons.length).toBeLessThan(20);
  });

  it('should recalculate startPage correctly when currentPage is near the end', () => {
    fixture.componentRef.setInput('totalPages', 10);
    fixture.componentRef.setInput('currentPage', 9);
    fixture.detectChanges();
    const activeButton = fixture.nativeElement.querySelector('.iris-pagination__item--active');
    expect(activeButton).toBeTruthy();
    expect(activeButton.textContent.trim()).toBe('9');
    // With halfVisible=2, current(9) >= total(10)-2=8 → startPage recalculated via line 43
    const pages = component.visiblePages();
    expect(pages).toContain(6);
  });

  it('should use default aria-label "Pagination" on nav', () => {
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav.getAttribute('aria-label')).toBe('Pagination');
  });

  it('should use custom ariaLabel on nav', () => {
    fixture.componentRef.setInput('ariaLabel', 'Site navigation');
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav.getAttribute('aria-label')).toBe('Site navigation');
  });

  describe('cursor source', () => {
    /** Mirrors a keyset api: no total is knowable, the api only says whether another page exists. */
    function asCursorSource(hasNext: boolean, currentPage = 1, hasPrevious?: boolean): void {
      fixture.componentRef.setInput('type', 'simplified');
      fixture.componentRef.setInput('currentPage', currentPage);
      fixture.componentRef.setInput('hasNext', hasNext);
      if (hasPrevious !== undefined) {
        fixture.componentRef.setInput('hasPrevious', hasPrevious);
      }
      fixture.detectChanges();
    }

    it('should enable Next from hasNext even though totalPages is left at its default', () => {
      asCursorSource(true);
      const labelButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--label');
      expect(component.totalPages()).toBe(1);
      expect(labelButtons[1].disabled).toBe(false);
    });

    it('should disable Next when hasNext is false regardless of totalPages', () => {
      fixture.componentRef.setInput('type', 'simplified');
      fixture.componentRef.setInput('totalPages', 99);
      fixture.componentRef.setInput('hasNext', false);
      fixture.detectChanges();
      const labelButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--label');
      expect(labelButtons[1].disabled).toBe(true);
    });

    it('should let hasPrevious override the first-page default', () => {
      asCursorSource(true, 1, true);
      const labelButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--label');
      expect(labelButtons[0].disabled).toBe(false);
    });

    it('should never fall back to totalPages for Next once in cursor mode', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      fixture.componentRef.setInput('type', 'simplified');
      fixture.componentRef.setInput('totalPages', 99);
      fixture.componentRef.setInput('currentPage', 2);
      fixture.componentRef.setInput('hasPrevious', true);
      fixture.detectChanges();

      const labelButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--label');
      expect(labelButtons[1].disabled).toBe(true);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('hasPrevious is set without hasNext'));
      warnSpy.mockRestore();
    });

    it('should report totalPages as undefined because the collection cannot be counted', () => {
      asCursorSource(true, 3);

      const emitted: PaginationChangeEvent[] = [];
      component.pageChange.subscribe((event: PaginationChangeEvent) => emitted.push(event));

      fixture.nativeElement.querySelectorAll('.iris-pagination__item--label')[1].click();
      expect(emitted[0]).toEqual({ page: 4, previousPage: 3, totalPages: undefined, reason: 'next' });
    });

    it('should ignore goToPage so a consumer is never handed a page it cannot address', () => {
      asCursorSource(true, 3);

      const emitted: PaginationChangeEvent[] = [];
      component.pageChange.subscribe((event: PaginationChangeEvent) => emitted.push(event));

      component.goToPage(7);
      expect(emitted).toEqual([]);
    });
  });

  describe('change reason', () => {
    it('should report previous for the simplified Previous button', () => {
      fixture.componentRef.setInput('type', 'simplified');
      fixture.componentRef.setInput('totalPages', 10);
      fixture.componentRef.setInput('currentPage', 5);
      fixture.detectChanges();

      const emitted: PaginationChangeEvent[] = [];
      component.pageChange.subscribe((event: PaginationChangeEvent) => emitted.push(event));

      fixture.nativeElement.querySelectorAll('.iris-pagination__item--label')[0].click();
      expect(emitted[0].reason).toBe('previous');
    });

    it('should distinguish a numbered jump from a step', () => {
      fixture.componentRef.setInput('totalPages', 10);
      fixture.componentRef.setInput('currentPage', 5);
      fixture.detectChanges();

      const emitted: PaginationChangeEvent[] = [];
      component.pageChange.subscribe((event: PaginationChangeEvent) => emitted.push(event));

      const pageButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--page');
      pageButtons[0].click();
      fixture.nativeElement.querySelectorAll('.iris-pagination__item--nav')[1].click();

      expect(emitted.map((event) => event.reason)).toEqual(['jump', 'next']);
    });
  });

  describe('loading', () => {
    it('should set aria-busy on the nav', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('nav').getAttribute('aria-busy')).toBe('true');
    });

    it('should not set aria-busy when idle', () => {
      expect(fixture.nativeElement.querySelector('nav').getAttribute('aria-busy')).toBeNull();
    });

    it('should disable every control while a page is being fetched', () => {
      fixture.componentRef.setInput('totalPages', 10);
      fixture.componentRef.setInput('currentPage', 5);
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
      expect(buttons.length).toBeGreaterThan(0);
      expect(buttons.every((button) => button.disabled)).toBe(true);
    });

    it('should swallow a second click so a double click cannot fire two page changes', () => {
      fixture.componentRef.setInput('totalPages', 10);
      fixture.componentRef.setInput('currentPage', 5);
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const emitted: PaginationChangeEvent[] = [];
      component.pageChange.subscribe((event: PaginationChangeEvent) => emitted.push(event));

      component.goToNextPage();
      component.goToPreviousPage();
      component.goToPage(2);
      expect(emitted).toEqual([]);
    });
  });

  describe('position indicator', () => {
    it('should not render unless asked for', () => {
      fixture.componentRef.setInput('type', 'simplified');
      fixture.componentRef.setInput('totalPages', 10);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.iris-pagination__position')).toBeNull();
    });

    it('should include the total when the collection can be counted', () => {
      fixture.componentRef.setInput('type', 'simplified');
      fixture.componentRef.setInput('totalPages', 10);
      fixture.componentRef.setInput('currentPage', 3);
      fixture.componentRef.setInput('showPosition', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.iris-pagination__position').textContent.trim()).toBe('Page 3 of 10');
    });

    it('should omit the total for a cursor source', () => {
      fixture.componentRef.setInput('type', 'simplified');
      fixture.componentRef.setInput('currentPage', 3);
      fixture.componentRef.setInput('hasNext', true);
      fixture.componentRef.setInput('showPosition', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.iris-pagination__position').textContent.trim()).toBe('Page 3');
    });
  });

  describe('misuse warnings', () => {
    it('should warn when a cursor source asks for numbered pages', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      fixture.componentRef.setInput('type', 'default');
      fixture.componentRef.setInput('hasNext', true);
      fixture.detectChanges();
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('type="simplified"'));
      warnSpy.mockRestore();
    });

    it('should not silently switch type, leaving the incoherent layout visible', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      fixture.componentRef.setInput('type', 'default');
      fixture.componentRef.setInput('hasNext', true);
      fixture.detectChanges();

      // The warning is the only correction; the numbered layout stays as asked for.
      expect(fixture.nativeElement.querySelectorAll('.iris-pagination__item--page').length).toBe(1);
      expect(fixture.nativeElement.querySelectorAll('.iris-pagination__item--label').length).toBe(0);
      warnSpy.mockRestore();
    });

    it('should warn that totalPages is dead weight next to hasNext', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      fixture.componentRef.setInput('type', 'simplified');
      fixture.componentRef.setInput('totalPages', 10);
      fixture.componentRef.setInput('hasNext', true);
      fixture.detectChanges();
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('totalPages is ignored'));
      warnSpy.mockRestore();
    });

    it('should warn when simplified is left with neither a total nor a cursor flag', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      fixture.componentRef.setInput('type', 'simplified');
      fixture.detectChanges();
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Next is permanently disabled'));
      warnSpy.mockRestore();
    });

    it('should stay quiet for a correctly configured counted source', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      fixture.componentRef.setInput('totalPages', 10);
      fixture.componentRef.setInput('currentPage', 2);
      fixture.detectChanges();
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});
