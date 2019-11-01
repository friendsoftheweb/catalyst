import chalk from 'chalk';

export default function exitWithError(message: string, code = 1) {
  console.log(chalk.red(message));
  process.exit(code);
}
