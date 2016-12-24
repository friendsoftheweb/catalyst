const fs = require('fs');

const { exitWithError } = require('./logging');

function loadConfig() {
  if (fs.existsSync('package.json')) {
    const package = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    if (typeof package.catalyst === 'object') {
      return package.catalyst;
    } else {
      exitWithError('package.json is missing a catalyst config.')
    }
  } else {
    exitWithError('Missing package.json');
  }
}

module.exports = loadConfig;
