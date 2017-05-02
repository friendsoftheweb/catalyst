const fs = require('fs');
const { exitWithError } = require('./logging');

function loadConfig() {
  if (fs.existsSync('package.json')) {
    const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    if (typeof packageData.catalyst === 'object') {
      return packageData.catalyst;
    } else {
      exitWithError('package.json is missing a catalyst config');
    }
  } else {
    exitWithError('Missing package.json');
  }
}

module.exports = loadConfig;
