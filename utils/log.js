const chalk = require('chalk');
const { padStart } = require('lodash');

function logAction(action, filePath) {
  let color;

  switch (action) {
    case 'create':
    case 'identical':
      color = chalk.green;
      break;
    case 'skip':
      color = chalk.blue;
      break;
    case 'overwrite':
      color = chalk.red;
      break;
    default:
      color = chalk.grey;
  }

  console.log(`${color(padStart(action, 10))} ${filePath}`);
}

function exitWithError(message, code = 1) {
  console.log(chalk.red(message));
  process.exit(code);
}

module.exports = { logAction, exitWithError };
