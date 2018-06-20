const path = require('path');
const { getEnvironment, resolveModulePath } = require('../../utils');
const MiniCssExtractPlugin = require(resolveModulePath(
  'mini-css-extract-plugin'
));

function generateRules({ projectRoot, context, publicPath, transformModules }) {
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

  const include = transformModules.map(
    moduleName => `${path.join(projectRoot, 'node_modules', moduleName)}/`
  );

  include.push(context);

  rules.push({
    test: /\.js$/,
    include,
    use: [
      {
        loader: resolveModulePath('thread-loader')
      },
      {
        loader: resolveModulePath('babel-loader'),
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
