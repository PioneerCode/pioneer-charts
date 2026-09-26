import cpy from 'cpy';

// The LICENSE ships alongside the README: the package is MIT, whose notice has to go with every
// copy, and the README links to it. (ng-packagr's own `assets` can't do this - it refuses to read
// anything outside the library's project folder, and both files live at the repo root.)
await cpy(['./README.md', './LICENSE'], './dist/pioneer-charts/')
console.log("Pioneer Charts: README.md and LICENSE copied!");
