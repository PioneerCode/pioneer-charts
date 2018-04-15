/**
 * Move sass assets to lib dist
 */
const copyfiles = require('copyfiles');

copyfiles(['./libs/pcac/**/*.scss', './dist/bundles/@pioneer-code/pioneer-charts/dist/scss'], { up: 2 }, function () {
  console.log('Sass moved.');
});
