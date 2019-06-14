import { Configuration as WebpackConfiguration } from 'webpack';
import Configuration from '../../Configuration';

export default function generateDevtool(): WebpackConfiguration['devtool'] {
  const { environment } = new Configuration();

  if (environment === 'production') {
    return 'source-map';
  }

  return 'cheap-module-source-map';
}
