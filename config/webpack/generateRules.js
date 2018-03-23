const path = require('path');
const { getEnvironment, resolveModulePath } = require('../../utils');
const MiniCssExtractPlugin = require(resolveModulePath(
  'mini-css-extract-plugin'
));

const babelConfig = require('../../config/babel');

function generateRules({ projectRoot, context, publicPath }) {
  const environment = getEnvironment();
  const rules = [];

  rules.push({
    test: /\.s?css$/,
    use: [
      environment.development
        ? {
            loader: resolveModulePath('style-loader')
          }
        : {
            loader: MiniCssExtractPlugin.loader
          },
      {
        loader: resolveModulePath('css-loader'),
        options: {
          root: context,
          sourceMap: true
        }
      },
      {
        loader: resolveModulePath('postcss-loader'),
        options: {
          sourceMap: true,
          plugins() {
            return [require(resolveModulePath('autoprefixer'))];
          }
        }
      },
      {
        loader: resolveModulePath('sass-loader'),
        options: {
          sourceMap: true
        }
      }
    ]
  });

  rules.push({
    test: /\.js$/,
    include: context,
    use: [
      {
        loader: resolveModulePath('babel-loader'),
        options: Object.assign(
          {
            cacheDirectory: true
          },
          babelConfig(false)
        )
      }
    ]
  });

  rules.push(
    generateFileLoaderRule(path.join(context, 'assets'), publicPath),
    generateFileLoaderRule(path.join(projectRoot, 'node_modules'))
  );

  return rules;
}

function generateFileLoaderRule(basePath, publicPath) {
  const environment = getEnvironment();
  const name = environment.production
    ? '[path][name]-[hash].[ext]'
    : '[path][name].[ext]';

  if (environment.development) {
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

module.exports = generateRules;
