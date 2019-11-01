import { Output } from 'webpack';
import Configuration from '../../Configuration';

export default function generateOutput(): Output {
  const {
    projectName,
    environment,
    buildPath,
    publicPath,
    devServerHost,
    devServerPort
  } = new Configuration();

  // This allows multiple projects built with webpack to coexist in the same
  // realm.
  const jsonpFunction = `webpackJsonp${projectName.replace(/[^a-z]+/gi, '_')}`;

  if (environment === 'development') {
    return {
      path: buildPath,
      publicPath: `http://${devServerHost}:${devServerPort}/`
    };
  }

  if (environment === 'test') {
    return {
      path: buildPath,
      publicPath,
      filename: '[name].js',
      jsonpFunction
    };
  }

  return {
    path: buildPath,
    publicPath,
    filename: '[name]-[hash].js',
    jsonpFunction
  };
}
