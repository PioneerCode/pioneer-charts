const cpy = require('cpy');
const chalk = require('chalk');

cpy('./dist/pioneer-charts/index.html', './dist/pioneer-charts/docs/', {
  rename: basename => `404.html`
}).then((error, r) => {
  console.log(error);
  console.log(chalk.cyan('Pioneer Charts: 404 copied!'));
});


