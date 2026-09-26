import { Component, DOCUMENT, DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { DocsNavService } from '../docs-nav.service';

@Component({
  selector: 'app-layout-header',
  imports: [
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class LayoutHeader {
  protected readonly nav = inject(DocsNavService);

  constructor() {
    // The router scrolls to a URL's #section (anchorScrolling, app.config.ts); this keeps the
    // section just below this fixed header rather than behind it.
    inject(ViewportScroller).setOffset(() => [0, this.nav.headerHeight() + 16]);

    // The header is fixed over the page, so the page starts - and the docs drawer opens - below
    // it. Its height isn't one number (56px on a phone, 64px otherwise, plus the Menu row on docs
    // pages), so it's measured and shared rather than assumed. Browser only: there's no layout
    // when a page is pre-rendered, where the default (64px) stands.
    const host = inject(ElementRef<HTMLElement>).nativeElement;
    const destroyRef = inject(DestroyRef);
    const root = inject(DOCUMENT).documentElement;
    afterNextRender(() => {
      // Also as a CSS custom property, for styles positioned below the header (the docs'
      // sticky "On this page" column).
      const observer = new ResizeObserver(() => {
        const height = Math.round(host.getBoundingClientRect().height);
        this.nav.headerHeight.set(height);
        root.style.setProperty('--app-header-height', `${height}px`);
      });
      observer.observe(host);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
