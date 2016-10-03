var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var _ = require('lodash');

var logAction = require('../utils/log-action');

var templateFromFile = function(filePath) {
  var absoluteFilePath = path.resolve(__dirname, '../templates/' + filePath);
  
  return _.template(fs.readFileSync(absoluteFilePath, 'utf8'));
};

var writeFileFromTemplate = function(outputPath, templatePath, context) {
  context || (context = {});

  var outputDirname = path.dirname(outputPath);

  if (outputDirname !== '.') {
    mkdirp.sync(outputDirname);
  }

  fs.writeFileSync(outputPath, templateFromFile(templatePath)(context));

  logAction('create', outputPath);
};

module.exports = writeFileFromTemplate;
