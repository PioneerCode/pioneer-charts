import { ApplicationRef, Component, DOCUMENT, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, ViewportScroller } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet, Scroll } from '@angular/router';
import { filter } from 'rxjs';
import { LayoutHeader } from './layout/header/header';
import { LayoutFooter } from './layout/footer/footer';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    LayoutHeader,
    LayoutFooter
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      this.followRouterScrolling();
    }
  }

  /**
   * Scrolls the page for each navigation, from the router's scroll events (withInMemoryScrolling
   * in app.config.ts, with the router's own scroller switched off):
   * - a new page starts at the top, straight away;
   * - back/forward returns to where that page was left, once the app is stable - its data loaded
   *   and laid out. The router restores as soon as the page renders, when a docs page is still
   *   short of the charts its mock data will add, so it stopped well short (3953px of 5000px);
   * - a link to a #section scrolls there, likewise once stable, just below the fixed header (the
   *   offset LayoutHeader gives the ViewportScroller), and moves keyboard focus to it (see
   *   `focusSection`).
   * A later navigation cancels a restore still waiting on the previous one.
   */
  private followRouterScrolling(): void {
    const scroller = inject(ViewportScroller);
    const document = inject(DOCUMENT);
    const appRef = inject(ApplicationRef);
    scroller.setHistoryScrollRestoration('manual');
    let latest = 0;
    inject(Router).events.pipe(
      filter((event): event is Scroll => event instanceof Scroll),
      takeUntilDestroyed(),
    ).subscribe(async (event) => {
      const id = ++latest;
      if (!event.position && !event.anchor) {
        scroller.scrollToPosition([0, 0], { behavior: 'instant' });
        return;
      }
      await appRef.whenStable();
      if (id !== latest) {
        return;
      }
      if (event.position) {
        scroller.scrollToPosition(event.position, { behavior: 'instant' });
      } else if (event.anchor) {
        scroller.scrollToAnchor(event.anchor);
        focusSection(document, event.anchor);
      }
    });
  }
}

/**
 * Moves keyboard focus to the section a #fragment link went to, so Tab carries on from there
 * rather than from the link. The scroller tries to focus it too, but a section's heading or
 * paragraph isn't focusable, so that did nothing - focus stayed on the "On this page" link, or,
 * arriving from another page, fell to the page itself (the page's own heading doesn't take it when
 * there's a section to go to; see LayoutPageDocsContent). `tabindex="-1"` makes it focusable by
 * script without putting it in the Tab order.
 */
function focusSection(document: Document, id: string): void {
  const section = document.getElementById(id);
  if (!section) {
    return;
  }
  if (!section.hasAttribute('tabindex')) {
    section.setAttribute('tabindex', '-1');
  }
  section.focus({ preventScroll: true });
}
