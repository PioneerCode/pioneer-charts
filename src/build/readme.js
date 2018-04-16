const cpy = require('cpy');
const chalk = require('chalk');

cpy('../README.md', './dist/bundles/@pioneer-code/pioneer-charts/')
  .then(() => {
    console.log(chalk.cyan('Pioneer Charts: README.md copied!'));
  });


