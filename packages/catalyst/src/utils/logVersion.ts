import path from 'path';
import chalk from 'chalk';

export default function logVersion() {
  const packageJson = require(path.join(__dirname, '../../package.json'));

  console.log(`Catalyst ${chalk.cyan(`v${packageJson.version}`)}`);
}
