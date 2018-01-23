const path = require('path');
const environment = require('../../utils/environment');
const resolveModulePath = require('../../utils/resolve-module-path');
const ExtractTextPlugin = require(resolveModulePath(
  'extract-text-webpack-plugin'
));
const babelConfig = require('../../config/babel');

function generateRules({ projectRoot, context, publicPath }) {
  const env = environment();
  const rules = [];

  const scssRules = [
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
        plugins: function() {
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
  ];

  if (env.development) {
    rules.push({
      test: /\.s?css$/,
      use: [resolveModulePath('style-loader'), ...scssRules]
    });
  } else {
    rules.push({
      test: /\.s?css$/,
      use: ExtractTextPlugin.extract({
        use: scssRules
      })
    });
  }

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
      },
      {
        loader: path.resolve(__dirname, './loaders/component-styles-loader.js')
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
  const env = environment();
  const name = env.development
    ? '[path][name].[ext]'
    : '[path][name]-[hash].[ext]';

  if (env.development) {
    publicPath = `http://${env.devServerHost}:${env.devServerPort}/`;
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
