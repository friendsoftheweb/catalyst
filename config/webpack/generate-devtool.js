const environment = require('../../utils/environment');

function generateDevtool() {
  const env = environment();

  return env.development ? 'eval-source-map' : 'source-map';
}

module.exports = generateDevtool;
