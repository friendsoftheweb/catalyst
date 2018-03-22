const chalk = require('chalk');
const loadConfig = require('../utils/load-config');
const environment = require('../utils/environment');
const { exitWithError } = require('../utils/logging');
const spinnerSpawn = require('../utils/spinner-spawn');

function build() {
  const env = environment();
  const config = loadConfig();

  if (!(env.production || env.test)) {
    exitWithError(
      [
        'Build environment must be one of: "production", "test".',
        'Try setting the NODE_ENV environment variable.'
      ].join('\n')
    );
  }

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
      exitWithError('Build Failed!', code);
    }
  );
}

module.exports = build;
