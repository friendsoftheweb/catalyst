const fs = require('fs');
const path = require('path');
const getDirectories = require('./getDirectories');

function getEnvironment() {
  const directories = getDirectories();
  const env = process.env.NODE_ENV;

  const devServerHost = process.env.DEV_SERVER_HOST || 'localhost';
  const devServerPort = process.env.DEV_SERVER_PORT || 8080;

  const typeScriptConfigExists = fs.existsSync(
    path.join(directories.project, 'tsconfig.json')
  );

  const flowConfigExists = fs.existsSync(
    path.join(directories.project, '.flowconfig')
  );

  return {
    production: env === 'production',
    test: env === 'test',
    development: env !== 'production' && env !== 'test',
    typeScriptConfigExists,
    flowConfigExists,
    devServerHost,
    devServerPort
  };
}

module.exports = getEnvironment;
