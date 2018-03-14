"use strict";

const shell = require('shelljs');
const chalk = require('chalk');

shell.echo(`Start building...`);

/* Clean */
shell.echo(`Clean Disk`);
shell.exec(`npm run clean`);
shell.echo(chalk.green(`Disk clean completed`));

/* TSLint with Codelyzer */
// https://github.com/palantir/tslint/blob/master/src/configs/recommended.ts
// https://github.com/mgechev/codelyzer
shell.echo(`Start TSLint`);
shell.exec(`tslint -p tslint.json -t stylish src/**/*.ts`);
shell.echo(chalk.green(`TSLint completed`));


/* AoT compilation */
shell.echo(`Start AoT compilation`);
if (shell.exec(`npm run aot-build`).code !== 0) {
    shell.echo(chalk.red(`Error: AoT compilation failed`));
    shell.exit(1);
}
shell.echo(chalk.green(`AoT compilation completed`));

/* AoT compilation */
shell.echo(`Rollup`);
if (shell.exec(`npm run rollup`).code !== 0) {
    shell.echo(chalk.red(`Error: Rollup failed`));
    shell.exit(1);
}
shell.echo(chalk.green(`Rollup completed`));
