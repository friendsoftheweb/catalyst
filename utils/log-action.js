var chalk = require('chalk');

var logAction = function(action, filePath) {
  var prefix;

  switch (action) {
    case 'create':
      prefix = chalk.green('  create ');
      break;
    default:
      throw new Error('Unknown action "' + action + '".');
  }

  console.log(prefix + filePath);
};

module.exports = logAction;
