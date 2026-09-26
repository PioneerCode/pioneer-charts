import { Component, DOCUMENT, DestroyRef, ElementRef, afterRenderEffect, inject, input, PLATFORM_ID, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MediaMatcher } from '@angular/cdk/layout';
import { LayoutPageDocsContent } from './content/content';
import { LayoutPageDocsNavigation } from './navigation/navigation';
import { IJumpNav, LayoutJumpNav } from './jump-nav/jump-nav';
import { DocsNavService } from '../docs-nav.service';

@Component({
  selector: 'app-layout-page-docs',
  imports: [
    MatSidenavModule,
    LayoutPageDocsContent,
    LayoutPageDocsNavigation,
    LayoutJumpNav
],
  templateUrl: './page-docs.html',
  styleUrl: './page-docs.scss'
})
export class LayoutPageDocs {
  pageTitle = input.required<string>()
  jumpNav = input<IJumpNav[]>([]);

  protected readonly nav = inject(DocsNavService);

  private readonly sidebar = viewChild<ElementRef<HTMLElement>>('sidebar');
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement;

  constructor() {
    // Below 960px the sidebar is a drawer, opened from the header's Menu row; above, a panel beside
    // the content. (It used to switch at 600px, which on a tablet left the content, between a
    // 360px sidebar and the 300px "On this page" column, as little as 40px wide.) The "On this
    // page" column needs no signal of its own: it's always rendered and shown by CSS from 1280px
    // (jump-nav.scss), so the pre-rendered page - built with no screen to measure - lays out the
    // same as the app does once it starts.
    const drawerQuery = inject(MediaMatcher).matchMedia('(max-width: 959.98px)');
    // The drawer starts closed and the panel open, and stays so across the breakpoint: resizing
    // past it while the drawer happens to be open shouldn't leave the panel closed once it's back.
    // The header's Menu button and the drawer's own backdrop/ESC dismissal (openedChange) write to
    // the same `opened` signal.
    const sync = () => {
      this.nav.isMobile.set(drawerQuery.matches);
      this.nav.opened.set(!drawerQuery.matches);
    };
    sync();
    this.nav.available.set(true);
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => this.nav.available.set(false));

    // Only in the browser: when the page is pre-rendered at build time there is no viewport, and
    // the CDK's stand-in media query has no event listeners. The pre-rendered page gets the
    // desktop layout; hydration switches a phone or tablet to its own.
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      drawerQuery.addEventListener('change', sync);
      destroyRef.onDestroy(() => drawerQuery.removeEventListener('change', sync));
      this.keepSidebarAboveFooter(inject(DOCUMENT), destroyRef);
    }
  }

  /**
   * Ends the desktop sidebar where the footer begins while the footer is on screen, so the footer
   * shows full width and the sidebar's list stays whole, scrolling inside it. Set straight on the
   * element from the scroll handler - no signal, change detection or animation frame in between,
   * any of which would put the sidebar a frame or two behind the page as it scrolls. (The handler
   * runs before the browser draws the scrolled frame; the footer is stacked above the sidebar for
   * the rare frame it can't - footer.scss.)
   */
  private keepSidebarAboveFooter(document: Document, destroyRef: DestroyRef): void {
    const view = document.defaultView!;
    let footer: Element | null = null;
    const update = () => {
      const sidebar = this.sidebar()?.nativeElement;
      if (!sidebar) {
        return; // Below 960px there's no sidebar, only the drawer.
      }
      footer ??= document.querySelector('app-layout-footer');
      if (!footer) {
        return;
      }
      const overlap = Math.max(0, view.innerHeight - footer.getBoundingClientRect().top);
      sidebar.style.bottom = `${overlap}px`;
    };
    view.addEventListener('scroll', update, { passive: true });
    view.addEventListener('resize', update);
    // The footer also moves when this page's own height changes without a scroll - demo charts
    // loading, a table growing - so this layout's size is watched too. (Not `body`'s: the theme
    // sizes it to the viewport, so it never changes as the page grows.)
    const observer = new ResizeObserver(update);
    observer.observe(this.host);
    // And as soon as the sidebar appears - crossing up past 960px creates it after the resize
    // event has already run.
    afterRenderEffect(() => {
      if (this.sidebar()) {
        update();
      }
    });
    destroyRef.onDestroy(() => {
      view.removeEventListener('scroll', update);
      view.removeEventListener('resize', update);
      observer.disconnect();
    });
  }
}
