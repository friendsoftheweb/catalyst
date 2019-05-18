import fs from 'fs';
import path from 'path';
import { getDirectories } from '../../utils';
import generateEntry from './generateEntry';

export default function generateEntryForBundleName(bundleName: string) {
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
