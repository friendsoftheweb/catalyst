import { Output } from 'webpack';
import Configuration from '../../Configuration';
import { Environment } from '../../Environment';

export default function generateOutput(): Output {
  const {
    projectName,
    environment,
    buildPath,
    publicPath,
    devServerHost,
    devServerPort,
  } = new Configuration();

  // This allows multiple projects built with webpack to coexist in the same
  // realm.
  const jsonpFunction = `webpackJsonp${projectName.replace(/[^a-z]+/gi, '_')}`;

  if (environment === Environment.Development) {
    return {
      path: buildPath,
      publicPath: `http://${devServerHost}:${devServerPort}/`,
    };
  }

  if (environment === Environment.Test) {
    return {
      path: buildPath,
      publicPath,
      filename: '[name].js',
      jsonpFunction,
    };
  }

  return {
    path: buildPath,
    publicPath,
    filename: '[name].[contenthash:8].js',
    jsonpFunction,
  };
}
