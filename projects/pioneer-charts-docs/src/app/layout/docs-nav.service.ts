import { Injectable, signal } from '@angular/core';

/**
 * What the header and the docs layout share about the docs sidebar. On a phone the sidebar is a
 * drawer, and the button that opens it lives in the header (a "Menu" row under the toolbar) -
 * but the drawer belongs to the docs layout, which only exists on docs pages. So the layout
 * publishes here that it's on screen and whether it's in its phone layout, the header shows the
 * button from that, and both read and write `opened`.
 *
 * Also carries the header's measured height, which varies (Material's toolbar is 56px on a phone
 * and 64px otherwise, plus the Menu row on docs pages): the page content starts below it and the
 * drawer opens below it.
 */
@Injectable({ providedIn: 'root' })
export class DocsNavService {
  /** Whether a docs page - and so the sidebar - is on screen. */
  readonly available = signal(false);

  /** Whether the docs layout is in its phone layout, where the sidebar is a drawer. */
  readonly isMobile = signal(false);

  /** Whether the drawer (the sidebar below 960px) is open. The desktop sidebar is always shown. */
  readonly opened = signal(false);

  /** The header's height in px, as last measured (64 until then - the desktop toolbar). */
  readonly headerHeight = signal(64);

  toggle(): void {
    this.opened.update((opened) => !opened);
  }
}
