import { Component, ElementRef, afterNextRender, inject, input, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * A docs page's content: its title and whatever the page projects. Scrolling to a section (a link
 * on the page, "On this page", or a URL's #fragment) follows the router's scroll events (App).
 */
@Component({
  selector: 'app-layout-page-docs-content',
  imports: [],
  templateUrl: './content.html',
  styleUrl: './content.scss'
})
export class LayoutPageDocsContent {
  pageTitle = input.required<string>()

  /**
   * The h1: the route's `data.searchTitle` ("Angular Bar Chart", see app.routes.ts) - the words
   * people search for, as in the page's <title> - else the page's short name ("Bar Chart"), which
   * stays the breadcrumb and the navigation's label.
   */
  protected readonly searchTitle = inject(ActivatedRoute).snapshot.data['searchTitle'] as string | undefined;

  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');

  constructor() {
    // Moving to another page moves focus to its heading, so keyboard and screen-reader users start
    // on the new page rather than wherever the link was - which, for a link in the phone drawer,
    // was nowhere: the drawer goes with the page it belonged to. Not on the first page (focus
    // stays with the browser), and not for a link to a #section, which gets the focus instead.
    const navigation = inject(Router).currentNavigation();
    const moved = !!navigation?.previousNavigation && !navigation.finalUrl?.fragment;
    afterNextRender(() => {
      if (moved) {
        this.heading().nativeElement.focus({ preventScroll: true });
      }
    });
  }
}
