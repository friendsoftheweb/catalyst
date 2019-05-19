import path from 'path';
import { getEnvironment, getConfig } from '../../utils';

export default function generateEntry(entryPath: string) {
  const environment = getEnvironment();
  const config = getConfig();

  const entry = [];

  if (environment.isDevelopment && config.overlay) {
    entry.push(path.resolve(__dirname, '../../../lib/dev-environment'));
    entry.push('catalyst-client');
  }

  entry.push('regenerator-runtime/runtime');
  entry.push(entryPath);

  return entry;
}
