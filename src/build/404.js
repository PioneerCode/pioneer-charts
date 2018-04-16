const cpy = require('cpy');
const chalk = require('chalk');

cpy('./dist/apps/demo/index.html', './dist/apps/demo/', {
  rename: basename => `404.html`
}).then(() => {
  console.log(chalk.cyan('Pioneer Charts: 404 copied!'));
});


