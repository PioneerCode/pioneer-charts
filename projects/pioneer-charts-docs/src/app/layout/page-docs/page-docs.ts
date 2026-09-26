import { Component, DestroyRef, inject, input, PLATFORM_ID } from '@angular/core';
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

  constructor() {
    const mobileQuery = inject(MediaMatcher).matchMedia('(max-width: 600px)');
    // The sidebar starts in step with the layout - closed on a phone, open on a desktop - and
    // stays so across breakpoint changes: resizing past 600px while the phone drawer happens to be
    // open shouldn't leave it stuck closed once it's back to a permanent side panel. The header's
    // Menu button and the drawer's own backdrop/ESC dismissal (openedChange) write to the same
    // `opened` signal.
    const sync = () => {
      this.nav.isMobile.set(mobileQuery.matches);
      this.nav.opened.set(!mobileQuery.matches);
    };
    sync();
    this.nav.available.set(true);
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => this.nav.available.set(false));

    // Only in the browser: when the page is pre-rendered at build time there is no viewport, and
    // the CDK's stand-in media query has no event listeners. The pre-rendered page gets the
    // desktop layout; hydration switches a phone to the mobile one.
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      mobileQuery.addEventListener('change', sync);
      destroyRef.onDestroy(() => mobileQuery.removeEventListener('change', sync));
    }
  }
}
