const { lowerFirst } = require('lodash');
const { format, getConfig, writeFileFromTemplate } = require('../../utils');

function generateModule(moduleNameParts) {
  const config = getConfig();

  const moduleName = moduleNameParts[0];
  const lowerModuleName = lowerFirst(moduleName);
  const moduleDirectory = format.dasherize(moduleName);

  const context = {
    moduleName,
    lowerModuleName,
    moduleDirectory
  };

  const filePathBase = `${config.rootPath}/modules/${moduleDirectory}`;

  writeFileFromTemplate(
    `${filePathBase}/index.js`,
    'module/index.js.jst',
    context
  );

  writeFileFromTemplate(
    `${filePathBase}/reducer.js`,
    'module/reducer.js.jst',
    context
  );

  writeFileFromTemplate(
    `${filePathBase}/saga.js`,
    'module/saga.js.jst',
    context
  );

  writeFileFromTemplate(
    `${filePathBase}/action-creators.js`,
    'module/action-creators.js.jst',
    context
  );

  writeFileFromTemplate(
    `${filePathBase}/requests.js`,
    'module/requests.js.jst',
    context
  );

  writeFileFromTemplate(
    `${filePathBase}/getters.js`,
    'module/getters.js.jst',
    context
  );

  writeFileFromTemplate(
    `${filePathBase}/__tests__/reducer-test.js`,
    'module/reducer-test.js.jst',
    context
  );

  writeFileFromTemplate(
    `${filePathBase}/__tests__/saga-test.js`,
    'module/saga-test.js.jst',
    context
  );
}

module.exports = generateModule;
