import path from 'path';
import getConfig from './getConfig';

export default function getDirectories() {
  const config = getConfig();
  const project = process.cwd();

  if (typeof config.rootPath !== 'string') {
    throw new Error('Invalid "rootPath" configuration.');
  }

  if (typeof config.buildPath !== 'string') {
    throw new Error('Invalid "buildPath" configuration.');
  }

  return {
    project,
    context: path.join(project, config.rootPath),
    build: path.join(project, config.buildPath),
    bundles: path.join(project, config.rootPath, 'bundles'),
    temp: path.join(project, 'tmp', 'catalyst')
  };
}
