import { afterNextRender, Component, ElementRef, inject, input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-layout-page-docs-content',
  imports: [],
  templateUrl: './content.html',
  styleUrl: './content.scss'
})
export class LayoutPageDocsContent {
  pageTitle = input.required<string>()

  // This component's own host is the page's actual scrolling element (see
  // content.scss's `overflow: scroll`) - everything scrollToSection() jumps
  // to lives inside it.
  private readonly elementRef = inject(ElementRef<HTMLElement>);

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
  }

  // Scrolls only this component's own host to bring a section heading into
  // view - deliberately not Element.scrollIntoView(), which walks every
  // scrollable ancestor needed to reveal its target, including the outer
  // document. That's exactly what page-docs.html's jump-nav wires this method
  // to instead of calling scrollIntoView() directly: clicking a jump-nav link
  // should only move this content pane, not the whole page.
  scrollToSection(id: string): void {
    const target = document.getElementById(id);
    if (!target) {
      return;
    }
    const container = this.elementRef.nativeElement;
    const offset = target.getBoundingClientRect().top - container.getBoundingClientRect().top;
    container.scrollBy({ top: offset, behavior: 'smooth' });
  }
}
