import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MediaMatcher } from '@angular/cdk/layout';
import { LayoutPageDocsContent } from './content/content';
import { LayoutPageDocsNavigation } from './navigation/navigation';
import { IJumpNav, LayoutJumpNav } from './jump-nav/jump-nav';

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

  protected readonly isMobile = signal(true);

  constructor() {
    const mobileQuery = inject(MediaMatcher).matchMedia('(max-width: 600px)');
    this.isMobile.set(mobileQuery.matches);

    const listener = () => this.isMobile.set(mobileQuery.matches);
    mobileQuery.addEventListener('change', listener);
    inject(DestroyRef).onDestroy(() => mobileQuery.removeEventListener('change', listener));
  }
}
