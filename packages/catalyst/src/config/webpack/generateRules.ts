import { RuleSetRule } from 'webpack';
import path from 'path';
import { getEnvironment } from '../../utils';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import { Options } from './index';

export default function generateRules({
  projectRoot,
  context,
  publicPath,
  transformModules
}: Options) {
  const environment = getEnvironment();
  const rules: RuleSetRule[] = [];

  rules.push({
    test: /\.s?css$/,
    // @ts-ignore
    use: [
      environment.isDevelopment
        ? {
            loader: 'style-loader'
          }
        : {
            loader: MiniCssExtractPlugin.loader
          },
      {
        loader: 'css-loader',
        options: {
          sourceMap: true
        }
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: true,
          plugins() {
            return [require('autoprefixer')];
          }
        }
      },
      {
        loader: path.resolve(
          __dirname,
          '../../webpack-loaders/checkUrlPathsLoader'
        )
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: true
        }
      }
    ]
  });

  const include = transformModules.map(
    (moduleName) => `${path.join(projectRoot, 'node_modules', moduleName)}/`
  );

  include.push(context);

  rules.push({
    test: /\.(ts|js)x?$/,
    include,
    use: [
      {
        loader: 'thread-loader'
      },
      {
        loader: 'babel-loader',
        options: {
          cacheDirectory: true
        }
      }
    ]
  });

  rules.push(
    generateFileLoaderRule(path.join(context, 'assets'), publicPath),
    generateFileLoaderRule(path.join(projectRoot, 'node_modules'))
  );

  return rules;
}

function generateFileLoaderRule(
  basePath: string,
  publicPath?: string
): RuleSetRule {
  const environment = getEnvironment();
  const name = environment.isProduction
    ? '[path][name]-[hash].[ext]'
    : '[path][name].[ext]';

  if (environment.isDevelopment) {
    publicPath = `http://${environment.devServerHost}:${
      environment.devServerPort
    }/`;
  }

  return {
    test: /\.(jpe?g|gif|png|svg|woff2?|eot|ttf)$/,
    include: basePath,
    use: [
      {
        loader: 'file-loader',
        options: {
          context: basePath,
          name,
          publicPath
        }
      }
    ]
  };
}
