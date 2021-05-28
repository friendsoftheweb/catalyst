import path from 'path';
import { Entry } from 'webpack';
import Configuration from '../../Configuration';
import { Environment } from '../../Environment';

export default function generateEntry(
  configuration: Configuration,
  entryPath: string
): Entry {
  const { environment, overlayEnabled } = configuration;

  const entry = [];

  if (environment === Environment.Development && overlayEnabled) {
    entry.push(path.resolve(__dirname, '../../../lib/catalyst-client'));
    entry.push('catalyst-client');
  }

  entry.push(entryPath);

  return entry;
}
