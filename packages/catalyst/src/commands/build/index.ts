import webpack from 'webpack';
import chalk from 'chalk';
import rebuildNodeSASS from '../../utils/rebuildNodeSASS';
import Configuration from '../../Configuration';
import getWebpackConfig from '../../utils/getWebpackConfig';

export default async function build() {
  const { environment, buildPath } = new Configuration();

  if (!['production', 'test'].includes(environment)) {
    throw new Error(
      [
        'Build environment must be one of: "production", "test".',
        'Try setting the NODE_ENV environment variable.'
      ].join('\n')
    );
  }

  console.log(
    `Creating a ${chalk.cyan(environment)} build in ${chalk.cyan(
      buildPath
    )}...\n`
  );

  await rebuildNodeSASS();

  const compiler = webpack(await getWebpackConfig());

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