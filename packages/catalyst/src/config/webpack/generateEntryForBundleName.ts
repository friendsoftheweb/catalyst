import fs from 'fs';
import path from 'path';
import Configuration from '../../Configuration';
import generateEntry from './generateEntry';

const { bundlesPath } = new Configuration();

export default function generateEntryForBundleName(bundleName: string) {
  const bundlePath = path.join(bundlesPath, bundleName);

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
