const { map } = require('lodash');

const { log, format } = require('../utils');

const generateComponent = require('./generate/component');
const generateModule = require('./generate/module');

function generate(type, moduleName, options) {
  type = type.replace(/\s/g, '');

  const moduleNameParts = map(moduleName.split(/[./]/), format.classify);

  switch (type) {
    case 'component':
      generateComponent(moduleNameParts, options);
      break;
    case 'module':
      generateModule(moduleNameParts, options);
      break;
    default:
      log.exitWithError(
        `Unknown type '${type}'. Options are 'component' and 'module'.`
      );
  }
}

module.exports = generate;
