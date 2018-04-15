const cpy = require('cpy');

cpy('./libs/pcac/**/*.scss', './dist/bundles/@pioneer-code/pioneer-charts/dist/scss', {
}).then(() => {
  console.log('sass copied');
});


