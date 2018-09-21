const chalk = require('chalk');

const {
  getConfig,
  getEnvironment,
  log,
  spinnerSpawn,
  rebuildNodeSASS
} = require('../utils');

async function build() {
  const environment = getEnvironment();
  const config = getConfig();

  if (!(environment.production || environment.test)) {
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
    code => {
      log.exitWithError('Build Failed!', code);
    }
  );
}

module.exports = build;
