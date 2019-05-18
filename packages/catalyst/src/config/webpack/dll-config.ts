import path from 'path';
import webpack from 'webpack';
import { getConfig, getDirectories } from '../../utils';

const config = getConfig();
const directories = getDirectories();
const projectDependencies = Object.keys(
  require(path.join(directories.project, 'package.json')).dependencies || {}
);

export default {
  context: directories.project,
  mode: 'development',

  resolve: {
    modules: ['node_modules']
  },

  entry: {
    vendor: config.prebuildPackages
      ? config.prebuildPackages.filter(
          (prebuildPackage) => projectDependencies.indexOf(prebuildPackage) > -1
        )
      : []
  },

  plugins: [
    new webpack.DllPlugin({
      name: '[name]',
      path: path.join(directories.project, '/tmp/catalyst/[name].json')
    })
  ],

  output: {
    filename: '[name]-dll.js',
    path: path.join(directories.project, '/tmp/catalyst'),
    library: '[name]'
  }
};
