import { ApplicationRef, Component, PLATFORM_ID, inject, signal } from '@angular/core';
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
  protected readonly title = signal('Pioneer Charts');

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
   *   offset LayoutHeader gives the ViewportScroller), and focuses it.
   * A later navigation cancels a restore still waiting on the previous one.
   */
  private followRouterScrolling(): void {
    const scroller = inject(ViewportScroller);
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
      }
    });
  }
}
