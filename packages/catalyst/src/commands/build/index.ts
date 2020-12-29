import webpack, { Stats } from 'webpack';
import chalk from 'chalk';
import Configuration from '../../Configuration';
import { Environment } from '../../Environment';
import logVersion from '../../utils/logVersion';
import getWebpackConfig from '../../utils/getWebpackConfig';
import logStatus, { Status } from '../../utils/logStatus';

interface Options {
  watch?: boolean;
}

export default async function build(options: Options): Promise<void> {
  const { environment, buildPath } = new Configuration();

  if (
    environment !== Environment.Production &&
    environment !== Environment.Test
  ) {
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
      compiler.run((error, stats) => {
        if (error != null) {
          reject(error);
        } else {
          logStats(stats);

          if (stats == null || stats.hasErrors()) {
            reject();
          } else {
            resolve();
          }
        }
      });
    });
  }
}

function logStats(stats: Stats | undefined) {
  if (stats == null) {
    return;
  }

  const { errors, warnings } = stats.toJson({
    all: false,
    warnings: true,
    errors: true,
  });

  if (errors.length > 0) {
    for (const error of errors) {
      logStatus(Status.Error, error.message);
    }
  } else {
    if (warnings.length > 0) {
      for (const warning of warnings) {
        logStatus(Status.Warning, warning.message);
      }
    }

    if (stats.endTime != null && stats.startTime != null) {
      logStatus(
        Status.Success,
        `Built successfully in ${(stats.endTime - stats.startTime) / 1000}s`
      );
    }
  }
}
