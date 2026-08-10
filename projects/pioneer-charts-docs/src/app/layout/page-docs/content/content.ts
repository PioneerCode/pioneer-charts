import { afterNextRender, Component, inject, input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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
    // not just clicks through the "ON THIS PAGE" jump-nav (see LayoutJumpNav.onJump
    // for why scrollIntoView rather than router-driven scrolling). This component
    // is re-created fresh on every route navigation (it's nested inside each
    // lazy-loaded doc page component), so a one-time check of the route snapshot
    // after the projected content has actually painted is enough - no need to
    // subscribe to the fragment observable for same-instance changes.
    const route = inject(ActivatedRoute);
    afterNextRender(() => {
      const fragment = route.snapshot.fragment;
      if (fragment) {
        document.getElementById(fragment)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
}
