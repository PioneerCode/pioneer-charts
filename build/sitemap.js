/**
 * Writes the docs site's sitemap.xml, listing every page route in
 * projects/pioneer-charts-docs/src/app/app.routes.ts - read from that file, so a page added there
 * is in the next build's sitemap without anything else to update. The catch-all (`**`) route isn't
 * a page and is left out; `''` is the home page.
 *
 * Runs as part of build:docs, after the Angular build has created the output folder.
 */
import { readFileSync, writeFileSync } from 'fs';

const SITE_URL = 'https://pioneercharts.com';
const routes = readFileSync('./projects/pioneer-charts-docs/src/app/app.routes.ts', 'utf-8');

const paths = [...routes.matchAll(/\bpath:\s*'([^']*)'/g)]
  .map(([, path]) => path)
  .filter((path) => path !== '**');
if (!paths.length) {
  throw new Error('build/sitemap.js found no routes in app.routes.ts - has its format changed?');
}

const urls = paths
  .map((path) => `  <url><loc>${SITE_URL}/${path}</loc></url>`)
  .join('\n');
writeFileSync(
  './dist/pioneer-charts-docs/browser/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);
console.log(`Pioneer Charts: docs sitemap.xml written (${paths.length} pages)`);
