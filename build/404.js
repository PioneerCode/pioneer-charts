import cpy from 'cpy';

await cpy('./dist/pioneer-charts/index.html', './dist/pioneer-charts/', {
  rename: () => `404.html`
})

console.log('Pioneer Charts: 404 copied!');


