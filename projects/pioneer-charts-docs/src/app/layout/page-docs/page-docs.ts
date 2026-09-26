import { Component, DOCUMENT, DestroyRef, ElementRef, inject, input, PLATFORM_ID, signal, viewChild } from '@angular/core';
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

  /**
   * Whether the "On this page" column shows. It takes 300px beside the content, so only on wide
   * screens: below 1280px (sidebar 280px + column 300px) it left the content too narrow to read.
   */
  protected readonly showJumpNav = signal(true);

  private readonly sidebar = viewChild<ElementRef<HTMLElement>>('sidebar');

  constructor() {
    const media = inject(MediaMatcher);
    // Below 960px the sidebar is a drawer, opened from the header's Menu row; above, a panel beside
    // the content. (It used to switch at 600px, which on a tablet left the content, between a
    // 360px sidebar and the 300px "On this page" column, as little as 40px wide.)
    const drawerQuery = media.matchMedia('(max-width: 959.98px)');
    const jumpNavQuery = media.matchMedia('(min-width: 1280px)');
    // The sidebar starts in step with the layout - closed as a drawer, open as a panel - and stays
    // so across breakpoint changes: resizing past the breakpoint while the drawer happens to be
    // open shouldn't leave it stuck closed once it's back to a permanent panel. The header's Menu
    // button and the drawer's own backdrop/ESC dismissal (openedChange) write to the same
    // `opened` signal.
    const sync = () => {
      this.nav.isMobile.set(drawerQuery.matches);
      this.nav.opened.set(!drawerQuery.matches);
      this.showJumpNav.set(jumpNavQuery.matches);
    };
    sync();
    this.nav.available.set(true);
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => this.nav.available.set(false));

    // Only in the browser: when the page is pre-rendered at build time there is no viewport, and
    // the CDK's stand-in media query has no event listeners. The pre-rendered page gets the
    // desktop layout; hydration switches a phone or tablet to its own.
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      for (const query of [drawerQuery, jumpNavQuery]) {
        query.addEventListener('change', sync);
        destroyRef.onDestroy(() => query.removeEventListener('change', sync));
      }
      this.keepSidebarAboveFooter(inject(DOCUMENT), destroyRef);
    }
  }

  /**
   * Ends the desktop sidebar where the footer begins while the footer is on screen, so the footer
   * shows full width and the sidebar's list stays whole, scrolling inside it. Set straight on the
   * element from the scroll handler - no signal, change detection or animation frame in between,
   * any of which would put the sidebar a frame or two behind the page as it scrolls. (The handler
   * runs before the browser draws the scrolled frame.)
   */
  private keepSidebarAboveFooter(document: Document, destroyRef: DestroyRef): void {
    const view = document.defaultView!;
    const update = () => {
      const sidebar = this.sidebar()?.nativeElement;
      const footer = document.querySelector('app-layout-footer');
      if (!sidebar || !footer) {
        return;
      }
      const overlap = Math.max(0, view.innerHeight - footer.getBoundingClientRect().top);
      sidebar.style.bottom = `${overlap}px`;
    };
    view.addEventListener('scroll', update, { passive: true });
    view.addEventListener('resize', update);
    // The page's height changes without a scroll too: content loading, a demo resizing.
    const observer = new ResizeObserver(update);
    observer.observe(document.body);
    destroyRef.onDestroy(() => {
      view.removeEventListener('scroll', update);
      view.removeEventListener('resize', update);
      observer.disconnect();
    });
  }
}
