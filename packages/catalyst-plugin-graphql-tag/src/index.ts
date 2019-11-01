import { Plugin } from 'catalyst';

const plugin: Plugin = {
  modifyBabelPlugins(plugins) {
    return [...plugins, require.resolve('babel-plugin-graphql-tag')];
  },

  modifyNodePackages(packages) {
    return [...packages, 'graphql', 'graphql-tag'];
  },

  modifyNodePackagesDev(packages) {
    return [...packages, '@types/graphql'];
  }
};

export default plugin;
