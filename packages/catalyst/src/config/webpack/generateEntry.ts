import path from 'path';
import Configuration from '../../Configuration';
import { Environment } from '../../Environment';

export default function generateEntry(entryPath: string) {
  const {
    environment,
    overlayEnabled,
    generateServiceWorker,
  } = new Configuration();

  const entry = [];

  if (environment === Environment.Development && overlayEnabled) {
    entry.push(path.resolve(__dirname, '../../../lib/dev-environment'));
    entry.push('catalyst-client');
  }

  entry.push(entryPath);

  if (generateServiceWorker) {
    entry.push(path.resolve(__dirname, '../../../lib/workbox'));
  }

  return entry;
}
