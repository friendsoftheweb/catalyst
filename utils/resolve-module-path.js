const fs = require('fs');
const path = require('path');

function resolveModulePath(modulePath) {
  let moduleName, modulePathSegments;

  [moduleName, ...modulePathSegments] = modulePath.split('/');

  const projectModulesRoot = path.resolve(process.cwd(), './node_modules');
  const catalystModulesRoot = path.resolve(__dirname, '../node_modules');

  if (fs.existsSync(path.join(projectModulesRoot, moduleName))) {
    return path.join(projectModulesRoot, moduleName, ...modulePathSegments);
  } else if (fs.existsSync(path.join(catalystModulesRoot, moduleName))) {
    return path.join(catalystModulesRoot, moduleName, ...modulePathSegments);
  } else {
    throw new Error(`Cannot resolve module path for '${moduleName}'`);
  }
}

module.exports = resolveModulePath;
