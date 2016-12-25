const mkdirp = require('mkdirp');
const { lowerFirst } = require('lodash');
const { dasherize } = require('../../utils/formatting');

const writeFileFromTemplate = require('../../utils/write-file-from-template');
const loadConfig = require('../../utils/load-config');

function generateModule(moduleNameParts, options) {
  const config = loadConfig();

  const moduleName = moduleNameParts[0];
  const lowerModuleName = lowerFirst(moduleName);
  const moduleDirectory = dasherize(moduleName);

  const context = {
    moduleName,
    lowerModuleName,
    moduleDirectory
  };

  const filePathBase = `${config.rootPath}/modules/${moduleDirectory}`;

  writeFileFromTemplate(`${filePathBase}/index.js`, 'module/index.js.jst', context);

  writeFileFromTemplate(`${filePathBase}/${moduleDirectory}-reducer.js`, 'module/reducer.js.jst', context);
  writeFileFromTemplate(`${filePathBase}/${moduleDirectory}-saga.js`, 'module/saga.js.jst', context);
  writeFileFromTemplate(`${filePathBase}/${moduleDirectory}-actions.js`, 'module/actions.js.jst', context);
  writeFileFromTemplate(`${filePathBase}/${moduleDirectory}-getters.js`, 'module/getters.js.jst', context);

  writeFileFromTemplate(`${filePathBase}/__tests__/${moduleDirectory}-reducer-test.js`, 'module/reducer-test.js.jst', context);
  writeFileFromTemplate(`${filePathBase}/__tests__/${moduleDirectory}-saga-test.js`, 'module/saga-test.js.jst', context);
};

module.exports = generateModule;
