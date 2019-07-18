import path from 'path';
import { RuleSetRule } from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import autoprefixer from 'autoprefixer';
import Configuration from '../../Configuration';

export default function generateRules() {
  const {
    environment,
    rootPath,
    contextPath,
    transformedPackages
  } = new Configuration();

  const rules: RuleSetRule[] = [];

  rules.push({
    test: /\.s?css$/,
    // @ts-ignore
    use: [
      environment === 'development'
        ? {
            loader: require.resolve('style-loader')
          }
        : {
            loader: MiniCssExtractPlugin.loader
          },
      {
        loader: require.resolve('css-loader'),
        options: {
          sourceMap: true
        }
      },
      {
        loader: require.resolve('postcss-loader'),
        options: {
          sourceMap: true,
          plugins() {
            return [autoprefixer({ grid: 'no-autoplace' })];
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
        loader: require.resolve('sass-loader'),
        options: {
          sourceMap: true
        }
      }
    ]
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
        loader: require.resolve('thread-loader')
      },
      {
        loader: require.resolve('babel-loader'),
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
  const { environment, publicPath } = new Configuration();

  const name =
    environment === 'production'
      ? '[path][name]-[hash].[ext]'
      : '[path][name].[ext]';

  return {
    test: /\.(jpe?g|gif|png|svg|woff2?|eot|ttf)$/,
    include: basePath,
    use: [
      {
        loader: require.resolve('file-loader'),
        options: {
          context: basePath,
          name,
          publicPath
        }
      }
    ]
  };
}
