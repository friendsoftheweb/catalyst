import webpack, { Stats } from 'webpack';
import chalk from 'chalk';
import Configuration from '../../Configuration';
import logVersion from '../../utils/logVersion';
import getWebpackConfig from '../../utils/getWebpackConfig';
import logStatus from '../../utils/logStatus';

interface Options {
  watch?: boolean;
}

export default async function build(options: Options) {
  const { environment, buildPath } = new Configuration();

  if (!['production', 'test'].includes(environment)) {
    throw new Error(
      [
        'Build environment must be one of: "production", "test".',
        'Try setting the NODE_ENV environment variable.',
      ].join('\n')
    );
  }

  logVersion();

  const compiler = webpack(await getWebpackConfig());

  if (options.watch) {
    console.log(
      `A new ${chalk.cyan(environment)} build will be created in ${chalk.cyan(
        buildPath
      )} whenever a file changes.`
    );

    compiler.watch({}, (err, stats) => {
      if (err) {
        throw err;
      }

      logStats(stats);
    });
  } else {
    console.log(
      `Creating a ${chalk.cyan(environment)} build in ${chalk.cyan(
        buildPath
      )}...\n`
    );

    return new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err != null) {
          reject(err);
        } else {
          logStats(stats);

          if (stats.hasErrors()) {
            reject();
          } else {
            resolve();
          }
        }
      });
    });
  }
}

function logStats(stats: Stats) {
  const { errors, warnings } = stats.toJson({
    all: false,
    warnings: true,
    errors: true,
  });

  if (errors.length > 0) {
    logStatus('ERROR', `Failed to build:`);

    console.log(`\n${errors.join('\n\n')}`);
  } else {
    if (warnings.length > 0) {
      logStatus(
        'WARNING',
        `Built successfully, with ${warnings.length} warning${
          warnings.length > 1 ? 's' : ''
        }:\n`
      );

      console.log(chalk.yellow(warnings.join('\n\n')));
    } else if (stats.endTime != null && stats.startTime != null) {
      logStatus(
        'SUCCESS',
        `Built successfully in ${(stats.endTime - stats.startTime) / 1000}s`
      );
    }
  }
}
