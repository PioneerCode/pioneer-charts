import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface IJumpNav {
  key: string;
  value: string;
}

@Component({
  selector: 'app-layout-jump-nav',
  imports: [
    RouterLink
  ],
  templateUrl: './jump-nav.html',
  styleUrl: './jump-nav.scss'
})
export class LayoutJumpNav {
  readonly jumpNav = input<IJumpNav[]>([]);

  // The page's actual scrolling element is a nested `overflow: scroll` div
  // (LayoutPageDocsContent's host), not the window - Angular's router-driven
  // ViewportScroller only knows how to scroll the window/document, so it can't
  // do this. scrollIntoView() walks every scrollable ancestor instead, so it
  // works regardless of which element in the chain is the one that scrolls.
  // `routerLink`/`fragment` on the anchor stay in place alongside this so the
  // URL hash still updates (shareable link, back/forward through jumps);
  // preventDefault() here only stops the router from re-navigating on top of
  // the scroll we're already doing ourselves.
  onJump(event: Event, id: string) {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
