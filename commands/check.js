var spawn = require('child_process').spawn;
var chalk = require('chalk');

var check = function() {
  var cmd = spawn(process.cwd() + '/node_modules/eslint/bin/eslint.js', [
    './components/**/component.js'
  ]);

  cmd.stdout.on('data', function (data) {
    console.log(data.toString());
  });

  cmd.stderr.on('data', function (data) {
    console.log(data.toString());
  });

  cmd.on('close', function (code) {
    if (code === 0) {
      console.log(chalk.green('Passed'));
    } else {
      console.log(chalk.red('Failed'));
    }
  });
};

module.exports = check;
