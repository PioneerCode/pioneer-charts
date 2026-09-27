import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let systemChange: ((event: { matches: boolean }) => void) | undefined;
  let root: HTMLElement;

  beforeEach(() => {
    systemChange = undefined;
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: (_type: string, listener: (event: { matches: boolean }) => void) => (systemChange = listener),
    }));
    root = TestBed.inject(DOCUMENT).documentElement;
    root.className = 'pc-light';
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    root.removeAttribute('style');
  });

  it('switches the class, color-scheme and header icon, and saves the choice', () => {
    const theme = TestBed.inject(ThemeService);

    theme.toggle();

    expect(theme.dark()).toBe(true);
    expect(root.classList.contains('pc-dark')).toBe(true);
    expect(root.style.colorScheme).toBe('dark');
    expect(root.style.getPropertyValue('--pc-theme-icon-sun')).toBe('inline-block');
    expect(localStorage.getItem('pc-theme')).toBe('dark');
  });

  it('follows the system setting until the switch is used', () => {
    const theme = TestBed.inject(ThemeService);

    systemChange?.({ matches: true });
    expect(theme.dark()).toBe(true);

    theme.toggle();
    systemChange?.({ matches: true });
    expect(theme.dark()).toBe(false);
  });

  // Regression test: with storage blocked the choice couldn't be saved, so the next system change
  // overrode the switch the user had just used.
  it('keeps the choice over the system setting even when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const theme = TestBed.inject(ThemeService);

    theme.toggle();
    systemChange?.({ matches: false });

    expect(theme.dark()).toBe(true);
  });
});
