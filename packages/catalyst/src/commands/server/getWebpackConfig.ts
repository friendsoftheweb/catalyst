import path from 'path';

import { getDirectories } from '../../utils';

export default function getWebpackConfig() {
  const directories = getDirectories();

  return require(path.join(directories.context, 'config/webpack.js'));
}
