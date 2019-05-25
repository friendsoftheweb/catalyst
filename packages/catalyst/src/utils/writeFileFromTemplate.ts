import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import { template } from 'lodash';
import { diffJson, diffLines } from 'diff';
import inquirer from 'inquirer';
import chalk from 'chalk';

import logAction from './logAction';

export default function writeFileFromTemplate(
  outputPath: string,
  templatePath: string,
  context = {}
) {
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

      const isDifferent = diff.some((part) =>
        Boolean(part.added || part.removed)
      );

      if (isDifferent) {
        resolveConflict(outputPath, fileContent).then((resolution) => {
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

function templateFromFile(filePath: string) {
  const absoluteFilePath = path.resolve(__dirname, `../templates/${filePath}`);

  return template(fs.readFileSync(absoluteFilePath, 'utf8'));
}

function diffExisting(outputPath: string, fileContent: string) {
  if (/\.json$/.test(outputPath)) {
    return diffJson(
      fs.readFileSync(outputPath, 'utf8').toString(),
      fileContent
    );
  } else {
    return diffLines(
      fs.readFileSync(outputPath, 'utf8').toString(),
      fileContent
    );
  }
}

function resolveConflict(filePath: string, fileContent: string) {
  process.stderr.write('\n');

  return new Promise((resolve, reject) => {
    inquirer
      .prompt<{
        resolution: 'overwrite' | 'skip' | 'diff';
      }>([
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
      .then((config) => {
        if (config.resolution === 'diff') {
          const diff = diffExisting(filePath, fileContent);

          process.stderr.write('\n');

          diff.forEach((part) => {
            let value: string;

            if (part.added) {
              value = chalk.green(part.value);
            } else if (part.removed) {
              value = chalk.red(part.value);
            } else {
              value = chalk.white(part.value);
            }

            process.stderr.write(value);
          });

          resolveConflict(filePath, fileContent).then(resolve, reject);
        } else {
          resolve(config.resolution);
        }
      }, reject);
  });
}
