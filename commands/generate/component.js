const writeFileFromTemplate = require('../../utils/write-file-from-template');
const loadConfig = require('../../utils/load-config');
const { dasherize } = require('../../utils/formatting');

function generateComponent(moduleNameParts, options) {
  const config = loadConfig();

  const className = moduleNameParts[moduleNameParts.length - 1];
  const moduleName = moduleNameParts.map(dasherize).join('/');
  const fileNameBase = dasherize(className);

  const modulePathBase = `components/${moduleName}`;
  const componentPathBase = `${config.rootPath}/${modulePathBase}`;
  const testPathBase = `${config.rootPath}/components/__tests__/${moduleName}`;

  const componentFilePath = `${componentPathBase}/index.js`;
  const stylesFilePath = `${componentPathBase}/styles.scss`;
  const testFilePath = `${testPathBase}/component-test.js`;

  const context = {
    moduleName,
    className,
    modulePathBase,
    fileNameBase,
    componentFilePath
  };

  writeFileFromTemplate(
    componentFilePath,
    'component/component.js.jst',
    context
  );
  writeFileFromTemplate(stylesFilePath, 'component/styles.scss.jst', context);
  writeFileFromTemplate(
    testFilePath,
    'component/component-test.js.jst',
    context
  );

  console.log('\nYou can import your component like this:\n');
  console.log('import ' + className + " from '" + modulePathBase + "';");
}

module.exports = generateComponent;
