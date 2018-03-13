const path = require('path');
const environment = require('../../utils/environment');
const resolveModulePath = require('../../utils/resolve-module-path');

function generateEntry(entryPath) {
  const env = environment();
  const entry = [];

  if (env.development) {
    entry.push(path.resolve(__dirname, '../../webpack-dev-client'));
  }

  entry.push(resolveModulePath('regenerator-runtime/runtime'));
  entry.push(entryPath);

  return entry;
}

module.exports = generateEntry;
