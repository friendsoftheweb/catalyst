import { Plugin } from 'catalyst';

const plugin: Plugin = {
  modifyBabelPlugins(plugins) {
    return [...plugins, require.resolve('babel-plugin-styled-components')];
  }
};

export default plugin;
