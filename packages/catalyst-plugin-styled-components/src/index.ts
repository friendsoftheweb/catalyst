import { Plugin } from 'catalyst';

const plugin: Plugin = {
  modifyBabelPlugins(plugins) {
    return [...plugins, require.resolve('babel-plugin-styled-components')];
  },

  modifyNodePackages(packages) {
    return [...packages, 'styled-components'];
  },

  modifyNodePackagesDev(packages) {
    return [...packages, '@types/styled-components'];
  }
};

export default plugin;
