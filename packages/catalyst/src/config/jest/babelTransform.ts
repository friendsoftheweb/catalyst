import { createTransformer } from 'babel-jest';
import babelConfig from '../babel';

module.exports = createTransformer({
  // TODO: The core-js version should be configurable from the host project
  ...babelConfig({ targets: { node: 'current' }, corejs: 3 }),
  babelrc: false,
  configFile: false,
});
