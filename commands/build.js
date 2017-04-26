const path = require('path');
const { exitWithError } = require('../utils/logging');
const spinnerSpawn = require('../utils/spinner-spawn');
const resolveModulePath = require('../utils/resolve-module-path');

function build() {
  spinnerSpawn(
    resolveModulePath('webpack/bin/webpack.js'),
    ['--hide-modules', '--bail'],
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
