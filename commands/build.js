const chalk = require('chalk');
const loadConfig = require('../utils/load-config');
const environment = require('../utils/environment');
const { exitWithError } = require('../utils/logging');
const spinnerSpawn = require('../utils/spinner-spawn');
const resolveModulePath = require('../utils/resolve-module-path');

function build() {
  const env = environment();
  const config = loadConfig();

  if (!(env.production || env.test)) {
    exitWithError(
      [
        'Build environment must be one of: "production", "test".',
        'Try setting the NODE_ENV environemnt variable.'
      ].join('\n')
    );
  }

  spinnerSpawn(
    resolveModulePath('webpack/bin/webpack.js'),
    [`--config=${config.rootPath}/config/webpack.js`, '--hide-modules', '--bail', '--color'],
    'Building...'
  ).then(
    code => {
      console.log(chalk.green('Build Succeeded'));
    },
    code => {
      exitWithError('Build Failed!');
    }
  );
}

module.exports = build;
