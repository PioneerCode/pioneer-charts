const cpy = require('cpy');
const chalk = require('chalk');

cpy('./dist/apps/docs/index.html', './dist/apps/docs/', {
  rename: basename => `404.html`
}).then((error, r) => {
  console.log(error);
  console.log(chalk.cyan('Pioneer Charts: 404 copied!'));
});


