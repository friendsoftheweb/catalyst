const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

const { getDirectories } = require('../utils');

const CSS_URL_PATTERN = /url\(["']?(\/[^"']+)["']?\)/g;

/*
 * Throws an error if a CSS url directive contains a path that starts with a "/"
 * when it should probably start with a "~".
 */
function checkUrlPathsLoader(content) {
  const { context } = getDirectories();

  let match;

  while ((match = CSS_URL_PATTERN.exec(content)) !== null) {
    const assetPath = match[1];
    const fullAssetPath = path.join(context, assetPath);

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

module.exports = checkUrlPathsLoader;
