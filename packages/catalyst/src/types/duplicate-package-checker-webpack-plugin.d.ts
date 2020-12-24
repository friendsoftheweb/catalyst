// This can be deleted after the types for this package are updated for webpack 5

declare module 'duplicate-package-checker-webpack-plugin' {
  import { WebpackPluginInstance } from 'webpack';

  export default class DuplicatePackageCheckerPlugin
    implements WebpackPluginInstance {
    constructor(options: {
      verbose?: boolean;
      emitError?: boolean;
      exclude?(instance: { name: string }): boolean;
    });

    apply(): void;
  }
}
