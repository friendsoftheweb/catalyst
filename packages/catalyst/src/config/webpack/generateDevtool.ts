import { Configuration as WebpackConfiguration } from 'webpack';
import Configuration from '../../Configuration';
import { Environment } from '../../Environment';

export default function generateDevtool(
  configuration: Configuration
): WebpackConfiguration['devtool'] {
  if (configuration.environment === Environment.Production) {
    return 'source-map';
  }

  return 'cheap-module-source-map';
}
