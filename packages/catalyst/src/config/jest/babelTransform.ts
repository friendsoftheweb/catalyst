import { createTransformer } from 'babel-jest';
import Configuration from '../../Configuration';

const configuration = new Configuration();

const presets: Array<string | [string, object]> = [
  [require.resolve('@babel/preset-env'), { targets: { node: 'current' } }]
];

const plugins: Array<string | [string, object]> = [];

if (configuration.typeScriptEnabled) {
  presets.push(require.resolve('@babel/preset-typescript'));
}

if (configuration.flowEnabled) {
  plugins.push(require.resolve('@babel/plugin-transform-flow-strip-types'));
}

module.exports = createTransformer({
  presets,
  plugins,
  babelrc: false,
  configFile: false
});
