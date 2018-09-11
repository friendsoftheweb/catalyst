const Spinner = require('node-spinner');
const { spawn } = require('child_process');
const { compact } = require('lodash');
const chalk = require('chalk');

function spinnerSpawn(command, args, message) {
  args = compact(args);

  return new Promise((resolve, reject) => {
    process.stderr.write(chalk.dim(`\n$ ${command} ${args.join(' ')}\n`));

    const cmd = spawn(command, args);

    if (process.stdout.isTTY) {
      const spinner = Spinner();

      let lastSpinner = '';

      const spinnerInterval = setInterval(() => {
        lastSpinner = '\r' + spinner.next() + ' \x1B[36m' + message + '\x1B[m';
        process.stdout.write(lastSpinner);
      }, 100);

      cmd.stdout.on('data', data => {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);

        process.stdout.write(data);
        process.stdout.write(lastSpinner);
      });

      cmd.stderr.on('data', data => {
        process.stderr.clearLine();
        process.stderr.cursorTo(0);

        process.stderr.write(data);
      });

      cmd.on('close', code => {
        clearInterval(spinnerInterval);

        process.stdout.clearLine();
        process.stdout.cursorTo(0);
      });
    } else {
      cmd.stdout.on('data', data => {
        process.stdout.write(data);
      });

      cmd.stderr.on('data', data => {
        process.stderr.write(data);
      });
    }

    cmd.on('close', code => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(code);
      }
    });
  });
}

module.exports = spinnerSpawn;
