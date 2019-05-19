import { getEnvironment } from '../../utils';

export default function generateDevtool() {
  const environment = getEnvironment();

  if (environment.isProduction) {
    return 'source-map';
  }

  return 'cheap-module-source-map';
}
