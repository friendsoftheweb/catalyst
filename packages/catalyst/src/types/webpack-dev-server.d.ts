// This can be deleted after the types for this package are updated for webpack 5

declare module 'webpack-dev-server' {
  import { Configuration as WebpackConfiguration, Compiler } from 'webpack';
  import { Application } from 'express';

  export interface Configuration {
    host?: string;
    port?: number;
    hot?: boolean;
    headers?: Record<string, string>;
    https?: {
      key: Buffer;
      cert: Buffer;
      ca: Buffer;
    };
    client?: {
      logging?: 'none' | 'error' | 'warn' | 'info' | 'log' | 'verbose';
      overlay?: boolean | { errors?: boolean; warnings?: boolean };
    };
    onBeforeSetupMiddleware?(args: { app: Application }): void;
    onAfterSetupMiddleware?(args: { app: Application }): void;
  }

  export default class WebpackDevServer {
    static addDevServerEntrypoints(
      webpackConfig: WebpackConfiguration,
      devServerConfig: Configuration
    ): unknown;

    constructor(compiler: Compiler, configuration: Configuration);

    listen(
      port: number,
      host: string,
      callback: (error: Error | null) => void
    ): unknown;

    close(): unknown;
  }
}
