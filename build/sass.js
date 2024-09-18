import cpy from 'cpy';
await cpy(['./projects/pioneer-charts/src/lib/**/*.scss'], './dist/pioneer-charts/scss');
console.log('Pioneer Charts: Sass moved!');
