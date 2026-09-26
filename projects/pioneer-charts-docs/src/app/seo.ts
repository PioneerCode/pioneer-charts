import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';

/** The docs site's own address, which every canonical and Open Graph URL is built on. */
export const SITE_URL = 'https://pioneercharts.com';

const SITE_NAME = 'Pioneer Charts';
const DEFAULT_TITLE = 'Pioneer Charts - Angular charts built on D3';
/** The home page's description (and index.html's), for any route without its own. */
const DEFAULT_DESCRIPTION = 'Pioneer Charts is an Angular library of bar, line, area, plot and pie charts built on D3'
  + ' - responsive, themeable and simple to configure.';

/**
 * Keeps each page's search and link-preview metadata in step with the route, from the route's
 * `title` and `data.description` (see app.routes.ts): the document title, `<meta name=description>`,
 * the Open Graph tags, and `<link rel=canonical>`. A route marked `data.notFound` (the catch-all)
 * gets `noindex`, since it shows the home page at a URL that isn't one.
 *
 * A `TitleStrategy` rather than a router-events subscription because the router already calls it
 * once per completed navigation, with the final route snapshot.
 */
@Injectable({ providedIn: 'root' })
export class PageSeoStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const route = deepestChild(snapshot.root);
    const pageTitle = this.buildTitle(snapshot);
    const title = pageTitle ? `${pageTitle} · ${SITE_NAME}` : DEFAULT_TITLE;
    const description: string = route.data['description'] ?? DEFAULT_DESCRIPTION;
    const notFound = route.data['notFound'] === true;
    // The path alone - no query or fragment - and the home page's for a URL that isn't a page.
    const url = SITE_URL + (notFound ? '/' : snapshot.url.split(/[?#]/)[0]);

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    if (notFound) {
      this.meta.updateTag({ name: 'robots', content: 'noindex' });
    } else {
      this.meta.removeTag('name="robots"');
    }
    this.canonicalLink().setAttribute('href', url);
  }

  private canonicalLink(): HTMLLinkElement {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    return link;
  }
}

function deepestChild(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  return route.firstChild ? deepestChild(route.firstChild) : route;
}
