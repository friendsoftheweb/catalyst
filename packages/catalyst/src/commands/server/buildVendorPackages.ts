import { exec } from 'child_process';
import path from 'path';
import chalk from 'chalk';

const webpackVendorConfigPath = path.resolve(
  __dirname,
  '../../config/webpack/dll-config.js'
);

export default function buildVendorPackages() {
  return new Promise((resolve, reject) => {
    console.log(chalk.cyan('\nPrebuilding vendor packages...\n'));

    const command = [
      'webpack',
      `--config=${webpackVendorConfigPath}`,
      '--display-error-details',
      '--hide-modules',
      '--bail',
      '--color'
    ].join(' ');

    exec(command, (error) => {
      if (error != null) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
