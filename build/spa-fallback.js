/**
 * Copies the docs app's index.html to 404.html so GitHub Pages serves the app for deep links.
 *
 * The docs site uses path-based routing (/docs/guides/theme, ...), but Pages only has a file for
 * "/" - any other URL, loaded directly or on refresh, would otherwise get Pages' own "Page not
 * found". Pages serves 404.html for every missing path, so making it the app shell lets the
 * router take over. Runs as part of build:docs so every deploy (publish.yml, deploy-angular.yml)
 * gets it.
 */
import { copyFileSync } from 'fs';

const dir = './dist/pioneer-charts-docs/browser';
copyFileSync(`${dir}/index.html`, `${dir}/404.html`);
console.log('Pioneer Charts: docs 404.html fallback written');
