const environment = require('../../utils/environment');

function generateDevtool() {
  const env = environment();

  if (env.development) {
    return 'cheap-module-source-map';
  } else {
    return 'source-map';
  }
}

module.exports = generateDevtool;
