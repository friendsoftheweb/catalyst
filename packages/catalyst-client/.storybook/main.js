module.exports = {
  stories: ['../src/**/__stories__/*.tsx'],
  addons: ['@storybook/preset-scss'],
  webpackFinal: async (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      react: require.resolve('preact/compat'),
      'react-dom': require.resolve('preact/compat'),
    };

    return config;
  },
};
