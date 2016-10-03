var spinnerSpawn = require('../utils/spinner-spawn');

var build = function() {
  spinnerSpawn('./node_modules/webpack/bin/webpack.js', [
    '-d', '--display-reasons', '--display-chunks', '--bail'
  ], 'Building')
    .then(function(code) {
      console.log(chalk.green('Build Succeeded'));
    }, function(code) {
      console.log(chalk.red('Build Failed'));
      process.exit(code);
    });
};

module.exports = build;
