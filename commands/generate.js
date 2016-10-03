var mkdirp = require('mkdirp');
var _ = require('lodash');

var writeFileFromTemplate = require('../utils/write-file-from-template');

var classify = function(string) {
  return _.capitalize(_.camelCase(string));
};

var dasherize = function(string) {
  return _.snakeCase(string).replace(/_/g, '-');
};

var generateComponent = function(className, options) {
  var context = {
    className: className
  };

  var filePathBase = 'components/' + dasherize(className) + '/';

  writeFileFromTemplate(filePathBase + 'component.js', 'component/component.js.jst', context);
  writeFileFromTemplate(filePathBase + 'styles.scss', 'component/styles.scss.jst', context);
  writeFileFromTemplate(filePathBase + 'component-tests.js', 'component/component-tests.js.jst', context);
};

var generateModule = function(moduleName, options) {
  var context = {
    moduleName: moduleName
  };

  var filePathBase = 'modules/' + dasherize(moduleName) + '/';

  mkdirp.sync(filePathBase + 'stores');

  writeFileFromTemplate(filePathBase + 'main.js', 'module/main.js.jst', context);
  writeFileFromTemplate(filePathBase + 'action-types.js', 'module/action-types.js.jst', context);
  writeFileFromTemplate(filePathBase + 'actions.js', 'module/actions.js.jst', context);
  writeFileFromTemplate(filePathBase + 'getters.js', 'module/getters.js.jst', context);
  writeFileFromTemplate(filePathBase + 'module-tests.js', 'module/module-tests.js.jst', context);
};

var generate = function(type, className, options) {
  var parts = className.split(/[\.\/]/);

  className = classify(parts[parts.length - 1]);

  switch(type) {
    case 'component':
      generateComponent(className, options);
      break;
    case 'module':
      generateModule(className, options);
      break;
  }
};

module.exports = generate;
