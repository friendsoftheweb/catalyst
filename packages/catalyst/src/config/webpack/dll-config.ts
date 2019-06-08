import path from 'path';
import webpack from 'webpack';
import Configuration from '../../Configuration';

const {
  rootPath,
  contextPath,
  tempPath,
  prebuiltModules
} = new Configuration();

const projectDependencies = Object.keys(
  require(path.join(rootPath, 'package.json')).dependencies || {}
);

export default {
  context: contextPath,
  mode: 'development',

  resolve: {
    modules: ['node_modules']
  },

  entry: {
    vendor: prebuiltModules.filter((prebuiltModule) =>
      projectDependencies.includes(prebuiltModule)
    )
  },

  plugins: [
    new webpack.DllPlugin({
      name: '[name]',
      path: path.join(tempPath, '[name].json')
    })
  ],

  output: {
    filename: '[name]-dll.js',
    path: tempPath,
    library: '[name]'
  }
};
