import Spinner from 'node-spinner';
import { clearLine } from 'readline';
import { spawn } from 'child_process';
import { compact } from 'lodash';
import chalk from 'chalk';

export default function spinnerSpawn(
  command: string,
  args: string[],
  message: string
): Promise<number> {
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
        clearLine(process.stdout, 0);
        // cursorTo(0);

        process.stdout.write(data);
        process.stdout.write(lastSpinner);
      });

      cmd.stderr.on('data', data => {
        clearLine(process.stdout, 0);
        // moveCursor(stderr, 0);

        process.stderr.write(data);
      });

      cmd.on('close', () => {
        clearInterval(spinnerInterval);

        clearLine(process.stdout, 0);
        // process.stdout.cursorTo(0);
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
