import { Configuration as WebpackConfiguration } from 'webpack';
import Configuration, { Environment } from '../../Configuration';

export default function generateDevtool(): WebpackConfiguration['devtool'] {
  const { environment } = new Configuration();

  if (environment === Environment.Production) {
    return 'source-map';
  }

  return 'cheap-module-source-map';
}
