import fs from 'fs';
import path from 'path';
import Configuration from '../../Configuration';

const { bundlesPath } = new Configuration();

export default function bundlePaths(): string[] {
  return fs
    .readdirSync(bundlesPath)
    .map((bundlePath) => path.join(bundlesPath, bundlePath))
    .filter((bundlePath) => fs.statSync(bundlePath).isDirectory());
}
