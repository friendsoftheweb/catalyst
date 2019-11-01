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

  const absoluteFilePath = path.resolve(
    __dirname,
    `../templates/${templatePath}`
  );

  const fileContent = template(fs.readFileSync(absoluteFilePath, 'utf8'))(
    context
  );

  return tryWriteFile(outputPath, fileContent);
}
