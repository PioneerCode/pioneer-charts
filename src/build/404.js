const cpy = require('cpy');

cpy('./dist/apps/demo/index.html', './dist/apps/demo/', {
  rename: basename => `404.html`
}).then(() => {
  console.log('files copied');
});


