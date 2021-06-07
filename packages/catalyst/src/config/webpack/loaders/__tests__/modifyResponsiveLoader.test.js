import path from 'path';
import webpack from 'webpack';
import { createFsFromVolume, Volume } from 'memfs';

const compileFixture = (volume, context) => {
  const compiler = webpack({
    mode: 'production',
    devtool: false,
    context,
    optimization: {
      minimize: false,
    },
    entry: { application: `./index.js` },
    output: {
      path: path.resolve(__dirname),
      publicPath: '/assets/',
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.jpeg$/i,
          use: [
            {
              loader: require.resolve('../modifyResponsiveLoader'),
            },
            {
              loader: require.resolve('responsive-loader'),
              options: {
                name: '[name]-[width].[ext]',
                adapter: require('responsive-loader/sharp'),
              },
            },
          ],
        },
      ],
    },
  });

  compiler.outputFileSystem = createFsFromVolume(volume);
  compiler.outputFileSystem.join = path.join.bind(path);

  return new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) reject(error);
      if (stats.hasErrors()) reject(stats.toJson().errors);

      resolve(stats.toJson());
    });
  });
};

test('removes "images" and "toString" keys from responsive-loader output', async () => {
  const volume = new Volume();

  await compileFixture(volume, path.resolve(__dirname, './fixtures/images'));

  const source = volume
    .readFileSync(path.join(__dirname, 'application.js'))
    .toString();

  expect(source).toContain(`module.exports = {
  srcSet: __webpack_require__.p + "this-is-fine-300.jpeg" + " 300w",
  src: __webpack_require__.p + "this-is-fine-300.jpeg",
  width: 300,
  height: 168
};`);
});
