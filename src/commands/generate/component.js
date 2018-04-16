const { format, getConfig, writeFileFromTemplate } = require('../../utils');

function generateComponent(moduleNameParts) {
  const config = getConfig();

  const className = moduleNameParts[moduleNameParts.length - 1];
  const modulePath = moduleNameParts.map(format.dasherize).join('/');
  const fileNameBase = format.dasherize(className);

  const modulePathBase = `components/${modulePath}`;
  const componentPathBase = `${config.rootPath}/${modulePathBase}`;
  const testPathBase = `${config.rootPath}/components/__tests__/${modulePath}`;

  const componentFilePath = `${componentPathBase}/index.js`;
  const stylesFilePath = `${componentPathBase}/styles.scss`;
  const testFilePath = `${testPathBase}/component-test.js`;

  const context = {
    moduleNameParts,
    className,
    modulePath,
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
