const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const { template } = require('lodash');
const jsdiff = require('diff');
const inquirer = require('inquirer');

require('colors');

const { logAction } = require('./log');

function templateFromFile(filePath) {
  const absoluteFilePath = path.resolve(__dirname, `../templates/${filePath}`);

  return template(fs.readFileSync(absoluteFilePath, 'utf8'));
}

function writeFileFromTemplate(outputPath, templatePath, context = {}) {
  const outputDirname = path.dirname(outputPath);

  if (outputDirname !== '.') {
    mkdirp.sync(outputDirname);
  }

  const fileContent = templateFromFile(templatePath)(context);

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(outputPath)) {
      fs.writeFileSync(outputPath, fileContent);

      logAction('create', outputPath);
      resolve();
    } else {
      const diff = diffExisting(outputPath, fileContent);
      const isDifferent = diff.some(part => part.added || part.removed);

      if (isDifferent) {
        resolveConflict(outputPath, fileContent).then(resolution => {
          switch (resolution) {
            case 'overwrite': {
              fs.writeFileSync(outputPath, fileContent);
              logAction('overwrite', outputPath);
              break;
            }

            case 'skip': {
              logAction('skip', outputPath);
              break;
            }
          }

          resolve();
        }, reject);
      } else {
        logAction('identical', outputPath);
        resolve();
      }
    }
  });
}

function diffExisting(outputPath, fileContent) {
  let diffFunction;

  if (/\.json$/.test(outputPath)) {
    diffFunction = jsdiff.diffJson;
  } else {
    diffFunction = jsdiff.diffLines;
  }

  return diffFunction(
    fs.readFileSync(outputPath, 'utf8').toString(),
    fileContent
  );
}

function resolveConflict(filePath, fileContent) {
  process.stderr.write('\n');

  return new Promise((resolve, reject) => {
    inquirer
      .prompt([
        {
          name: 'resolution',
          message: `File exists: '${filePath}'. Overwrite?`,
          type: 'expand',
          choices: [
            { name: 'Yes, Overwrite', key: 'y', value: 'overwrite' },
            { name: 'No, Skip', key: 'n', value: 'skip' },
            { name: 'Diff', key: 'd', value: 'diff' }
          ],
          default: 1
        }
      ])
      .then(config => {
        if (config.resolution === 'diff') {
          const diff = diffExisting(filePath, fileContent);

          process.stderr.write('\n');

          diff.forEach(part => {
            const color = part.added ? 'green' : part.removed ? 'red' : 'white';
            process.stderr.write(part.value[color]);
          });

          resolveConflict(filePath, fileContent).then(resolve, reject);
        } else {
          resolve(config.resolution);
        }
      }, reject);
  });
}

module.exports = writeFileFromTemplate;
