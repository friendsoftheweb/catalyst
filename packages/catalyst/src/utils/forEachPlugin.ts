import fs from 'fs';
import path from 'path';
import Configuration from '../Configuration';
import Plugin from '../Plugin';

export default function forEachPlugin(
  predicate: (plugin: Plugin) => void
): void {
  const { plugins } = new Configuration();

  for (const plugin of plugins) {
    const pluginPath = path.resolve(process.cwd(), `node_modules/${plugin}`);

    if (!fs.existsSync(pluginPath)) {
      throw new Error(
        `Failed to load plugin: ${plugin}.\nTry running \`yarn install "${plugin}"\`.`
      );
    }

    predicate(require(pluginPath).default);
  }
}
