import babelConfig from './config/babel';

export default function babelPreset(_api: any, options = {}) {
  return babelConfig(options);
}
