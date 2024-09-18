/**
 * Build pre-built theme
 */
import * as sass from 'sass';
import { existsSync, mkdir, writeFile } from 'fs';
const outputDirectory = './dist/pioneer-charts/themes';

const result = sass.compile('./projects/pioneer-charts/src/lib/pioneer-charts.scss');
if (existsSync(outputDirectory)) {
  _writeFile(result.css.toString(), outputDirectory + "/pioneer-charts.css");
} else {
  mkdir(outputDirectory, function () {
    _writeFile(result.css.toString(), outputDirectory + "/pioneer-charts.css");
  });
}

const resultMin = sass.compile('./projects/pioneer-charts/src/lib/pioneer-charts.scss', { style: "compressed" });
if (existsSync(outputDirectory)) {
  _writeFile(resultMin.css.toString(), outputDirectory + "/pioneer-charts.min.css");
} else {
  mkdir(outputDirectory, function () {
    _writeFile(resultMin.css.toString(), outputDirectory + "/pioneer-charts.min.css");
  });
}


function _writeFile(data, dir) {
  return writeFile(dir, data, function () {
    console.log('Pioneer Charts: ' + dir + ' theme was saved!');
  });
}
