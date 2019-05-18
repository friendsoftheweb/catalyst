import chalk from 'chalk';

import {
  getConfig,
  getEnvironment,
  log,
  spinnerSpawn,
  rebuildNodeSASS
} from '../utils';

export default async function build() {
  const environment = getEnvironment();
  const config = getConfig();

  if (!(environment.isProduction || environment.isTest)) {
    log.exitWithError(
      [
        'Build environment must be one of: "production", "test".',
        'Try setting the NODE_ENV environment variable.'
      ].join('\n')
    );
  }

  await rebuildNodeSASS();

  spinnerSpawn(
    'yarn',
    [
      'run',
      'webpack',
      `--config=${config.rootPath}/config/webpack.js`,
      '--display-error-details',
      '--hide-modules',
      '--bail',
      '--color'
    ],
    'Building...'
  ).then(
    () => {
      console.log(chalk.green('Build Succeeded'));
    },
    (code) => {
      log.exitWithError('Build Failed!', code);
    }
  );
}
