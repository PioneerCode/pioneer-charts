/**
 * Move sass assets to lib dist
 */
const copyfiles = require('copyfiles');
const chalk = require('chalk');

copyfiles(['./libs/pcac/**/*.scss', './dist/bundles/@pioneer-code/pioneer-charts/scss'], { up: 2 }, function () {
  console.log(chalk.cyan('Pioneer Charts: Sass moved!'));
});
