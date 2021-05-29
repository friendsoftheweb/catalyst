import path from 'path';
import { RuleSetRule } from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import Configuration from '../../Configuration';
import { Environment } from '../../Environment';
import forEachPlugin from '../../utils/forEachPlugin';

export default function generateRules(
  configuration: Configuration
): RuleSetRule[] {
  const {
    environment,
    rootPath,
    contextPath,
    transformedPackages,
  } = configuration;

  let rules: RuleSetRule[] = [];

  rules.push({
    test: /\.s?css$/,
    use: [
      environment === Environment.Development
        ? {
            loader: require.resolve('style-loader'),
          }
        : {
            loader: MiniCssExtractPlugin.loader,
          },
      {
        loader: require.resolve('css-loader'),
        options: {
          sourceMap: true,
        },
      },
      {
        loader: require.resolve('postcss-loader'),
        options: {
          sourceMap: true,
          postcssOptions: {
            plugins: [
              [
                'postcss-preset-env',
                {
                  autoprefixer: {
                    grid: 'no-autoplace',
                  },
                },
              ],
            ],
          },
        },
      },
      {
        loader: path.resolve(__dirname, './loaders/checkUrlPathsLoader'),
      },
      {
        loader: require.resolve('sass-loader'),
        options: {
          sourceMap: true,
          implementation: require('sass'),
          sassOptions: {
            fiber: require('fibers'),
          },
        },
      },
    ],
  });

  const include = transformedPackages.map(
    (packageName) => `${path.join(rootPath, 'node_modules', packageName)}/`
  );

  include.push(contextPath);

  rules.push({
    test: /\.(js|jsx|ts|tsx|mjs)$/,
    include,
    use: [
      {
        loader: require.resolve('babel-loader'),
        options: {
          cacheDirectory: true,
        },
      },
    ],
  });

  rules.push(
    ...generateFileLoaderRules(configuration, contextPath),
    ...generateFileLoaderRules(
      configuration,
      path.join(rootPath, 'node_modules')
    )
  );

  forEachPlugin(configuration, (plugin) => {
    if (plugin.modifyWebpackRules != null) {
      rules = plugin.modifyWebpackRules(rules, configuration);
    }
  });

  return rules;
}

function generateFileLoaderRules(
  configuration: Configuration,
  basePath: string
): RuleSetRule[] {
  const { environment, publicPath, importAssetsAsESModules } = configuration;

  const options = {
    // context: basePath,
    publicPath,
    esModule: importAssetsAsESModules,
  };

  return [
    {
      test: /\.(jpe?g|png|webp)$/i,
      include: basePath,
      use: {
        loader: require.resolve('responsive-loader'),
        options: {
          ...options,
          name:
            environment === Environment.Production
              ? '[path][name]-[hash]-[width].[ext]'
              : '[path][name]-[width].[ext]',
          adapter: require('responsive-loader/sharp'),
          disable: environment === Environment.Test,
        },
      },
    },
    {
      test: /\.(gif|svg|woff2?|eot|ttf)$/i,
      include: basePath,
      use: [
        {
          loader: require.resolve('file-loader'),
          options: {
            ...options,
            name:
              environment === Environment.Production
                ? '[path][name]-[hash].[ext]'
                : '[path][name].[ext]',
          },
        },
      ],
    },
  ];
}
