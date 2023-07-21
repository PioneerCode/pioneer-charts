/**
 * Build pre-built theme
 */
import { render } from 'node-sass';
import { existsSync, mkdir, writeFile } from 'fs';
const outputDirectory = './dist/pioneer-code/pioneer-charts/themes';

render({
  file: './projects/pioneer-code/pioneer-charts/src/lib/pioneer-charts.scss',
  sourceMap: true,
  outFile: 'pcac.css'
}, function (_, result) {
  if (existsSync(outputDirectory)) {
    _writeFile(result.css.toString(), outputDirectory + "/pioneer-charts.css");
    _writeFile(result.map.toString(), outputDirectory + "/pioneer-charts.css.map");
  } else {
    return mkdir(outputDirectory, function () {
      _writeFile(result.css.toString(), outputDirectory + "/pioneer-charts.css");
      _writeFile(result.map.toString(), outputDirectory + "/pioneer-charts.css.map");
    });
  }
});

render({
  file: './projects/pioneer-code/pioneer-charts/src/lib/pioneer-charts.scss',
  sourceMap: true,
  outFile: 'pioneer-charts.min.css',
  outputStyle: 'compressed'
}, function (_, result) {
  if (existsSync(outputDirectory)) {
    _writeFile(result.css.toString(), outputDirectory + "/pioneer-charts.min.css");
    _writeFile(result.map.toString(), outputDirectory + "/pioneer-charts.min.css.map");
  } else {
    return mkdir(outputDirectory, function () {
      _writeFile(result.css.toString(), outputDirectory + "/pioneer-charts.min.css");
      _writeFile(result.map.toString(), outputDirectory + "/pioneer-charts.min.css.map");
    });
  }
});

function _writeFile(data, dir) {
  return writeFile(dir, data, function () {
    console.log('Pioneer Charts: ' + dir + ' theme was saved!');
  });
}
