import { Component, inject, input, signal } from '@angular/core';
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
  styleUrls: ['./page-docs.scss']
})
export class LayoutPageDocs {
  pageTitle = input.required<string>()
  jumpNav = input<IJumpNav[]>([]);

  protected readonly isMobile = signal(true);
  private readonly _mobileQuery: MediaQueryList;
  private readonly _mobileQueryListener: () => void;

  constructor() {
    const media = inject(MediaMatcher);
    this._mobileQuery = media.matchMedia('(max-width: 600px)');
    this.isMobile.set(this._mobileQuery.matches);
    this._mobileQueryListener = () => this.isMobile.set(this._mobileQuery.matches);
    this._mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this._mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }
}
