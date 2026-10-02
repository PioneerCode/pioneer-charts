import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';

/** The docs site's own address, which every canonical and Open Graph URL is built on. */
export const SITE_URL = 'https://pioneercharts.com';

const SITE_NAME = 'Pioneer Charts';
const REPOSITORY_URL = 'https://github.com/PioneerCode/pioneer-charts';
/** The docs' own start page: the "Documentation" step in a docs page's breadcrumbs. */
const DOCS_PATH = '/docs/guides/introduction';
const DEFAULT_TITLE = 'Pioneer Charts - Angular charts built on D3';
/** The home page's description (and index.html's), for any route without its own. */
/** The site's link-preview image (index.html's), for the home page and any URL that isn't a page. */
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
const IMAGE_ALT = 'Angular charts built on D3, with an area, a bar and a donut chart.';
const DEFAULT_DESCRIPTION = 'Pioneer Charts is an Angular library of bar, line, area, plot, pie, donut, dot plot and proximity charts built on D3'
  + ' - responsive, themeable and simple to configure.';

/**
 * Keeps each page's search and link-preview metadata in step with the route, from the route's
 * `title`, `data.searchTitle` and `data.description` (see app.routes.ts): the document title,
 * `<meta name=description>`, the Open Graph tags (each page's own preview image included: see
 * `ogImage`), `<link rel=canonical>`, and structured data (see
 * `structuredData`). A route marked `data.notFound` (the catch-all) gets `noindex`, since it shows
 * the home page at a URL that isn't one, and no structured data.
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
    const searchTitle: string | undefined = route.data['searchTitle'] ?? pageTitle;
    const title = searchTitle ? `${searchTitle} · ${SITE_NAME}` : DEFAULT_TITLE;
    const description: string = route.data['description'] ?? DEFAULT_DESCRIPTION;
    const notFound = route.data['notFound'] === true;
    // The path alone - no query or fragment - and the home page's for a URL that isn't a page.
    const url = SITE_URL + (notFound ? '/' : snapshot.url.split(/[?#]/)[0]);

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    const image = ogImage(url, searchTitle);
    this.meta.updateTag({ property: 'og:image', content: image.url });
    this.meta.updateTag({ property: 'og:image:alt', content: image.alt });
    if (notFound) {
      this.meta.updateTag({ name: 'robots', content: 'noindex' });
    } else {
      this.meta.removeTag('name="robots"');
    }
    this.canonicalLink().setAttribute('href', url);
    this.setStructuredData(notFound ? null : structuredData(url, pageTitle ?? null, description));
  }

  /**
   * The page's JSON-LD, in one `<script type="application/ld+json">` in the head, replaced on each
   * navigation; `null` removes it. Written during pre-rendering like the rest, so it's in each
   * page's HTML for crawlers that don't run JavaScript.
   */
  private setStructuredData(data: object | null): void {
    let script = this.document.head.querySelector<HTMLScriptElement>('script#pc-structured-data');
    if (!data) {
      script?.remove();
      return;
    }
    if (!script) {
      script = this.document.createElement('script');
      script.id = 'pc-structured-data';
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }
    // `<` escaped so no string in it can close the script element early.
    script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
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

/**
 * Structured data for a page (schema.org, as JSON-LD). The home page describes the site and the
 * library itself - a `WebSite` and a `SoftwareSourceCode` - so search engines know what the project
 * is. Every other page gets a `BreadcrumbList` (Pioneer Charts > Documentation > Bar Chart), which
 * search results can show in place of the page's bare URL.
 */
export function structuredData(url: string, pageTitle: string | null, description: string): object {
  if (url === `${SITE_URL}/`) {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebSite', name: SITE_NAME, url },
        {
          '@type': 'SoftwareSourceCode',
          name: SITE_NAME,
          description,
          url,
          codeRepository: REPOSITORY_URL,
          programmingLanguage: 'TypeScript',
          runtimePlatform: 'Angular',
          license: 'https://opensource.org/licenses/MIT',
        },
      ],
    };
  }
  const trail = [{ name: SITE_NAME, url: `${SITE_URL}/` }];
  if (url.startsWith(`${SITE_URL}/docs/`) && url !== `${SITE_URL}${DOCS_PATH}`) {
    trail.push({ name: 'Documentation', url: `${SITE_URL}${DOCS_PATH}` });
  }
  trail.push({ name: pageTitle ?? SITE_NAME, url });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((step, i) => ({ '@type': 'ListItem', position: i + 1, name: step.name, item: step.url })),
  };
}

/**
 * A page's link-preview image: its own, with its title on it, rendered by build/og-images.js into
 * public/og/ and named after the last segment of its path (`ogImageSlug` there must agree). The home
 * page - and a URL that isn't a page, which canonicalizes to it - has the site's.
 */
export function ogImage(url: string, searchTitle: string | undefined): { url: string; alt: string } {
  const path = url.slice(SITE_URL.length);
  if (path === '/' || !searchTitle) {
    return { url: DEFAULT_IMAGE, alt: `${SITE_NAME}: ${IMAGE_ALT}` };
  }
  return { url: `${SITE_URL}/og/${path.split('/').pop()}.png`, alt: `${searchTitle} - ${SITE_NAME}: ${IMAGE_ALT}` };
}

function deepestChild(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  return route.firstChild ? deepestChild(route.firstChild) : route;
}
