declare module 'mini-css-extract-plugin';

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
declare module 'case-sensitive-paths-webpack-plugin';
declare module 'circular-dependency-plugin';
declare module 'loader-utils';
declare module 'webpack-bundle-analyzer';
declare module 'css-minimizer-webpack-plugin';

declare module 'webpack-dev-server' {
  import { Configuration as WebpackConfiguration } from 'webpack';

  export interface Configuration {
    https?: boolean;

    before?(app: {
      get(
        path: string,
        callback: (request: any, response: any) => Promise<void> | void
      ): void;
    }): void;

    after?(app: {
      get(
        path: string,
        callback: (request: any, response: any) => Promise<void> | void
      ): void;
    }): void;
  }

  export default class WebpackDevServer {
    static addDevServerEntrypoints(
      config: WebpackConfiguration,
      config2: Configuration
    ): any;

    constructor(compiler: any, configuration: Configuration);

    listen(
      port: number,
      host: string,
      callback: (error: Error | null) => void
    ): void;

    close(): void;
  }
}

declare module 'workbox-webpack-plugin';
declare module 'compression-webpack-plugin';
declare module 'webpack-manifest-plugin';
declare module 'webpack-sources';
