/**
 * Move sass assets to lib dist
 */
const cpy = require('cpy');

cpy('./libs/pcac/**/*.scss', './dist/bundles/@pioneer-code/pioneer-charts/dist/scss/', {
  parents: true
}).then(() => {
  console.log('Sass moved.');
});


