/**
 * Shapes the pre-rendered docs build (`outputMode: "static"`, see app.routes.server.ts) for GitHub
 * Pages. Runs as part of build:docs, so every deploy (publish.yml, deploy-angular.yml) gets it.
 *
 * 1. Flattens each page from `<route>/index.html` to `<route>.html`. Pages serves both at
 *    `/<route>`, but a folder's index answers with a 301 to `/<route>/` first - a URL that isn't
 *    the page's canonical one (seo.ts) or the one in the sitemap.
 * 2. Writes 404.html - what Pages serves, with a 404 status, for any URL that isn't a file - from
 *    the client-only shell (index.csr.html), which renders whatever the router makes of the URL:
 *    the home page, marked noindex (see seo.ts). The shell itself isn't deployed: it would be a
 *    second copy of the home page at /index.csr.html.
 * 3. Writes sitemap.xml from the routes the builder actually pre-rendered - less the redirects
 *    (`redirectTo` routes, which it writes as a meta-refresh page), since a sitemap lists pages.
 *
 * Safe to run again on output it has already shaped (each step skips what's done).
 */
import { existsSync, readdirSync, readFileSync, renameSync, rmdirSync, rmSync, writeFileSync } from 'fs';
import { dirname } from 'path';

const SITE_URL = 'https://pioneercharts.com';
const out = './dist/pioneer-charts-docs';
const browser = `${out}/browser`;

const routes = Object.keys(JSON.parse(readFileSync(`${out}/prerendered-routes.json`, 'utf-8')).routes);
if (!routes.length) {
  throw new Error('build/docs-pages.js: no pre-rendered routes found - did the docs build pre-render?');
}

for (const route of routes.filter((route) => route !== '/')) {
  const folder = `${browser}${route}`;
  if (existsSync(`${folder}/index.html`)) {
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
  writeFileSync(`${browser}/404.html`, shell.replace('<head>', '<head>\n  <meta name="robots" content="noindex">'));
  rmSync(`${browser}/index.csr.html`);
}

const pageFile = (route) => (route === '/' ? `${browser}/index.html` : `${browser}${route}.html`);
const pages = routes.filter((route) => !readFileSync(pageFile(route), 'utf-8').includes('http-equiv="refresh"'));
const urls = pages.map((route) => `  <url><loc>${SITE_URL}${route}</loc></url>`).join('\n');
writeFileSync(
  `${browser}/sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);

console.log(`Pioneer Charts: docs pages flattened, 404.html and sitemap.xml written (${pages.length} pages, ${routes.length - pages.length} redirects)`);
