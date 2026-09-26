/**
 * Shapes the pre-rendered docs build (`outputMode: "static"`, see app.routes.server.ts) for GitHub
 * Pages. Runs as part of build:docs, so every deploy (publish.yml, deploy-angular.yml) gets it.
 *
 * 1. Flattens each page from `<route>/index.html` to `<route>.html`. Pages serves both at
 *    `/<route>`, but a folder's index answers with a 301 to `/<route>/` first - a URL that isn't
 *    the page's canonical one (seo.ts) or the one in the sitemap.
 * 2. Writes 404.html - what Pages serves, with a 404 status, for any URL that isn't a file - from
 *    the client-only shell (index.csr.html), which renders whatever the router makes of the URL:
 *    the home page, marked noindex (see seo.ts).
 * 3. Writes sitemap.xml from the routes the builder actually pre-rendered.
 */
import { copyFileSync, readdirSync, readFileSync, renameSync, rmdirSync, writeFileSync } from 'fs';
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
  renameSync(`${folder}/index.html`, `${folder}.html`);
  // The folder held only the page; remove it and any parents it leaves empty.
  for (let dir = folder; dir !== browser && readdirSync(dir).length === 0; dir = dirname(dir)) {
    rmdirSync(dir);
  }
}

copyFileSync(`${browser}/index.csr.html`, `${browser}/404.html`);

const urls = routes.map((route) => `  <url><loc>${SITE_URL}${route}</loc></url>`).join('\n');
writeFileSync(
  `${browser}/sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);

console.log(`Pioneer Charts: docs pages flattened, 404.html and sitemap.xml written (${routes.length} pages)`);
