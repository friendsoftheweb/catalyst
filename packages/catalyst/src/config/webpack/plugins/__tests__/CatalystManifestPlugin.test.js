import path from 'path';
import webpack from 'webpack';
import { createFsFromVolume, Volume } from 'memfs';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CatalystManifestPlugin from '../CatalystManifestPlugin';

const compileFixture = (volume, context) => {
  const compiler = webpack({
    mode: 'production',
    context,
    entry: { application: `./index.js` },
    output: {
      path: path.resolve(__dirname),
      publicPath: '/assets/',
      filename: '[name].[contenthash:8].js',
    },
    module: {
      rules: [
        {
          test: /\.(jpe?g|gif|png|webp|svg|woff2?)$/i,
          loader: 'file-loader',
          options: {
            name: '[path][name]-[hash].[ext]',
            context: path.join(context, 'assets'),
            publicPath: '/assets/',
          },
        },
        {
          test: /\.css$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader',
            },
          ],
        },
      ],
    },
    plugins: [
      new CatalystManifestPlugin({ maxPrefetchAssetSize: 512 * 1024 }),
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash:8].css',
      }),
    ],
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

test('catalyst.json contains all assets referenced by chunks that include @catalyst-prefetch comments', async () => {
  const volume = new Volume();
  await compileFixture(volume, path.resolve(__dirname, './fixtures/manifest'));

  const manifest = JSON.parse(
    volume
      .readFileSync(path.join(__dirname, 'catalyst.manifest.json'))
      .toString()
  );

  expect(Object.keys(manifest.assets)).toHaveLength(7);

  expect(Object.keys(manifest.assets)).toContain(
    'application.js',
    'application.css',
    'fonts/AdobeBlank.woff',
    'images/this-is-fine.jpeg'
  );

  expect(manifest.preload.application).toContain('fonts/AdobeBlank.woff');

  expect(manifest.prefetch.application).toHaveLength(3);
});
