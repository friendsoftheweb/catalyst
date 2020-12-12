import { Plugin } from 'catalyst';

const plugin: Plugin = {
  modifyWebpackRules(rules) {
    return [
      ...rules,
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: require.resolve('graphql-tag/loader'),
      },
    ];
  },

  modifyBabelPlugins(plugins) {
    return [...plugins, require.resolve('babel-plugin-graphql-tag')];
  },

  modifyNodePackages(packages) {
    return [...packages, 'graphql', 'graphql-tag'];
  },

  modifyNodePackagesDev(packages) {
    return [...packages, '@types/graphql'];
  },
};

export default plugin;
