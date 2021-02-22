export { default as babelConfig } from './config/babel';
export { default as webpackConfig } from './config/webpack';
export { default as Plugin } from './Plugin';

import { CatalystClient } from 'catalyst-client/lib/types';

declare global {
  interface Window {
    __CATALYST__?: CatalystClient;
  }
}
