import { Component, inject, input, signal } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MediaMatcher } from '@angular/cdk/layout';
import { LayoutPageDocsContent } from './content/content';
import { LayoutPageDocsNavigation } from './navigation/navigation';
import { c } from "../../../../../../node_modules/@angular/cdk/a11y-module.d--J1yhM7R";

@Component({
  selector: 'app-layout-page-docs',
  imports: [
    MatSidenavModule,
    LayoutPageDocsContent,
    LayoutPageDocsNavigation
],
  templateUrl: './page-docs.html',
  styleUrls: ['./page-docs.scss']
})
export class LayoutPageDocs {
  pageTitle = input.required<string>()

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
