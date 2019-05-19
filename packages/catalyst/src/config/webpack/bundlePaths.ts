import fs from 'fs';
import path from 'path';

import { getDirectories } from '../../utils';

export default function bundlePaths(): string[] {
  const directories = getDirectories();

  return fs
    .readdirSync(directories.bundles)
    .map((bundlePath) => path.join(directories.bundles, bundlePath))
    .filter((bundlePath) => fs.statSync(bundlePath).isDirectory());
}
