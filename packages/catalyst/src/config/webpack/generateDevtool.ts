import { Configuration as WebpackConfiguration } from 'webpack';
import Configuration from '../../Configuration';

const { environment } = new Configuration();

export default function generateDevtool(): WebpackConfiguration['devtool'] {
  if (environment === 'production') {
    return 'source-map';
  }

  return 'cheap-module-source-map';
}
