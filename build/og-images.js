/**
 * Renders each docs page's link-preview image - build/og-image.html with the page's title, 1200x630
 * - into projects/pioneer-charts-docs/public/og/<slug>.png, where seo.ts points that page's
 * og:image. The home page keeps the hand-captured public/og-image.png.
 *
 * Not part of any build: run it by hand after adding or retitling a page, with the docs already
 * built (`npm run build:docs`), since it reads each page's title from the pre-rendered HTML, and
 * commit the images. Needs Google Chrome (CHROME=/path/to/chrome to use another).
 *
 *   node build/og-images.js
 */
import { execFileSync } from 'child_process';
import { mkdirSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

const SITE_NAME = 'Pioneer Charts';
const browser = './dist/pioneer-charts-docs/browser';
const outDir = resolve('./projects/pioneer-charts-docs/public/og');
const source = pathToFileURL(resolve('./build/og-image.html'));
const chrome = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const routes = Object.keys(JSON.parse(readFileSync('./dist/pioneer-charts-docs/prerendered-routes.json', 'utf-8')).routes)
  .filter((route) => route !== '/');
if (!routes.length) {
  throw new Error('build/og-images.js: no pre-rendered pages found - run `npm run build:docs` first');
}

const decode = (text) => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

mkdirSync(outDir, { recursive: true });
for (const route of routes) {
  const html = readFileSync(`${browser}${route}.html`, 'utf-8');
  const ogTitle = html.match(/<meta property="og:title" content="([^"]*)"/)?.[1];
  if (!ogTitle) {
    throw new Error(`build/og-images.js: ${route} has no og:title`);
  }
  // The page's search title, without the " · Pioneer Charts" the image already shows as its brand.
  const title = decode(ogTitle).replace(` · ${SITE_NAME}`, '');
  const url = new URL(source);
  url.searchParams.set('title', title);
  const file = `${outDir}/${ogImageSlug(route)}.png`;
  execFileSync(chrome, [
    '--headless', '--hide-scrollbars', '--window-size=1200,630', '--force-device-scale-factor=1',
    // Time for the web font to load before the shot.
    '--virtual-time-budget=5000', `--screenshot=${file}`, url.href,
  ], { stdio: 'ignore' });
  console.log(`${route} -> og/${ogImageSlug(route)}.png (${title})`);
}

/** Must match seo.ts's `ogImageSlug`: a page's image is named after the last segment of its path. */
function ogImageSlug(route) {
  return route.split('/').pop();
}
