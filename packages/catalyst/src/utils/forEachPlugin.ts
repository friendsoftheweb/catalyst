import fs from 'fs';
import path from 'path';
import Configuration from '../Configuration';
import Plugin from '../Plugin';

export default async function forEachPlugin(
  configuration: Configuration,
  callbackFn: (plugin: Plugin) => void | Promise<void>
): Promise<void> {
  const { plugins } = configuration;

  for (const plugin of plugins) {
    const pluginPath = path.resolve(process.cwd(), `node_modules/${plugin}`);

    if (!fs.existsSync(pluginPath)) {
      throw new Error(
        `Failed to load plugin: ${plugin}.\nTry running \`yarn add "${plugin}"\`.`
      );
    }

    await callbackFn(require(pluginPath).default);
  }
}
