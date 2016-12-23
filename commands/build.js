const { exitWithError } = require('../utils/logging');
const spinnerSpawn = require('../utils/spinner-spawn');

function build() {
  spinnerSpawn('./node_modules/webpack/bin/webpack.js', [
    '-d', '--display-reasons', '--display-chunks', '--bail'
  ], 'Building...')
    .then((code) => {
      console.log(chalk.green('Build Succeeded'));
    }, (code) => {
      exitWithError('Build Failed!');
    });
};

module.exports = build;
