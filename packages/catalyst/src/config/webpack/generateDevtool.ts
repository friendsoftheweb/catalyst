import { Configuration as WebpackConfiguration } from 'webpack';
import Configuration from '../../Configuration';
import { Environment } from '../../Environment';

export default function generateDevtool(): WebpackConfiguration['devtool'] {
  const { environment } = new Configuration();

  if (environment === Environment.Production) {
    return 'source-map';
  }

  return 'cheap-module-source-map';
}
