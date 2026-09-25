/**
 * Build pre-built theme
 *
 * Synchronous on purpose: a failed compile or write throws, which fails `build:lib` - so a
 * release can't go out missing its theme CSS. (The old callback-based writes ignored their
 * errors and the build carried on.)
 */
import * as sass from 'sass';
import { mkdirSync, writeFileSync } from 'fs';

const source = './projects/pioneer-charts/src/lib/pioneer-charts.scss';
const outputDirectory = './dist/pioneer-charts/themes';

mkdirSync(outputDirectory, { recursive: true });

for (const [file, style] of [['pioneer-charts.css', 'expanded'], ['pioneer-charts.min.css', 'compressed']]) {
  const path = `${outputDirectory}/${file}`;
  writeFileSync(path, sass.compile(source, { style }).css);
  console.log('Pioneer Charts: ' + path + ' theme was saved!');
}
