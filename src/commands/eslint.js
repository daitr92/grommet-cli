/**
* NPM dependencies
**/
import chalk from 'chalk';
import emoji from 'node-emoji';
import prettyHrtime from 'pretty-hrtime';
import Linter from 'eslint-parallel';

/**
* Local dependencies
**/
import { loadConfig } from '../utils/cli';

const config = loadConfig();

const delimiter = chalk.magenta('[grommet:eslint]');

function errorHandler(err) {
  console.log(
    `${delimiter}: ${chalk.red('failed')}`
  );
  console.error(err);
  process.exit(1);
}

export default function (vorpal) {
  vorpal
    .command(
      'eslint',
      'Uses jsAssets entry in local grommet configuration to evaluate your ' +
      'javascript code'
    )
    .action((args, cb) => {

      if (!config.jsAssets) {
        console.warn(
          `${delimiter}: ${chalk.yellow('Nothing to lint, you need to specify jsAssets entry inside grommet-toolbox.config.js.')}`
        );

        cb();
      } else {
        const timeId = process.hrtime();

        console.log(
          `${delimiter}: ${emoji.get('hourglass')} Linting Javascript files...`
        );

        new Linter({
          cache: true,
          cwd: config.base
        }).execute(config.jsAssets).then(
          (result) => {
            const failed = result.errorCount > 1 || result.warningCount > 1;
            console.log(
              `${delimiter}: ${
                failed ? chalk.red('failed') : chalk.green('success')
              }`
            );

            if (failed) {
              process.exit(1);
            }

            const t = process.hrtime(timeId);
            console.log(`${emoji.get('sparkles')} ${prettyHrtime(t)}`);
            cb();
          },
          (err) => {
            console.log(err);
            process.exit(1);
          }
        ).catch(errorHandler);
      }
    });
};