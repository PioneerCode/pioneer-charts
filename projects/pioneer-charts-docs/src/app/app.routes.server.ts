import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Every page is pre-rendered to its own HTML file at build time, so GitHub Pages serves each one
 * as a real file - with a 200 and the page's own title, description and canonical URL (see
 * seo.ts) already in it, for search engines and link previews that don't run JavaScript. The
 * pages are static and have no parameters, so the builder finds them all in app.routes.ts.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '**', renderMode: RenderMode.Prerender },
];
