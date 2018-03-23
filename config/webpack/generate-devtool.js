const environment = require('../../utils/environment');

module.exports = function generateDevtool() {
  const env = environment();

  if (env.production) {
    return 'source-map';
  }

  return 'inline-cheap-source-map';
};
