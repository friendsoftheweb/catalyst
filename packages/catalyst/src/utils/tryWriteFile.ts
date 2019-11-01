import fs from 'fs';
import resolveFileConflict from './resolveFileConflict';
import diffExistingFile from './diffExistingFile';
import logAction from './logAction';

export default async function tryWriteFile(
  filePath: string,
  fileContent: string
) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, fileContent);

    logAction('create', filePath);
  } else {
    const diff = await diffExistingFile(filePath, fileContent);

    const isDifferent = diff.some((part) =>
      Boolean(part.added || part.removed)
    );

    if (isDifferent) {
      const resolution = await resolveFileConflict(filePath, fileContent);

      switch (resolution) {
        case 'overwrite': {
          fs.writeFileSync(filePath, fileContent);
          logAction('overwrite', filePath);
          break;
        }

        case 'skip': {
          logAction('skip', filePath);
          break;
        }
      }
    } else {
      logAction('identical', filePath);
    }
  }
}
