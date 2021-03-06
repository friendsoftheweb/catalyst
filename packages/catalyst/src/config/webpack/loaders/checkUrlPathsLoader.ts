import path from 'path';
import fs from 'fs';
import util from 'util';
import Configuration from '../../../Configuration';

const asyncExists = util.promisify(fs.exists);

const CSS_URL_PATTERN = /url\(["']?(\/[^"']+)["']?\)/g;

/**
 * Throws an error if a CSS url directive contains a path that starts with a "/"
 * when it should probably start with a "~".
 */
export default function checkUrlPathsLoader(
  this: {
    async(): (error: Error | null, content?: string) => void;
  },
  content: string
): void {
  const callback = this.async();

  const { rootPath } = Configuration.fromFile();

  const promises = [];

  let match;

  while ((match = CSS_URL_PATTERN.exec(content)) !== null) {
    const assetPath = match[1];
    const fullAssetPath = path.join(rootPath, assetPath);

    promises.push(
      asyncExists(fullAssetPath).then((exists) => ({ assetPath, exists }))
    );
  }

  Promise.all(promises)
    .then((values) => {
      for (const { exists, assetPath } of values) {
        if (exists) continue;

        callback(
          new Error(
            `\n\nA CSS url directive contains a path that will not resolve to a file inside the project: \n\nurl('${assetPath}')` +
              `\n\nIf you want to reference a file relative to the root of the project, the path should start with a tilde: \n\nurl('~${assetPath.substr(
                1
              )}')\n`
          )
        );

        return;
      }

      callback(null, content);
    })
    .catch(callback);
}
