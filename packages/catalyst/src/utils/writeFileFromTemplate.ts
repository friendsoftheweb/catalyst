import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import { template } from 'lodash';
import tryWriteFile from './tryWriteFile';

export default async function writeFileFromTemplate(
  outputPath: string,
  templatePath: string,
  context = {}
): Promise<void> {
  const outputDirname = path.dirname(outputPath);

  if (outputDirname !== '.') {
    mkdirp.sync(outputDirname);
  }

  const fileContent = template(fs.readFileSync(templatePath, 'utf8'))(context);

  return tryWriteFile(outputPath, fileContent);
}
