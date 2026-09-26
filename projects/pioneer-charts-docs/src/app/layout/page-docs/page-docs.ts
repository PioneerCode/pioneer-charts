import { Component, DestroyRef, inject, input, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MediaMatcher } from '@angular/cdk/layout';
import { LayoutPageDocsContent } from './content/content';
import { LayoutPageDocsNavigation } from './navigation/navigation';
import { IJumpNav, LayoutJumpNav } from './jump-nav/jump-nav';

@Component({
  selector: 'app-layout-page-docs',
  imports: [
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
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

  protected readonly isMobile = signal(true);
  // Drives <mat-sidenav>'s [opened]. Starts in sync with isMobile (closed on
  // mobile, open on desktop) and stays in sync across breakpoint changes -
  // e.g. resizing past 600px while the mobile drawer happens to be open
  // shouldn't leave it stuck closed once it's back to a permanent side panel.
  // The toggle button and the sidenav's own backdrop/ESC dismissal (via
  // (openedChange)) both just write to this same signal.
  protected readonly sidenavOpened = signal(true);

  constructor() {
    const mobileQuery = inject(MediaMatcher).matchMedia('(max-width: 600px)');
    this.isMobile.set(mobileQuery.matches);
    this.sidenavOpened.set(!mobileQuery.matches);

    const listener = () => {
      this.isMobile.set(mobileQuery.matches);
      this.sidenavOpened.set(!mobileQuery.matches);
    };
    // Only in the browser: when the page is pre-rendered at build time there is no viewport, and
    // the CDK's stand-in media query has no event listeners. The pre-rendered page gets the
    // desktop layout; hydration switches a phone to the mobile one.
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      mobileQuery.addEventListener('change', listener);
      inject(DestroyRef).onDestroy(() => mobileQuery.removeEventListener('change', listener));
    }
  }
}
