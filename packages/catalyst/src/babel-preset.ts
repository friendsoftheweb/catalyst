import babelConfig from './config/babel';

export default function babelPreset(api: any, options = {}) {
  api.cache.using(() => process.env.NODE_ENV);

  return babelConfig(options);
}
