const { spawn } = require('child_process');
const chalk = require('chalk');

function check() {
  const cmd = spawn(process.cwd() + '/node_modules/eslint/bin/eslint.js', [
    './components/**/component.js'
  ]);

  cmd.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  cmd.stderr.on('data', (data) => {
    console.log(data.toString());
  });

  cmd.on('close', (code) => {
    if (code === 0) {
      console.log(chalk.green('Passed'));
    } else {
      console.log(chalk.red('Failed'));
    }
  });
};

module.exports = check;
