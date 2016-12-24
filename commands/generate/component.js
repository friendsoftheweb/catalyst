const writeFileFromTemplate = require('../../utils/write-file-from-template');
const loadConfig = require('../../utils/load-config');

function generateComponent(moduleNameParts, options) {
  const config = loadConfig();

  const className = moduleNameParts[moduleNameParts.length - 1];

  const moduleName = moduleNameParts.join('/');

  const componentPathBase = `${config.rootPath}/components/${moduleName}/`;
  const testPathBase = `${config.rootPath}/components/__tests__/${moduleName}/`;

  const filePath = componentPathBase + className + '.js';
  const modulePath = 'components/' + moduleName + '/' + className;
  const testFilePath = testPathBase + className + '-test.js';

  const context = {
    className,
    filePath,
    modulePath
  };

  writeFileFromTemplate(filePath, 'component/component.js.jst', context);
  writeFileFromTemplate(testFilePath, 'component/component-test.js.jst', context);

  console.log('\nYou can import your component like this:\n');
  console.log('import ' + className + ' from \'' + modulePath + '\';');
};

module.exports = generateComponent;
