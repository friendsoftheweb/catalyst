const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const { template } = require('lodash');

const { logAction } = require('../utils/logging');

function templateFromFile(filePath) {
  const absoluteFilePath = path.resolve(__dirname, `../templates/${filePath}`);

  return template(fs.readFileSync(absoluteFilePath, 'utf8'));
};

function writeFileFromTemplate(outputPath, templatePath, context = {}) {
  const outputDirname = path.dirname(outputPath);

  if (outputDirname !== '.') {
    mkdirp.sync(outputDirname);
  }

  fs.writeFileSync(outputPath, templateFromFile(templatePath)(context));

  logAction('create', outputPath);
};

module.exports = writeFileFromTemplate;
