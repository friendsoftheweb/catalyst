const { map } = require('lodash');

const { classify } = require('../utils/formatting');
const { exitWithError } = require('../utils/logging');
const writeFileFromTemplate = require('../utils/write-file-from-template');

const generateComponent = require('./generate/component');
const generateModule = require('./generate/module');

function generate(type, moduleName, options) {
  type = type.replace(/\s/g, '');

  const moduleNameParts = map(moduleName.split(/[\.\/]/), classify);

  switch(type) {
    case 'component':
      generateComponent(moduleNameParts, options);
      break;
    case 'module':
      generateModule(moduleNameParts, options);
      break;
    default:
      exitWithError(`Unknown type '${type}'. Options are 'component' and 'module'.`);
  }
};

module.exports = generate;
