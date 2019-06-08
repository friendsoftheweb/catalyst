import webpack from 'webpack';
import chalk from 'chalk';
import { exitWithError, rebuildNodeSASS } from '../utils';
import Configuration from '../Configuration';

const { environment, buildPath, webpackConfig } = new Configuration();

export default async function build() {
  if (environment === 'production') {
    console.log(
      `Creating a ${chalk.cyan('production')} build in ${chalk.cyan(
        buildPath
      )}...`
    );
  } else if (environment === 'test') {
    console.log(
      `Creating a ${chalk.cyan('test')} build in ${chalk.cyan(buildPath)}...`
    );
  } else {
    exitWithError(
      [
        'Build environment must be one of: "production", "test".',
        'Try setting the NODE_ENV environment variable.'
      ].join('\n')
    );
  }

  await rebuildNodeSASS();

  const compiler = webpack(webpackConfig);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err != null) {
        reject(err);
      } else {
        const { errors, warnings } = stats.toJson({
          all: false,
          warnings: true,
          errors: true
        });

        if (errors.length > 0) {
          reject(new Error(errors[0]));
        } else {
          if (warnings.length > 0) {
            console.log(chalk.yellow(warnings.join('\n\n')));
          }

          resolve({ stats });
        }
      }
    });
  });
}
