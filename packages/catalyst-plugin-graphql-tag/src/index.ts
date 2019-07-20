import { Plugin } from 'catalyst';

const plugin: Plugin = {
  modifyBabelPlugins(plugins) {
    return [...plugins, require.resolve('babel-plugin-graphql-tag')];
  }
};

export default plugin;
