// Original source:
// https://github.com/facebook/create-react-app/blob/master/packages/react-dev-utils/WatchMissingNodeModulesPlugin.js

import { Compiler, WebpackPluginInstance } from 'webpack';

class WatchMissingNodeModulesPlugin implements WebpackPluginInstance {
  private readonly nodeModulesPath: string;

  constructor(nodeModulesPath: string) {
    this.nodeModulesPath = nodeModulesPath;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.emit.tap('WatchMissingNodeModulesPlugin', (compilation) => {
      const missingDependencies = Array.from(compilation.missingDependencies);
      const { nodeModulesPath } = this;

      // If any missing files are expected to appear in node_modules...
      if (missingDependencies.some((file) => file.includes(nodeModulesPath))) {
        // ...tell webpack to watch node_modules recursively until they appear.
        compilation.contextDependencies.add(nodeModulesPath);
      }
    });
  }
}

export default WatchMissingNodeModulesPlugin;
