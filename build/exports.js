/**
 * Patches the ng-packagr-generated dist/pioneer-charts/package.json to also expose the
 * themes/ and scss/ directories as importable subpaths.
 *
 * Those directories are populated by build/theme.js and build/sass.js, both of which run after
 * `ng build @pioneer-code/pioneer-charts` (ng-packagr) and have no way to influence the
 * package.json ng-packagr already wrote - so ng-packagr's own "exports" map only ever lists the
 * package's main entry point (".") and "./package.json". Once a package.json has an "exports"
 * field at all, Node's resolution algorithm rejects every subpath not explicitly listed there -
 * regardless of what files actually exist on disk - with ERR_PACKAGE_PATH_NOT_EXPORTED. Without
 * this patch, an import like `@pioneer-code/pioneer-charts/themes/pioneer-charts.css` (as shown
 * in README.md and the docs site's Theme page) would fail under any tooling that enforces
 * "exports" (which includes Vite - the same tool this repo's own dev server uses).
 *
 * Must run after build/theme.js and build/sass.js (see the build:lib script in package.json).
 */
import { readFileSync, writeFileSync } from 'fs';

const pkgPath = './dist/pioneer-charts/package.json';
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

pkg.exports['./themes/*'] = './themes/*';
pkg.exports['./scss/*'] = './scss/*';

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log('Pioneer Charts: package.json exports patched with ./themes/* and ./scss/*');
