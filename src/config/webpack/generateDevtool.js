const { getEnvironment } = require('../../utils');

function generateDevtool() {
  const environment = getEnvironment();

  if (environment.production) {
    return 'source-map';
  }

  return 'inline-cheap-source-map';
}

module.exports = generateDevtool;
