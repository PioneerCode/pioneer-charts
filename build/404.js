import cpy from 'cpy';

cpy('./dist/pioneer-charts/index.html', './dist/pioneer-code/pioneer-charts/', {
  rename: () => `404.html`
}).then((error) => {
  console.log(error);
  console.log('Pioneer Charts: 404 copied!');
});


