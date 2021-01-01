import fs from 'fs';
import path from 'path';
import { Entry } from 'webpack';
import Configuration from '../../Configuration';
import generateEntry from './generateEntry';

export default function generateEntryForBundleName(
  configuration: Configuration,
  bundleName: string
): Entry {
  const { bundlesPath } = configuration;

  const bundlePath = path.join(bundlesPath, bundleName);

  for (const extension of ['js', 'ts', 'tsx']) {
    const indexPath = path.join(bundlePath, `index.${extension}`);

    if (fs.existsSync(indexPath)) {
      return generateEntry(configuration, indexPath);
    }
  }

  throw new Error(
    `The bundle directory "${bundleName}" must contain an "index.js", "index.ts", or "index.tsx" file.`
  );
}
