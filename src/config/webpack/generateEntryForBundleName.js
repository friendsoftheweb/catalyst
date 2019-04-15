const fs = require('fs');
const path = require('path');

const { getDirectories } = require('../../utils');
const generateEntry = require('./generateEntry');

function generateEntryForBundleName(bundleName) {
  const directories = getDirectories();
  const bundlePath = path.join(directories.bundles, bundleName);

  for (const extension of ['js', 'ts', 'tsx']) {
    const indexPath = path.join(bundlePath, `index.${extension}`);

    if (fs.existsSync(indexPath)) {
      return generateEntry(indexPath);
    }
  }

  throw new Error(
    `The bundle directory "${bundleName}" must contain an "index.js", "index.ts", or "index.tsx" file.`
  );
}

module.exports = generateEntryForBundleName;
