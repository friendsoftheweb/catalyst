const fs = require('fs');
const path = require('path');

const { getDirectories } = require('../../utils');
const generateEntry = require('./generateEntry');

function generateEntryForBundleName(bundleName) {
  const directories = getDirectories();
  const bundlePath = path.join(directories.bundles, bundleName);

  const indexJSPath = path.join(bundlePath, 'index.js');

  if (fs.existsSync(indexJSPath)) {
    return generateEntry(indexJSPath);
  }

  const indexTSPath = path.join(bundlePath, 'index.ts');

  if (fs.existsSync(indexTSPath)) {
    return generateEntry(indexTSPath);
  }

  throw new Error(
    `The bundle directory "${bundleName}" must contain an "index.js" or "index.ts" file.`
  );
}

module.exports = generateEntryForBundleName;
