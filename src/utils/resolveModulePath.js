const fs = require('fs');
const path = require('path');

/*
 * Determines the path to a node module. First searches in the host project and
 * then within the "node_modules" directory for catalyst.
 */
function resolveModulePath(modulePath) {
  let moduleName, modulePathSegments;

  const splitModulePath = modulePath.split('/');

  if (/^@/.test(modulePath)) {
    modulePathSegments = splitModulePath.slice(2);
    moduleName = [splitModulePath[0], splitModulePath[1]].join('/');
  } else {
    modulePathSegments = splitModulePath.slice(1);
    moduleName = splitModulePath[0];
  }

  const projectModulesRoot = path.resolve(process.cwd(), './node_modules');
  const catalystModulesRoot = path.resolve(__dirname, '../../node_modules');

  if (fs.existsSync(path.join(projectModulesRoot, moduleName))) {
    return path.join(projectModulesRoot, moduleName, ...modulePathSegments);
  } else if (fs.existsSync(path.join(catalystModulesRoot, moduleName))) {
    return path.join(catalystModulesRoot, moduleName, ...modulePathSegments);
  } else {
    throw new Error(`Cannot resolve module path for '${moduleName}'`);
  }
}

module.exports = resolveModulePath;
