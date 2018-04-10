const path = require('path');
const { getEnvironment, resolveModulePath } = require('../../utils');

function generateEntry(entryPath) {
  const environment = getEnvironment();
  const entry = [];

  if (environment.development) {
    entry.push(path.resolve(__dirname, '../../../lib/dev-client'));
  }

  entry.push(resolveModulePath('regenerator-runtime/runtime'));
  entry.push(entryPath);

  return entry;
}

module.exports = generateEntry;
