import { afterNextRender, Component, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { skip } from 'rxjs';

@Component({
  selector: 'app-layout-page-docs-content',
  imports: [],
  templateUrl: './content.html',
  styleUrl: './content.scss'
})
export class LayoutPageDocsContent {
  pageTitle = input.required<string>()

  constructor() {
    // Deep-link support: a URL opened directly with a fragment (e.g. pasting
    // .../introduction#step-2-import-modules) should land on that section too,
    // not just clicks through the "ON THIS PAGE" jump-nav. This component is
    // re-created fresh on every route navigation (it's nested inside each
    // lazy-loaded doc page component), so a one-time check of the route
    // snapshot after the projected content has actually painted is enough -
    // no need to subscribe to the fragment observable for same-instance
    // changes.
    const route = inject(ActivatedRoute);
    afterNextRender(() => {
      const fragment = route.snapshot.fragment;
      if (fragment) {
        this.scrollToSection(fragment);
      }
    });

    // In-page links (`<a routerLink="." fragment="...">`) change the fragment without re-creating
    // this component, so those are followed too. (A plain `href="#id"` can't work here: it
    // resolves against `<base href="/">` to the home page.)
    // The first emission is the current fragment, handled above once the page has painted.
    route.fragment.pipe(skip(1), takeUntilDestroyed()).subscribe((fragment) => {
      if (fragment) {
        this.scrollToSection(fragment);
      }
    });
  }

  // Scrolls the page to a section. It lands just below the fixed header through the sections'
  // `scroll-margin-top` (styles.scss), which the browser's own jump to a URL's #fragment respects
  // too. (The docs pages used to scroll inside this component, a pane with its own scrollbar.)
  scrollToSection(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
