import path from 'path';
import Configuration from '../../Configuration';

const { environment, overlayEnabled } = new Configuration();

export default function generateEntry(entryPath: string) {
  const entry = [];

  if (environment === 'development' && overlayEnabled) {
    entry.push(path.resolve(__dirname, '../../../lib/dev-environment'));
    entry.push('catalyst-client');
  }

  entry.push('regenerator-runtime/runtime');
  entry.push(entryPath);

  return entry;
}
