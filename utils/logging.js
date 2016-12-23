const chalk = require('chalk');

function logAction(action, filePath) {
  let prefix;

  switch (action) {
    case 'create':
      prefix = chalk.green('  create ');
      break;
    default:
      throw new Error('Unknown action "' + action + '".');
  }

  console.log(prefix + filePath);
}

function exitWithError(message, code = 1) {
  console.log(chalk.red(message));
  process.exit(code);
}

module.exports = { logAction, exitWithError };
