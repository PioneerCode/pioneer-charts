/**
 * Move sass assets to lib dist
 */
const copyfiles = require('copyfiles');

copyfiles(['./libs/pcac/**/*.scss', './dist/bundles/@pioneer-code/pioneer-charts/scss'], { up: 2 }, function () {
  console.log('Sass moved.');
});
