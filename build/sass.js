/**
 * Move sass assets to lib dist
 */
import copyfiles from 'copyfiles';

copyfiles(['./projects/pioneer-code/pioneer-charts/src/lib/**/*.scss', './dist/pioneer-code/pioneer-charts/scss'], { up: 4 }, function () {
  console.log('Pioneer Charts: Sass moved!');
});
