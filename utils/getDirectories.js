const path = require('path');
const getConfig = require('./getConfig');

function getDirectories() {
  const config = getConfig();
  const project = process.cwd();

  return {
    project,
    context: path.join(project, config.rootPath),
    build: path.join(project, config.buildPath),
    bundles: path.join(project, config.rootPath, 'bundles'),
    temp: path.join(project, 'temp', 'catalyst')
  };
}

module.exports = getDirectories;
