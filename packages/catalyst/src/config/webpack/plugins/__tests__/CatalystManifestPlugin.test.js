import path from 'path';
import webpack from 'webpack';
import { createFsFromVolume, Volume } from 'memfs';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CatalystManifestPlugin from '../CatalystManifestPlugin';

const compileFixture = (volume, name) => {
  const compiler = webpack({
    mode: 'production',
    context: path.join(__dirname, 'fixtures', name),
    entry: { application: `./index.js` },
    output: {
      path: path.resolve(__dirname),
      publicPath: '/public/',
      filename: '[name].[contenthash:8].js',
    },
    module: {
      rules: [
        {
          test: /\.(jpe?g|gif|png|webp|svg|woff2?)$/i,
          loader: 'file-loader',
          options: {
            name: '[path][name]-[hash].[ext]',
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
      new CatalystManifestPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash:8].css',
      }),
    ],
  });

  compiler.outputFileSystem = createFsFromVolume(volume);
  compiler.outputFileSystem.join = path.join.bind(path);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);
      if (stats.hasErrors()) reject(stats.toJson().errors);

      resolve(stats.toJson());
    });
  });
};

test('catalyst.json contains all assets referenced by chunks that include @catalyst-prefetch comments', async () => {
  const volume = new Volume();
  await compileFixture(volume, 'one');

  const catalystManifest = JSON.parse(
    volume
      .readFileSync(path.join(__dirname, 'catalyst.manifest.json'))
      .toString()
  );

  expect(catalystManifest).toEqual({
    assets: {
      'application.js': '/public/application.160f4a10.js',
      'application.css': '/public/application.dc1eaf81.css',
      '609.e4489107.js': '/public/609.e4489107.js',
      '609.8c5b220b.css': '/public/609.8c5b220b.css',
      'assets/AdobeBlank.woff':
        '/public/assets/AdobeBlank-c8335fa27107c7db9bab5894e12b2984.woff',
      'assets/this-is-fine.jpeg':
        '/public/assets/this-is-fine-c09300d2dc0256f7a52cf6abb616c720.jpeg',
    },
    preload: {
      application: ['assets/AdobeBlank.woff'],
    },
    prefetch: {
      application: [
        'assets/this-is-fine.jpeg',
        '609.e4489107.js',
        '609.8c5b220b.css',
      ],
    },
  });
});
