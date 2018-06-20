const babelConfig = require('./config/babel');

module.exports = function(api, options = {}) {
  return babelConfig(options);
};
