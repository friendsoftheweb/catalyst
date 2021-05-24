import path from 'path';
import type { Configuration as WebpackConfiguration } from 'webpack';
import {
  Plugin,
  Configuration as CatalystConfiguration,
  webpackGenerateRules,
} from 'catalyst';

const plugin: Plugin = {
  modifyNodePackagesDev(packages) {
    return [
      ...packages,
      '@storybook/react',
      '@storybook/addon-links',
      '@storybook/addon-essentials',
    ];
  },

  async afterInit({ writeFileFromTemplate }) {
    await writeFileFromTemplate(
      '.storybook/main.js',
      path.resolve(__dirname, './templates/storybook/main.js.jst')
    );

    await writeFileFromTemplate(
      '.storybook/preview.js',
      path.resolve(__dirname, './templates/storybook/preview.js.jst')
    );
  },
};

export const modifyStorybookWebpackConfig = (
  storybookWebpackConfig: WebpackConfiguration
): WebpackConfiguration => {
  const configuration = CatalystConfiguration.fromFile();

  return {
    ...storybookWebpackConfig,
    context: configuration.contextPath,
    resolve: {
      ...storybookWebpackConfig.resolve,
      modules: [
        ...(storybookWebpackConfig.resolve?.modules ?? []),
        configuration.contextPath,
      ],
    },
    module: {
      ...storybookWebpackConfig.module,
      rules: webpackGenerateRules(configuration, { publicPath: '' }),
    },
  };
};

export default plugin;
