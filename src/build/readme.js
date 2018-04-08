const cpy = require('cpy');

cpy('../README.md', './dist/bundles/@pioneer-code/pioneer-charts/')
  .then(() => {
    console.log('README.md copied');
  });


