import path from 'path';
import Configuration from '../../Configuration';

export default function generateEntry(entryPath: string) {
  const { environment, overlayEnabled } = new Configuration();

  const entry = [];

  if (environment === 'development' && overlayEnabled) {
    entry.push(path.resolve(__dirname, '../../../lib/dev-environment'));
    entry.push('catalyst-client');
  }

  entry.push(entryPath);

  return entry;
}
