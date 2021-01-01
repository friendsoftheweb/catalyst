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
    test: /\.(ts|js)x?$/,
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
    ...generateFileLoaderRules(configuration, path.join(contextPath, 'assets')),
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

  const name =
    environment === Environment.Production
      ? '[path][name]-[hash].[ext]'
      : '[path][name].[ext]';

  const fileLoaderOptions = {
    context: basePath,
    name,
    publicPath,
    esModule: importAssetsAsESModules,
  };

  return [
    {
      test: /\.(jpe?g|gif|png|webp|svg)$/i,
      include: basePath,
      oneOf: [
        // Use file-loader and imageDimensionsLoader for any images imported
        // into JavaScript files that aren't located inside node_modules.
        {
          issuer: { and: [/\.(jsx?|tsx?)$/, { not: [/node_modules/] }] },
          use: [
            {
              loader: path.resolve(
                __dirname,
                './loaders/imageDimensionsLoader'
              ),
              options: {
                esModule: importAssetsAsESModules,
              },
            },
            {
              loader: require.resolve('file-loader'),
              options: fileLoaderOptions,
            },
          ],
        },
        // Only use file-loader for all other imported images.
        {
          use: [
            {
              loader: require.resolve('file-loader'),
              options: fileLoaderOptions,
            },
          ],
        },
      ],
    },
    {
      test: /\.(woff2?|eot|ttf)$/i,
      include: basePath,
      use: [
        {
          loader: require.resolve('file-loader'),
          options: fileLoaderOptions,
        },
      ],
    },
  ];
}
