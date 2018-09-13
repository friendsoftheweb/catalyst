const path = require('path');
const { getEnvironment, getConfig, resolveModulePath } = require('../../utils');

function generateEntry(entryPath) {
  const environment = getEnvironment();
  const config = getConfig();

  const entry = [];

  if (environment.development && config.devClient) {
    entry.push(path.resolve(__dirname, '../../../lib/dev-environment'));
    entry.push(path.resolve(__dirname, '../../../lib/dev-client'));
  }

  entry.push(resolveModulePath('regenerator-runtime/runtime'));
  entry.push(entryPath);

  return entry;
}

module.exports = generateEntry;
