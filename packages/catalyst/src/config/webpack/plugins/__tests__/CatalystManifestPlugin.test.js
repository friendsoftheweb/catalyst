import path from 'path';
import webpack from 'webpack';
import { createFsFromVolume, Volume } from 'memfs';
import CatalystManifestPlugin from '../CatalystManifestPlugin';

const compileFixture = (volume, name) => {
  const compiler = webpack({
    mode: 'production',
    context: __dirname,
    entry: { application: `./fixtures/${name}/index.js` },
    output: {
      path: path.resolve(__dirname),
      filename: '[name].[contenthash:8].js',
    },
    module: {
      rules: [
        {
          test: /\.(jpe?g|gif|png|webp|svg)$/i,
          loader: 'file-loader',
          options: {
            name: '[path][name]-[hash].[ext]',
          },
        },
      ],
    },
    plugins: [new CatalystManifestPlugin()],
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
  const stats = await compileFixture(volume, 'one');

  expect(stats.assets).toHaveLength(5);

  const manifest = JSON.parse(
    volume.readFileSync(path.join(__dirname, 'catalyst.json')).toString()
  );

  expect(manifest).toEqual({
    preload: {
      application: ['fixtures/one/assets/this-is-fine-2.jpeg'],
    },
    prefetch: {
      application: ['fixtures/one/assets/this-is-fine.jpeg', '136.0c6b1af5.js'],
    },
  });
});
