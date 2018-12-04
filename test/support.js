const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const { uniqueId } = require('lodash');

const projectRootPath = path.resolve(__dirname, '..');
const commandPath = path.join(projectRootPath, 'src/index.js');

function createProject({
  createPackageFile = true,
  config = { rootPath: 'client', buildPath: 'public/assets' }
} = {}) {
  const testProjectRoot = path.resolve(__dirname, `./projects/${uniqueId()}`);

  mkdirp.sync(`${testProjectRoot}/client/bundles/application`);
  mkdirp.sync(`${testProjectRoot}/client/config`);

  if (createPackageFile) {
    fs.writeFileSync(
      path.resolve(testProjectRoot, './package.json'),
      JSON.stringify({
        catalyst: config,
        dependencies: {}
      })
    );
  }

  fs.writeFileSync(
    path.resolve(testProjectRoot, './client/config/webpack.js'),
    fs.readFileSync(
      path.resolve(projectRootPath, './src/templates/webpack.config.js.jst')
    )
  );

  return testProjectRoot;
}

module.exports = { projectRootPath, commandPath, createProject };
