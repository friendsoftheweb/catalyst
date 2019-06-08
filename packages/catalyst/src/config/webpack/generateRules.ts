import path from 'path';
import { RuleSetRule } from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import Configuration from '../../Configuration';

const {
  environment,
  rootPath,
  contextPath,
  publicPath,
  transformedModules
} = new Configuration();

export default function generateRules() {
  const rules: RuleSetRule[] = [];

  rules.push({
    test: /\.s?css$/,
    // @ts-ignore
    use: [
      environment === 'development'
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

  const include = transformedModules.map(
    (moduleName) => `${path.join(rootPath, 'node_modules', moduleName)}/`
  );

  include.push(contextPath);

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
    generateFileLoaderRule(path.join(contextPath, 'assets')),
    generateFileLoaderRule(path.join(rootPath, 'node_modules'))
  );

  return rules;
}

function generateFileLoaderRule(basePath: string): RuleSetRule {
  const name =
    environment === 'production'
      ? '[path][name]-[hash].[ext]'
      : '[path][name].[ext]';

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
