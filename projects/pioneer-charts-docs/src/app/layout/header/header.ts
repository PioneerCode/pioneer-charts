import { Component, DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
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
    // The header is fixed over the page, so the page starts - and the docs drawer opens - below
    // it. Its height isn't one number (56px on a phone, 64px otherwise, plus the Menu row on docs
    // pages), so it's measured and shared rather than assumed. Browser only: there's no layout
    // when a page is pre-rendered, where the default (64px) stands.
    const host = inject(ElementRef<HTMLElement>).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observer = new ResizeObserver(() => this.nav.headerHeight.set(Math.round(host.getBoundingClientRect().height)));
      observer.observe(host);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
