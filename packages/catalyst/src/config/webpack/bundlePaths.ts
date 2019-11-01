import fs from 'fs';
import path from 'path';
import Configuration from '../../Configuration';

export default function bundlePaths(): string[] {
  const { bundlesPath } = new Configuration();

  return fs
    .readdirSync(bundlesPath)
    .map((bundlePath) => path.join(bundlesPath, bundlePath))
    .filter((bundlePath) => fs.statSync(bundlePath).isDirectory());
}
