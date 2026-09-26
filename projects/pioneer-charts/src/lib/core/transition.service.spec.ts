import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { PcacTransitionService } from './transition.service';

describe('PcacTransitionService', () => {
  afterEach(() => vi.unstubAllGlobals());

  function reduceMotion(reduce: boolean): void {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: reduce && query === '(prefers-reduced-motion: reduce)' }));
  }

  it('animates by default', () => {
    reduceMotion(false);

    expect(TestBed.inject(PcacTransitionService).getTransitionDuration()).toBe(750);
  });

  it("doesn't animate when the user has asked to reduce motion", () => {
    reduceMotion(true);

    expect(TestBed.inject(PcacTransitionService).getTransitionDuration()).toBe(0);
  });

  it('follows the setting when it changes, from the next draw on', () => {
    const service = TestBed.inject(PcacTransitionService);
    reduceMotion(true);
    expect(service.getTransitionDuration()).toBe(0);

    reduceMotion(false);
    expect(service.getTransitionDuration()).toBe(750);
  });
});
