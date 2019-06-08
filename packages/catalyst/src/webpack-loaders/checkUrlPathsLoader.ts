import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import Configuration from '../Configuration';

const { rootPath } = new Configuration();

const CSS_URL_PATTERN = /url\(["']?(\/[^"']+)["']?\)/g;

/*
 * Throws an error if a CSS url directive contains a path that starts with a "/"
 * when it should probably start with a "~".
 */
export default function checkUrlPathsLoader(content: string) {
  let match;

  while ((match = CSS_URL_PATTERN.exec(content)) !== null) {
    const assetPath = match[1];
    const fullAssetPath = path.join(rootPath, assetPath);

    if (fs.existsSync(fullAssetPath)) {
      throw new Error(
        chalk.red(
          `\n\nA CSS url directive contains a path that will not resolve to a file inside the project: \n\nurl('${assetPath}')` +
            `\n\nIf you want to reference a file relative to the root of the project, the path should start with a tilde: \n\nurl('~${assetPath.substr(
              1
            )}')\n`
        )
      );
    }
  }

  return content;
}
