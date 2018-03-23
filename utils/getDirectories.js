const path = require('path');
const loadConfig = require('./load-config');

module.exports = function getDirectories() {
  const config = loadConfig();
  const project = process.cwd();

  return {
    project,
    context: path.join(project, config.rootPath),
    build: path.join(project, config.buildPath),
    bundles: path.join(project, config.rootPath, 'bundles'),
    temp: path.join(project, 'temp', 'catalyst')
  };
};
