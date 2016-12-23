const mkdirp = require('mkdirp');
const { snakeCase } = require('lodash');

const writeFileFromTemplate = require('../../utils/write-file-from-template');

function generateModule(moduleNameParts, options) {
  const moduleName = moduleNameParts[0];
  const className = moduleNameParts[moduleNameParts.length - 1];

  const context = {
    moduleName
  };

  const filePathBase = 'modules/' + dasherize(moduleName) + '/';

  mkdirp.sync(filePathBase + 'stores');

  writeFileFromTemplate(filePathBase + 'main.js', 'module/main.js.jst', context);
  writeFileFromTemplate(filePathBase + 'actions.js', 'module/actions.js.jst', context);
  writeFileFromTemplate(filePathBase + 'module-tests.js', 'module/module-tests.js.jst', context);
};

function dasherize(string) {
  return snakeCase(string).replace(/_/g, '-');
};

module.exports = generateModule;
