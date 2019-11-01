import fs from 'fs';
import { diffJson, diffLines, Change } from 'diff';

export default async function diffExistingFile(
  filePath: string,
  fileContent: string
): Promise<Change[]> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (error, data) => {
      if (error != null) {
        reject(error);
      } else {
        if (/\.json$/.test(filePath)) {
          resolve(diffJson(data.toString(), fileContent));
        } else {
          resolve(diffLines(data.toString(), fileContent));
        }
      }
    });
  });
}
