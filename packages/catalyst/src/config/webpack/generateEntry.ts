import path from 'path';
import { Entry } from 'webpack';
import Configuration from '../../Configuration';
import { Environment } from '../../Environment';

export default function generateEntry(
  configuration: Configuration,
  entryPath: string
): Entry {
  const { environment, overlayEnabled, generateServiceWorker } = configuration;

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
