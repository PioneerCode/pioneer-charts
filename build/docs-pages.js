/**
 * Shapes the pre-rendered docs build (`outputMode: "static"`, see app.routes.server.ts) for GitHub
 * Pages. Runs as part of build:docs, so every deploy (publish.yml, deploy-angular.yml) gets it.
 *
 * 1. Flattens each page from `<route>/index.html` to `<route>.html`. Pages serves both at
 *    `/<route>`, but a folder's index answers with a 301 to `/<route>/` first - a URL that isn't
 *    the page's canonical one (seo.ts) or the one in the sitemap. The exception is a redirect
 *    (`redirectTo` route, which the builder writes as a meta-refresh page) for a folder that holds
 *    pages, like /docs: there `<route>.html` would never be served, so it stays the folder's
 *    index, which Pages reaches by way of that 301.
 * 2. Writes 404.html - what Pages serves, with a 404 status, for any URL that isn't a file - from
 *    the client-only shell (index.csr.html), which renders whatever the router makes of the URL:
 *    the home page, marked noindex (see seo.ts). A URL ending in a slash
 *    (/docs/guides/theme/) is first sent on to the same URL without it, which is the page. The
 *    shell itself isn't deployed: it would be a second copy of the home page at /index.csr.html.
 * 3. Writes sitemap.xml from the routes the builder actually pre-rendered - less the redirects,
 *    since a sitemap lists pages - each with a <lastmod>: the date of the last commit to the
 *    page's own folder in the docs app (the one its route loads its component from), so a change
 *    to the shared layout doesn't mark every page changed. That needs the git history, so a
 *    shallow clone fails the build (CI checks out with fetch-depth: 0).
 *
 * Safe to run again on output it has already shaped (each step skips what's done).
 */
import { execFileSync } from 'child_process';
import { existsSync, readdirSync, readFileSync, renameSync, rmdirSync, rmSync, writeFileSync } from 'fs';
import { dirname } from 'path';

const SITE_URL = 'https://pioneercharts.com';
const out = './dist/pioneer-charts-docs';
const browser = `${out}/browser`;
const app = './projects/pioneer-charts-docs/src/app';

const routes = Object.keys(JSON.parse(readFileSync(`${out}/prerendered-routes.json`, 'utf-8')).routes);
if (!routes.length) {
  throw new Error('build/docs-pages.js: no pre-rendered routes found - did the docs build pre-render?');
}

const isRedirect = (file) => readFileSync(file, 'utf-8').includes('http-equiv="refresh"');

for (const route of routes.filter((route) => route !== '/')) {
  const folder = `${browser}${route}`;
  if (existsSync(`${folder}/index.html`)) {
    if (isRedirect(`${folder}/index.html`) && readdirSync(folder).length > 1) {
      continue; // A redirect for a folder of pages: it stays the folder's index (see above).
    }
    renameSync(`${folder}/index.html`, `${folder}.html`);
  }
  // The folder held only the page; remove it and any parents it leaves empty.
  for (let dir = folder; dir !== browser && existsSync(dir) && readdirSync(dir).length === 0; dir = dirname(dir)) {
    rmdirSync(dir);
  }
  // A folder still standing means another page lives under this one (/docs/guides beside
  // /docs/guides/theme): Pages would answer /docs/guides with a redirect into that folder rather
  // than serve docs/guides.html. Better to fail the build than ship that.
  if (existsSync(folder)) {
    throw new Error(`build/docs-pages.js: ${route} has pages under it, which GitHub Pages can't serve beside ${route}.html`);
  }
}

if (existsSync(`${browser}/index.csr.html`)) {
  // Marked noindex in its own HTML, not only once the app has started (seo.ts): it carries the home
  // page's title and canonical, and `/404.html` itself answers with a 200.
  const shell = readFileSync(`${browser}/index.csr.html`, 'utf-8');
  // The redirect runs before anything else on the page; one without the slash that isn't a page
  // either comes back here and stays.
  const head = '<head>\n  <meta name="robots" content="noindex">\n'
    + '  <script>if (/.\\/$/.test(location.pathname)) location.replace(location.pathname.replace(/\\/+$/, \'\') + location.search + location.hash);</script>';
  writeFileSync(`${browser}/404.html`, shell.replace('<head>', head));
  rmSync(`${browser}/index.csr.html`);
}

const pageFile = (route) => (route === '/' ? `${browser}/index.html` : `${browser}${route}.html`);
const pages = routes.filter((route) => existsSync(pageFile(route)) && !isRedirect(pageFile(route)));
const lastModified = pageDates();
const urls = pages.map((route) => `  <url><loc>${SITE_URL}${route}</loc><lastmod>${lastModified(route)}</lastmod></url>`).join('\n');
writeFileSync(
  `${browser}/sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);

console.log(`Pioneer Charts: docs pages flattened, 404.html and sitemap.xml written (${pages.length} pages, ${routes.length - pages.length} redirects)`);

/**
 * A function giving each page's last-changed date (YYYY-MM-DD): that of the last commit to the
 * folder its route in app.routes.ts loads its component from.
 */
function pageDates() {
  const git = (...args) => execFileSync('git', args, { encoding: 'utf-8' }).trim();
  if (git('rev-parse', '--is-shallow-repository') === 'true') {
    throw new Error('build/docs-pages.js: the sitemap\'s dates need the git history - check out with fetch-depth: 0');
  }
  // `{ path: '<route>', ... loadComponent: () => import('<file>')` - no braces between the two, so
  // a redirect (which has no import) can't borrow the next route's.
  const source = readFileSync(`${app}/app.routes.ts`, 'utf-8');
  const folders = new Map();
  for (const [, path, file] of source.matchAll(/path: '([^']*)'[^{}]*?import\('([^']+)'\)/g)) {
    if (!folders.has(`/${path}`)) {
      folders.set(`/${path}`, `${app}/${dirname(file)}`);
    }
  }
  return (route) => {
    const folder = folders.get(route);
    if (!folder) {
      throw new Error(`build/docs-pages.js: no component folder found for ${route} in app.routes.ts`);
    }
    // A page not committed yet has no date in git: it's changing today.
    return git('log', '-1', '--format=%cs', '--', folder) || new Date().toISOString().slice(0, 10);
  };
}
