import { DOCUMENT, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Where the choice is kept; index.html's pre-paint script reads the same key. */
const STORAGE_KEY = 'pc-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * The site's light / dark theme: a `pc-light` or `pc-dark` class on `<html>`, which sets its
 * `color-scheme` (styles.scss) - every Material color token is a `light-dark()` pair, so that flips
 * the whole theme, and the site's own colors follow it the same way.
 *
 * index.html sets the class before the first paint (a pre-rendered page included) from the saved
 * choice, or the system's setting when there is none; this service takes it from there. Until the
 * header's switch is used, the theme keeps following the system setting as it changes.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly root = inject(DOCUMENT).documentElement;
  readonly dark = signal(this.root.classList.contains('pc-dark'));

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return;
    }
    const query = this.root.ownerDocument.defaultView?.matchMedia?.(DARK_QUERY);
    query?.addEventListener('change', (event) => {
      if (!this.saved()) {
        this.apply(event.matches);
      }
    });
  }

  toggle(): void {
    const dark = !this.dark();
    this.apply(dark);
    try {
      localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
    } catch {
      // Storage blocked (a private window, say): the choice lasts until the page is reloaded.
    }
  }

  private apply(dark: boolean): void {
    this.root.classList.toggle('pc-dark', dark);
    this.root.classList.toggle('pc-light', !dark);
    // Kept in step with the inline `color-scheme` index.html sets, which outranks the class's.
    this.root.style.colorScheme = dark ? 'dark' : 'light';
    this.dark.set(dark);
  }

  private saved(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }
}
