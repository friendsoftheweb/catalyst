const fs = require('fs');
const path = require('path');

module.exports = function(source) {
  this.cacheable();
  const callback = this.async();

  const resourceDirectory = this.resourcePath.replace(/\/[^\/]+\.js$/, '');
  const stylesPath = path.join(resourceDirectory, 'styles.scss');

  fs.exists(stylesPath, exists => {
    if (exists) {
      this.addDependency(stylesPath);

      callback(null, `require('./styles.scss');\n${source};`);
    } else {
      callback(null, source);
    }
  });
};
